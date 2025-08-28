"""
URLs for API app
"""

from django.urls import include, path

from rest_framework.routers import DefaultRouter

from .views import HealthCheckView

app_name = "api"

router = DefaultRouter()
# Register your viewsets here
# Example: router.register(r'items', ItemViewSet)

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health-check"),
    path("", include(router.urls)),
]
