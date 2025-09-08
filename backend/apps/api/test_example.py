"""
Example tests demonstrating common testing patterns for Django REST APIs.

This file shows how to test:
- Authentication
- CRUD operations
- Permissions
- Data validation
"""

from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthenticationTestCase(APITestCase):
    """Test authentication endpoints."""

    def setUp(self):
        """Create test user."""
        self.user_data = {
            "email": "test@purdue.edu",
            "password": "TestPass123!",
            "first_name": "Test",
            "last_name": "User",
        }
        self.user = User.objects.create_user(
            username="testuser",
            email=self.user_data["email"],
            password=self.user_data["password"],
            first_name=self.user_data["first_name"],
            last_name=self.user_data["last_name"],
        )

    def test_login_with_valid_credentials(self):
        """Test login with correct credentials."""
        url = "/api/auth/login/"
        data = {"email": self.user_data["email"], "password": self.user_data["password"]}
        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("user", response.data)
        self.assertIn("message", response.data)
        self.assertEqual(response.data["user"]["email"], self.user_data["email"])

    def test_login_with_invalid_credentials(self):
        """Test login with incorrect password."""
        url = "/api/auth/login/"
        data = {"email": self.user_data["email"], "password": "WrongPassword"}
        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_new_user(self):
        """Test user registration."""
        url = "/api/auth/register/"
        data = {
            "username": "newuser",
            "email": "newuser@purdue.edu",
            "password": "NewPass123!",
            "password_confirm": "NewPass123!",
            "first_name": "New",
            "last_name": "User",
        }
        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="newuser").exists())

    def test_get_current_user_authenticated(self):
        """Test getting current user info when authenticated."""
        # First login (session-based auth)
        login_url = "/api/auth/login/"
        login_data = {"email": self.user_data["email"], "password": self.user_data["password"]}
        login_response = self.client.post(login_url, login_data, format="json")

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        # Then get user info (session should be active)
        url = "/api/auth/user/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.user_data["email"])

    def test_get_current_user_unauthenticated(self):
        """Test getting current user info when not authenticated."""
        url = "/api/auth/user/"
        response = self.client.get(url)

        # Should return 403 Forbidden for session auth
        self.assertIn(
            response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
        )


class ExampleModelTestCase(APITestCase):
    """
    Example test case for a hypothetical model.

    This demonstrates how you would test CRUD operations
    for your own models. Replace 'Item' with your actual model.
    """

    def setUp(self):
        """Set up test user and authenticate."""
        self.user = User.objects.create_user(
            username="testuser", email="testuser@purdue.edu", password="TestPass123!"
        )
        # Login with session auth
        login_url = "/api/auth/login/"
        login_response = self.client.post(
            login_url, {"email": "testuser@purdue.edu", "password": "TestPass123!"}, format="json"
        )
        # Session should be active after login
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

    def test_create_item(self):
        """Test creating a new item (example)."""
        # This is a placeholder - replace with your actual endpoint
        # url = '/api/items/'
        # data = {
        #     'name': 'Test Item',
        #     'description': 'Test Description'
        # }
        # response = self.client.post(url, data, format='json')
        #
        # self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # self.assertEqual(response.data['name'], 'Test Item')
        pass

    def test_list_items(self):
        """Test listing items (example)."""
        # This is a placeholder - replace with your actual endpoint
        # url = '/api/items/'
        # response = self.client.get(url)
        #
        # self.assertEqual(response.status_code, status.HTTP_200_OK)
        # self.assertIsInstance(response.data, list)
        pass

    def test_update_item(self):
        """Test updating an item (example)."""
        # This is a placeholder - replace with your actual endpoint
        # First create an item, then update it
        # create_url = '/api/items/'
        # item = self.client.post(create_url, {'name': 'Original'}, format='json')
        #
        # update_url = f'/api/items/{item.data["id"]}/'
        # updated_data = {'name': 'Updated'}
        # response = self.client.patch(update_url, updated_data, format='json')
        #
        # self.assertEqual(response.status_code, status.HTTP_200_OK)
        # self.assertEqual(response.data['name'], 'Updated')
        pass

    def test_delete_item(self):
        """Test deleting an item (example)."""
        # This is a placeholder - replace with your actual endpoint
        # First create an item, then delete it
        # create_url = '/api/items/'
        # item = self.client.post(create_url, {'name': 'To Delete'}, format='json')
        #
        # delete_url = f'/api/items/{item.data["id"]}/'
        # response = self.client.delete(delete_url)
        #
        # self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        pass


class PermissionTestCase(APITestCase):
    """Test permission-based access control."""

    def test_unauthenticated_cannot_access_protected_endpoint(self):
        """Test that unauthenticated users cannot access protected endpoints."""
        # Example: trying to access user profile without auth
        url = "/api/auth/user/"
        response = self.client.get(url)

        # Should return 403 Forbidden for session auth
        self.assertIn(
            response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
        )

    def test_authenticated_can_access_protected_endpoint(self):
        """Test that authenticated users can access protected endpoints."""
        # Create and login user
        User.objects.create_user(
            username="authtest", email="authtest@purdue.edu", password="TestPass123!"
        )
        login_response = self.client.post(
            "/api/auth/login/",
            {"email": "authtest@purdue.edu", "password": "TestPass123!"},
            format="json",
        )
        # Verify login was successful
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        # Access protected endpoint with session auth
        response = self.client.get("/api/auth/user/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
