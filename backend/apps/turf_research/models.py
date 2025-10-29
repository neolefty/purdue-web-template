"""
Turf Research Plot Treatment Tracking Models
"""
from django.db import models
from django.conf import settings


class Location(models.Model):
    """Master list of research locations"""
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class GrassType(models.Model):
    """Master list of grass types"""
    name = models.CharField(max_length=100, unique=True)
    scientific_name = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Plot(models.Model):
    """Research plot for turf studies"""
    name = models.CharField(max_length=100, unique=True)
    parent_plot = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subplots',
        help_text="Parent plot if this is a sub-plot"
    )
    location = models.CharField(max_length=200, blank=True)
    size_sqft = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Plot size in square feet"
    )
    grass_type = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    polygon_coordinates = models.JSONField(
        null=True, blank=True,
        help_text="GeoJSON polygon coordinates for map display"
    )
    center_lat = models.DecimalField(
        max_digits=11, decimal_places=8,
        null=True, blank=True,
        help_text="Center latitude for map display"
    )
    center_lng = models.DecimalField(
        max_digits=12, decimal_places=8,
        null=True, blank=True,
        help_text="Center longitude for map display"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="plots_created"
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        if self.parent_plot:
            return f"{self.parent_plot.name} > {self.name}"
        return self.name
    
    def get_all_subplots(self):
        """Recursively get all subplots"""
        subplots = list(self.subplots.all())
        for subplot in list(subplots):
            subplots.extend(subplot.get_all_subplots())
        return subplots
    
    def get_hierarchy_display(self):
        """Get full hierarchy path"""
        path = [self.name]
        current = self.parent_plot
        while current:
            path.insert(0, current.name)
            current = current.parent_plot
        return " > ".join(path)


class Treatment(models.Model):
    """Base class for all treatment types"""
    TREATMENT_TYPES = [
        ("water", "Water"),
        ("fertilizer", "Fertilizer"),
        ("chemical", "Chemical"),
        ("mowing", "Mowing"),
    ]

    plots = models.ManyToManyField(
        Plot, related_name="treatments",
        help_text="Plots this treatment was applied to"
    )
    treatment_type = models.CharField(max_length=20, choices=TREATMENT_TYPES)
    date = models.DateField()
    time = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    applied_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="treatments_applied"
    )

    class Meta:
        ordering = ["-date", "-time"]
        indexes = [
            models.Index(fields=["treatment_type", "date"]),
        ]

    def __str__(self):
        plot_names = ", ".join([p.name for p in self.plots.all()[:3]])
        if self.plots.count() > 3:
            plot_names += f" (+{self.plots.count() - 3} more)"
        return f"{plot_names} - {self.get_treatment_type_display()} on {self.date}"


class WaterTreatment(models.Model):
    """Water/irrigation treatment details"""
    treatment = models.OneToOneField(
        Treatment, on_delete=models.CASCADE, related_name="water_details"
    )
    amount_inches = models.DecimalField(
        max_digits=5, decimal_places=2,
        help_text="Water amount in inches"
    )
    duration_minutes = models.IntegerField(
        null=True, blank=True,
        help_text="Duration in minutes"
    )
    method = models.CharField(
        max_length=50, blank=True,
        help_text="Irrigation method (e.g., sprinkler, drip)"
    )

    def __str__(self):
        return f"Water: {self.amount_inches} inches"


class FertilizerTreatment(models.Model):
    """Fertilizer application details"""
    treatment = models.OneToOneField(
        Treatment, on_delete=models.CASCADE, related_name="fertilizer_details"
    )
    product_name = models.CharField(max_length=200)
    npk_ratio = models.CharField(
        max_length=20, blank=True,
        help_text="N-P-K ratio (e.g., 20-10-10)"
    )
    amount = models.DecimalField(
        max_digits=10, decimal_places=2,
        help_text="Amount applied"
    )
    amount_unit = models.CharField(
        max_length=20, default="lbs",
        help_text="Unit (e.g., lbs, oz, kg)"
    )
    rate_per_1000sqft = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Application rate per 1000 sq ft"
    )

    def __str__(self):
        return f"Fertilizer: {self.product_name}"


class ChemicalTreatment(models.Model):
    """Chemical treatment (pesticide, herbicide, fungicide) details"""
    CHEMICAL_TYPES = [
        ("herbicide", "Herbicide"),
        ("insecticide", "Insecticide"),
        ("fungicide", "Fungicide"),
        ("growth_regulator", "Growth Regulator"),
        ("other", "Other"),
    ]

    treatment = models.OneToOneField(
        Treatment, on_delete=models.CASCADE, related_name="chemical_details"
    )
    chemical_type = models.CharField(max_length=20, choices=CHEMICAL_TYPES)
    product_name = models.CharField(max_length=200)
    active_ingredient = models.CharField(max_length=200, blank=True)
    amount = models.DecimalField(
        max_digits=10, decimal_places=2,
        help_text="Amount applied"
    )
    amount_unit = models.CharField(
        max_length=20, default="oz",
        help_text="Unit (e.g., oz, lbs, ml, gal)"
    )
    rate_per_1000sqft = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Application rate per 1000 sq ft"
    )
    target_pest = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.get_chemical_type_display()}: {self.product_name}"


class MowingTreatment(models.Model):
    """Mowing treatment details"""
    treatment = models.OneToOneField(
        Treatment, on_delete=models.CASCADE, related_name="mowing_details"
    )
    height_inches = models.DecimalField(
        max_digits=4, decimal_places=2,
        help_text="Mowing height in inches"
    )
    clippings_removed = models.BooleanField(default=False)
    mower_type = models.CharField(
        max_length=50, blank=True,
        help_text="Type of mower used"
    )
    pattern = models.CharField(
        max_length=50, blank=True,
        help_text="Mowing pattern or direction"
    )

    def __str__(self):
        return f"Mowing: {self.height_inches} inches"