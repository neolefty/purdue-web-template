from rest_framework import serializers
from .models import (
    Location,
    GrassType,
    Plot,
    Treatment,
    WaterTreatment,
    FertilizerTreatment,
    ChemicalTreatment,
    MowingTreatment,
)


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'description', 'created_at']


class GrassTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrassType
        fields = ['id', 'name', 'scientific_name', 'description', 'created_at']


class PlotSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.get_full_name", read_only=True)
    treatment_count = serializers.SerializerMethodField()
    parent_plot_name = serializers.CharField(source="parent_plot.name", read_only=True)
    hierarchy_display = serializers.CharField(source="get_hierarchy_display", read_only=True)
    subplot_count = serializers.SerializerMethodField()

    class Meta:
        model = Plot
        fields = [
            "id",
            "name",
            "parent_plot",
            "parent_plot_name",
            "hierarchy_display",
            "location",
            "size_sqft",
            "grass_type",
            "notes",
            "polygon_coordinates",
            "center_lat",
            "center_lng",
            "created_at",
            "updated_at",
            "created_by",
            "created_by_name",
            "treatment_count",
            "subplot_count",
        ]
        read_only_fields = ["created_at", "updated_at", "created_by"]

    def get_treatment_count(self, obj):
        return obj.treatments.count()
    
    def get_subplot_count(self, obj):
        return obj.subplots.count()
    
    def validate(self, data):
        """Validate that coordinates are provided"""
        # Check if this is an update or create
        instance = self.instance
        
        # For updates, merge with existing data
        if instance:
            center_lat = data.get('center_lat', instance.center_lat)
            center_lng = data.get('center_lng', instance.center_lng)
            polygon_coordinates = data.get('polygon_coordinates', instance.polygon_coordinates)
        else:
            center_lat = data.get('center_lat')
            center_lng = data.get('center_lng')
            polygon_coordinates = data.get('polygon_coordinates')
        
        # Require either coordinates OR allow null for both
        has_coords = (center_lat is not None and center_lng is not None) or polygon_coordinates is not None
        
        if not has_coords:
            raise serializers.ValidationError({
                'polygon_coordinates': 'Plot must have map coordinates. Please draw the plot boundary on the map.',
                'center_lat': 'Center coordinates are required.',
                'center_lng': 'Center coordinates are required.'
            })
        
        # Prevent circular references in hierarchy
        parent_plot = data.get('parent_plot')
        if parent_plot and instance:
            if parent_plot == instance:
                raise serializers.ValidationError({
                    'parent_plot': 'A plot cannot be its own parent.'
                })
            
            # Check if parent is a descendant of current plot
            current = parent_plot
            while current:
                if current == instance:
                    raise serializers.ValidationError({
                        'parent_plot': 'Cannot create circular hierarchy. The selected parent is a sub-plot of this plot.'
                    })
                current = current.parent_plot
        
        return data


class WaterTreatmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaterTreatment
        fields = ["amount_inches", "duration_minutes", "method"]


class FertilizerTreatmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FertilizerTreatment
        fields = ["product_name", "npk_ratio", "amount", "amount_unit", "rate_per_1000sqft"]


class ChemicalTreatmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChemicalTreatment
        fields = [
            "chemical_type",
            "product_name",
            "active_ingredient",
            "amount",
            "amount_unit",
            "rate_per_1000sqft",
            "target_pest",
        ]


class MowingTreatmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MowingTreatment
        fields = ["height_inches", "clippings_removed", "mower_type", "pattern"]


class TreatmentSerializer(serializers.ModelSerializer):
    plot_names = serializers.SerializerMethodField()
    applied_by_name = serializers.CharField(source="applied_by.get_full_name", read_only=True)
    water_details = WaterTreatmentSerializer(required=False)
    fertilizer_details = FertilizerTreatmentSerializer(required=False)
    chemical_details = ChemicalTreatmentSerializer(required=False)
    mowing_details = MowingTreatmentSerializer(required=False)

    class Meta:
        model = Treatment
        fields = [
            "id",
            "plots",
            "plot_names",
            "treatment_type",
            "date",
            "time",
            "notes",
            "applied_by",
            "applied_by_name",
            "created_at",
            "updated_at",
            "water_details",
            "fertilizer_details",
            "chemical_details",
            "mowing_details",
        ]
        read_only_fields = ["created_at", "updated_at", "applied_by"]

    def get_plot_names(self, obj):
        return [plot.name for plot in obj.plots.all()]

    def create(self, validated_data):
        water_data = validated_data.pop("water_details", None)
        fertilizer_data = validated_data.pop("fertilizer_details", None)
        chemical_data = validated_data.pop("chemical_details", None)
        mowing_data = validated_data.pop("mowing_details", None)
        plots = validated_data.pop("plots", [])

        treatment = Treatment.objects.create(**validated_data)
        treatment.plots.set(plots)

        if water_data and validated_data["treatment_type"] == "water":
            WaterTreatment.objects.create(treatment=treatment, **water_data)
        elif fertilizer_data and validated_data["treatment_type"] == "fertilizer":
            FertilizerTreatment.objects.create(treatment=treatment, **fertilizer_data)
        elif chemical_data and validated_data["treatment_type"] == "chemical":
            ChemicalTreatment.objects.create(treatment=treatment, **chemical_data)
        elif mowing_data and validated_data["treatment_type"] == "mowing":
            MowingTreatment.objects.create(treatment=treatment, **mowing_data)

        return treatment

    def update(self, instance, validated_data):
        water_data = validated_data.pop("water_details", None)
        fertilizer_data = validated_data.pop("fertilizer_details", None)
        chemical_data = validated_data.pop("chemical_details", None)
        mowing_data = validated_data.pop("mowing_details", None)
        plots = validated_data.pop("plots", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if plots is not None:
            instance.plots.set(plots)

        if water_data and instance.treatment_type == "water":
            WaterTreatment.objects.update_or_create(treatment=instance, defaults=water_data)
        elif fertilizer_data and instance.treatment_type == "fertilizer":
            FertilizerTreatment.objects.update_or_create(treatment=instance, defaults=fertilizer_data)
        elif chemical_data and instance.treatment_type == "chemical":
            ChemicalTreatment.objects.update_or_create(treatment=instance, defaults=chemical_data)
        elif mowing_data and instance.treatment_type == "mowing":
            MowingTreatment.objects.update_or_create(treatment=instance, defaults=mowing_data)

        return instance