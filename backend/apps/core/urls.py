"""
URLs for core app
"""
from django.urls import re_path
from .views import ReactAppView

app_name = 'core'

urlpatterns = [
    # Catch-all pattern for React Router
    # This should be the last pattern in the main urlpatterns
    re_path(r'^.*$', ReactAppView.as_view(), name='react-app'),
]