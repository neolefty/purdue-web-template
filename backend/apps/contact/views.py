"""
Views for contact app
"""

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.views import APIView

from .serializers import ContactMessageSerializer


class ContactRateThrottle(AnonRateThrottle):
    """
    Custom throttle for contact form submissions.
    Limits anonymous users to prevent spam.
    """

    scope = "contact"


class ContactView(APIView):
    """
    API view for contact form submissions.
    Open to all users (no authentication required).
    """

    permission_classes = [AllowAny]
    throttle_classes = [ContactRateThrottle, UserRateThrottle]

    def post(self, request):
        """Handle contact form submission"""
        serializer = ContactMessageSerializer(data=request.data, context={"request": request})

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Thank you for your message. We will get back to you soon."},
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
