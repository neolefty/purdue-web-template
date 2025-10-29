from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Location, GrassType, Plot, Treatment
from .serializers import LocationSerializer, GrassTypeSerializer, PlotSerializer, TreatmentSerializer


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class GrassTypeViewSet(viewsets.ModelViewSet):
    queryset = GrassType.objects.all()
    serializer_class = GrassTypeSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'scientific_name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class PlotViewSet(viewsets.ModelViewSet):
    queryset = Plot.objects.select_related('parent_plot').all()
    serializer_class = PlotSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["parent_plot"]
    search_fields = ["name", "location", "grass_type"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter to show only parent plots or all plots
        parent_only = self.request.query_params.get('parent_only', None)
        if parent_only == 'true':
            queryset = queryset.filter(parent_plot__isnull=True)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def treatment_history(self, request, pk=None):
        """Get treatment history for a specific plot"""
        plot = self.get_object()
        treatments = plot.treatments.select_related(
            "applied_by", "water_details", "fertilizer_details", 
            "chemical_details", "mowing_details"
        ).prefetch_related("plots").all()
        serializer = TreatmentSerializer(treatments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def subplots(self, request, pk=None):
        """Get all subplots for a plot"""
        plot = self.get_object()
        subplots = plot.subplots.all()
        serializer = PlotSerializer(subplots, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def hierarchy(self, request, pk=None):
        """Get complete hierarchy including parent and all descendants"""
        plot = self.get_object()
        
        # Get parent chain
        parents = []
        current = plot.parent_plot
        while current:
            parents.insert(0, PlotSerializer(current).data)
            current = current.parent_plot
        
        # Get all descendants
        descendants = plot.get_all_subplots()
        
        return Response({
            'parents': parents,
            'current': PlotSerializer(plot).data,
            'subplots': PlotSerializer(plot.subplots.all(), many=True).data,
            'all_descendants': PlotSerializer(descendants, many=True).data,
        })


class TreatmentViewSet(viewsets.ModelViewSet):
    queryset = Treatment.objects.select_related(
        "applied_by", "water_details", "fertilizer_details", "chemical_details", "mowing_details"
    ).prefetch_related("plots").all()
    serializer_class = TreatmentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["treatment_type", "date"]
    search_fields = ["plots__name", "notes"]
    ordering_fields = ["date", "time"]
    ordering = ["-date", "-time"]

    def get_queryset(self):
        queryset = super().get_queryset()
        plot_id = self.request.query_params.get('plot', None)
        if plot_id:
            queryset = queryset.filter(plots__id=plot_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(applied_by=self.request.user)