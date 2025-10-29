from django.contrib import admin
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


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(GrassType)
class GrassTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'scientific_name', 'created_at']
    search_fields = ['name', 'scientific_name', 'description']
    ordering = ['name']


class WaterTreatmentInline(admin.StackedInline):
    model = WaterTreatment
    extra = 0


class FertilizerTreatmentInline(admin.StackedInline):
    model = FertilizerTreatment
    extra = 0


class ChemicalTreatmentInline(admin.StackedInline):
    model = ChemicalTreatment
    extra = 0


class MowingTreatmentInline(admin.StackedInline):
    model = MowingTreatment
    extra = 0


@admin.register(Plot)
class PlotAdmin(admin.ModelAdmin):
    list_display = ["name", "location", "grass_type", "size_sqft", "created_at"]
    search_fields = ["name", "location", "grass_type"]
    list_filter = ["grass_type", "created_at"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(Treatment)
class TreatmentAdmin(admin.ModelAdmin):
    list_display = ["get_plot_names", "treatment_type", "date", "time", "applied_by"]
    list_filter = ["treatment_type", "date"]
    search_fields = ["plots__name", "notes"]
    date_hierarchy = "date"
    readonly_fields = ["created_at", "updated_at"]
    filter_horizontal = ["plots"]
    inlines = [
        WaterTreatmentInline,
        FertilizerTreatmentInline,
        ChemicalTreatmentInline,
        MowingTreatmentInline,
    ]

    def get_plot_names(self, obj):
        return ", ".join([p.name for p in obj.plots.all()[:3]])
    get_plot_names.short_description = "Plots"


admin.site.register(WaterTreatment)
admin.site.register(FertilizerTreatment)
admin.site.register(ChemicalTreatment)
admin.site.register(MowingTreatment)