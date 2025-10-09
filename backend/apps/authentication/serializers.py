"""
Serializers for authentication app
"""

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user details
    """

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "is_staff",
            "is_superuser",
            "is_email_verified",
            "date_joined",
            "last_login",
        )
        read_only_fields = ("id", "date_joined", "last_login")

    def update(self, instance, validated_data):
        """
        Override update to add validation for is_email_verified changes.
        Only staff/superuser can modify is_email_verified, and only for other users.
        """
        # Check if is_email_verified is being changed
        if "is_email_verified" in validated_data:
            request = self.context.get("request")

            # Security checks
            if not request or not request.user:
                raise serializers.ValidationError(
                    {"is_email_verified": "Authentication required to modify verification."}
                )

            # Only staff/superuser can modify email verification
            if not (request.user.is_staff or request.user.is_superuser):
                raise serializers.ValidationError(
                    {"is_email_verified": "Only administrators can modify verification."}
                )

            # Users cannot verify themselves
            if request.user.id == instance.id:
                raise serializers.ValidationError(
                    {"is_email_verified": "You cannot modify your own email verification status."}
                )

        return super().update(instance, validated_data)


class LoginSerializer(serializers.Serializer):
    """
    Serializer for username/email and password login
    """

    username_or_email = serializers.CharField(
        label="Username or Email", help_text="Enter your username or email address"
    )
    password = serializers.CharField(style={"input_type": "password"})

    def validate(self, attrs):
        username_or_email = attrs.get("username_or_email")
        password = attrs.get("password")

        if username_or_email and password:
            # First try to authenticate assuming it's a username
            user = authenticate(username=username_or_email, password=password)

            if not user:
                # If that fails, check if it's an email and try to authenticate
                # with the associated username
                if "@" in username_or_email:  # Likely an email
                    try:
                        user_obj = User.objects.get(email=username_or_email)
                        user = authenticate(username=user_obj.username, password=password)
                    except User.DoesNotExist:
                        pass

            if not user:
                raise serializers.ValidationError(
                    "Invalid username/email or password. Please try again."
                )

            if not user.is_active:
                raise serializers.ValidationError(
                    "Your account has been disabled. Please contact support."
                )

            # Check email verification if required
            from django.conf import settings

            if settings.REQUIRE_EMAIL_VERIFICATION and not user.is_email_verified:
                raise serializers.ValidationError(
                    "Please verify your email address before logging in. "
                    "Check your email for the verification link."
                )

            attrs["user"] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include "username_or_email" and "password"')


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "password_confirm", "first_name", "last_name")
        extra_kwargs = {
            "username": {
                "error_messages": {
                    "unique": "This username is already taken. Please choose a different one."
                }
            },
            "email": {
                "error_messages": {"unique": "An account with this email address already exists."}
            },
        }

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {
                    "password_confirm": (
                        "Passwords do not match. " "Please make sure both passwords are the same."
                    )
                }
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        user = User.objects.create_user(**validated_data)
        return user


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change
    """

    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for password reset request
    """

    email = serializers.EmailField()

    def validate_email(self, value):
        # We don't want to reveal if an email exists or not for security
        # So we always return success even if the email doesn't exist
        return value


class EmailVerificationSerializer(serializers.Serializer):
    """
    Serializer for email verification with token
    """

    token = serializers.CharField(required=True)

    def validate_token(self, value):
        from .models import EmailVerificationToken

        try:
            token_obj = EmailVerificationToken.objects.get(token=value)
            if not token_obj.is_valid():
                raise serializers.ValidationError(
                    "This verification link has expired or been used."
                )
            self.context["token_obj"] = token_obj
            return value
        except EmailVerificationToken.DoesNotExist:
            raise serializers.ValidationError("Invalid verification link.")


class ResendVerificationSerializer(serializers.Serializer):
    """
    Serializer for resending verification email
    """

    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
            if user.is_email_verified:
                raise serializers.ValidationError("This email is already verified.")
            self.context["user"] = user
            return value
        except User.DoesNotExist:
            # Don't reveal if email exists or not for security
            raise serializers.ValidationError(
                "If an account with that email exists and is unverified, "
                "a verification email has been sent."
            )


class AdminUserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for admin to create users with role assignments.
    Users are created without passwords and must set them via email reset.
    """

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "is_staff",
            "is_superuser",
        )

    def create(self, validated_data):
        # Create user without password
        user = User.objects.create(**validated_data)
        user.set_unusable_password()
        # Auto-verify email since admin is creating the user and providing the email
        # The password reset email will confirm they have access to the inbox
        user.is_email_verified = True
        user.save()

        # Send password reset email
        from django.conf import settings
        from django.contrib.auth.tokens import default_token_generator
        from django.core.mail import send_mail
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode

        # Generate password reset token
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        # Build reset URL - adjust domain as needed
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

        # Send email
        subject = "Welcome - Set Your Password"
        message = f"""
Hello {user.first_name or user.username},

An account has been created for you. Please set your password by clicking the link below:

{reset_url}

This link will expire in 24 hours.

If you did not expect this email, please ignore it.

Best regards,
The {settings.SITE_NAME} Team
        """

        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            # Log the error but don't fail user creation
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send password reset email to {user.email}: {e}")

        return user
