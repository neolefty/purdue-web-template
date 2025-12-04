"""
Views for authentication app
"""

import logging

from django.conf import settings
from django.contrib.auth import login, logout
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import EmailVerificationToken, User
from .serializers import (
    AdminUserCreateSerializer,
    EmailVerificationSerializer,
    LoginSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    ResendVerificationSerializer,
    UserSerializer,
)

logger = logging.getLogger(__name__)


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """
    Get or update current user information
    """

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login endpoint for email/password authentication
    """
    if settings.AUTH_METHOD == "saml":
        return Response(
            {"error": "Email login is disabled. Please use SAML SSO."},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data["user"]
        login(request, user)
        user_serializer = UserSerializer(user)
        return Response({"user": user_serializer.data, "message": "Login successful"})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    """
    Registration endpoint for email/password authentication
    """
    # Debug logging - sanitize sensitive data
    logger.info(f"Register request from {request.META.get('REMOTE_ADDR')}")
    logger.info(
        f"Request headers: Host={request.META.get('HTTP_HOST')}, "
        f"Origin={request.META.get('HTTP_ORIGIN')}"
    )
    # Log request data without sensitive fields
    safe_data = {k: v for k, v in request.data.items() if k not in ["password", "password_confirm"]}
    logger.info(f"Request data (sanitized): {safe_data}")
    logger.info(f"AUTH_METHOD: {settings.AUTH_METHOD}")

    if settings.AUTH_METHOD == "saml":
        return Response(
            {"error": "Registration is disabled. Please use SAML SSO."},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()

        # Handle email verification
        if settings.REQUIRE_EMAIL_VERIFICATION:
            # Create verification token
            token = EmailVerificationToken.create_for_user(user)

            # Build verification URL
            verification_url = f"{settings.FRONTEND_URL}/verify-email/{token.token}/"

            # Send verification email
            from apps.core.email import send_templated_email

            send_templated_email(
                "verification",
                user.email,
                {
                    "name": user.first_name or user.username,
                    "username": user.username,
                    "verification_url": verification_url,
                },
                fail_silently=True,
            )

            # Don't log user in, return message about verification
            user_serializer = UserSerializer(user)
            return Response(
                {
                    "user": user_serializer.data,
                    "message": (
                        "Registration successful. "
                        "Please check your email to verify your account."
                    ),
                    "requires_verification": True,
                },
                status=status.HTTP_201_CREATED,
            )
        else:
            # Auto-verify and log in
            user.is_email_verified = True
            user.save()
            login(request, user)
            user_serializer = UserSerializer(user)
            return Response(
                {"user": user_serializer.data, "message": "Registration successful"},
                status=status.HTTP_201_CREATED,
            )
    logger.error(f"Registration validation failed: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout endpoint - clears session and ensures cookies are deleted
    """
    logout(request)
    response = Response({"message": "Logout successful"})

    # Delete session cookie to ensure clean logout
    # Using getattr with defaults for cleaner code
    response.delete_cookie(
        key=settings.SESSION_COOKIE_NAME,
        path=getattr(settings, "SESSION_COOKIE_PATH", "/"),
        domain=getattr(settings, "SESSION_COOKIE_DOMAIN", None),
    )

    # Delete CSRF cookie for complete cleanup
    response.delete_cookie(
        key=settings.CSRF_COOKIE_NAME,
        path=getattr(settings, "CSRF_COOKIE_PATH", "/"),
        domain=getattr(settings, "CSRF_COOKIE_DOMAIN", None),
    )

    return response


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """
    Change password endpoint
    """
    if settings.AUTH_METHOD == "saml":
        return Response(
            {"error": "Password change is not available for SAML users."},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = PasswordChangeSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data["new_password"])
        user.save()
        return Response({"message": "Password changed successfully"})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_request_view(request):
    """
    Request password reset - sends email with reset link
    """
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data["email"]

        # Try to find user with this email
        try:
            user = User.objects.get(email=email)

            # Generate reset token and uid
            from django.contrib.auth.tokens import default_token_generator
            from django.utils.encoding import force_bytes
            from django.utils.http import urlsafe_base64_encode

            from apps.core.email import send_templated_email

            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            # Build reset URL
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

            # Send email
            send_templated_email(
                "password_reset",
                user.email,
                {
                    "name": user.first_name or user.username,
                    "username": user.username,
                    "reset_url": reset_url,
                },
                fail_silently=True,
            )

        except User.DoesNotExist:
            # Don't reveal that the email doesn't exist
            logger.info(f"Password reset requested for non-existent email: {email}")

        # Always return success to prevent email enumeration
        return Response(
            {
                "message": (
                    "If an account with that email exists, " "a password reset link has been sent."
                )
            }
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_confirm_view(request):
    """
    Confirm password reset with token
    """
    from django.contrib.auth.tokens import default_token_generator
    from django.utils.http import urlsafe_base64_decode

    uid = request.data.get("uid")
    token = request.data.get("token")
    new_password = request.data.get("new_password")

    if not all([uid, token, new_password]):
        return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Decode the user ID
        uid = urlsafe_base64_decode(uid).decode()
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({"error": "Invalid reset link"}, status=status.HTTP_400_BAD_REQUEST)

    # Check if token is valid
    if not default_token_generator.check_token(user, token):
        return Response(
            {"error": "Invalid or expired reset link"}, status=status.HTTP_400_BAD_REQUEST
        )

    # Set the new password
    user.set_password(new_password)
    user.save()

    return Response({"message": "Password reset successful"})


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_email_view(request):
    """
    Verify email address with token
    """
    serializer = EmailVerificationSerializer(data=request.data)
    if serializer.is_valid():
        token_obj = serializer.context["token_obj"]
        user = token_obj.user

        # Mark email as verified
        user.is_email_verified = True
        user.save()

        # Mark token as used
        token_obj.is_used = True
        token_obj.save()

        logger.info(f"Email verified for user {user.username}")

        return Response({"message": "Email verified successfully"})

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def resend_verification_view(request):
    """
    Resend email verification link
    """
    serializer = ResendVerificationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.context.get("user")

        if user:
            # Create new verification token
            token = EmailVerificationToken.create_for_user(user)

            # Build verification URL
            verification_url = f"{settings.FRONTEND_URL}/verify-email/{token.token}/"

            # Send email
            from apps.core.email import send_templated_email

            send_templated_email(
                "verification",
                user.email,
                {
                    "name": user.first_name or user.username,
                    "username": user.username,
                    "verification_url": verification_url,
                },
                fail_silently=True,
            )

        # Always return success to prevent email enumeration
        return Response(
            {
                "message": (
                    "If an account with that email exists and is unverified, "
                    "a verification email has been sent."
                )
            }
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([AllowAny])
def auth_config_view(request):
    """
    Get authentication configuration
    """
    return Response(
        {
            "auth_method": settings.AUTH_METHOD,
            "saml_login_url": "/saml/login/" if settings.AUTH_METHOD == "saml" else None,
            "allow_registration": settings.AUTH_METHOD != "saml",
            "require_email_verification": settings.REQUIRE_EMAIL_VERIFICATION,
        }
    )


# SAML Views (placeholders - would need full implementation)
@csrf_exempt
def saml_login_view(request):
    """
    Initiate SAML login
    """
    if settings.AUTH_METHOD != "saml":
        return redirect("/api/auth/login/")

    # In production, this would redirect to Purdue's SAML IdP
    # For now, redirect to a placeholder
    return redirect("https://www.purdue.edu/apps/account/cas/login")


@csrf_exempt
def saml_acs_view(request):
    """
    SAML Assertion Consumer Service
    """
    # This would process the SAML response
    # For now, just redirect to frontend
    return redirect("/")


@csrf_exempt
def saml_metadata_view(request):
    """
    SAML metadata endpoint
    """
    # This would return the SP metadata XML
    # Placeholder for now
    from django.http import HttpResponse

    return HttpResponse("<EntityDescriptor>...</EntityDescriptor>", content_type="text/xml")


class UserListView(generics.ListCreateAPIView):
    """
    List all users or create a new user (admin only)
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AdminUserCreateSerializer
        return UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        user_serializer = UserSerializer(user)
        headers = self.get_success_headers(user_serializer.data)
        return Response(user_serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a specific user (admin only)
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user == request.user:
            return Response(
                {"error": "You cannot delete your own account"}, status=status.HTTP_400_BAD_REQUEST
            )
        if user.is_superuser:
            return Response(
                {"error": "Cannot delete superuser accounts"}, status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)
