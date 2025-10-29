from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LocationViewSet, GrassTypeViewSet, PlotViewSet, TreatmentViewSet

router = DefaultRouter()
router.register(r"locations", LocationViewSet)
router.register(r"grass-types", GrassTypeViewSet)
router.register(r"plots", PlotViewSet)
router.register(r"treatments", TreatmentViewSet)

urlpatterns = [
    path("", include(router.urls)),
]