"""
API views
"""

import sys

from django.conf import settings
from django.db import connection

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckView(APIView):
    """
    Health check endpoint for monitoring
    """

    permission_classes = [AllowAny]

    def get(self, request):
        """
        Check application health
        """
        health_status = {
            "status": "healthy",
            "database": self._check_database(),
            "django_version": self._get_django_version(),
            "python_version": sys.version,
            "auth_method": settings.AUTH_METHOD,
            "debug_mode": settings.DEBUG,
        }

        # Determine overall health
        if not health_status["database"]["connected"]:
            health_status["status"] = "unhealthy"

        return Response(health_status)

    def _check_database(self):
        """
        Check database connectivity
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            return {
                "connected": True,
                "engine": settings.DATABASES["default"]["ENGINE"],
            }
        except Exception as e:
            return {
                "connected": False,
                "error": str(e),
                "engine": settings.DATABASES["default"]["ENGINE"],
            }

    def _get_django_version(self):
        """
        Get Django version
        """
        import django

        return django.get_version()
