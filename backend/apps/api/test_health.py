"""Basic health check test to verify test setup works."""

from rest_framework import status
from rest_framework.test import APITestCase


class HealthCheckTestCase(APITestCase):
    """Test the health check endpoint."""

    def test_health_check_returns_ok(self):
        """Test that health check endpoint returns 200 OK."""
        url = "/api/health/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "healthy")
        self.assertIn("database", response.data)
        self.assertIn("django_version", response.data)
        self.assertIn("python_version", response.data)
        self.assertTrue(response.data["database"]["connected"])
