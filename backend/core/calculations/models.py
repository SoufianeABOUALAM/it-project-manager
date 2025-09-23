from django.db import models
from projects.models import Project
from materials.models import Material


class ProjectItem(models.Model):
    """Individual items in a project budget"""
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='items')
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    quantity = models.IntegerField(verbose_name="Quantity")
    is_auto_calculated = models.BooleanField(default=False, verbose_name="Auto Calculated")
    
    # Calculated costs
    unit_cost_france = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Unit Cost (France)")
    unit_cost_morocco = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Unit Cost (Morocco)")
    total_cost_france = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Total Cost (France)")
    total_cost_morocco = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Total Cost (Morocco)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['project', 'material']
        ordering = ['material__category__name', 'material__name']
    
    def __str__(self):
        return f"{self.project.name} - {self.material.name} ({self.quantity})"
    
    def save(self, *args, **kwargs):
        # Auto-calculate costs when saving
        self.unit_cost_france = self.material.price_france
        self.unit_cost_morocco = self.material.price_morocco
        self.total_cost_france = self.quantity * self.material.price_france
        self.total_cost_morocco = self.quantity * self.material.price_morocco
        super().save(*args, **kwargs)


class CalculationRule(models.Model):
    """Rules for automatic calculations"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    formula = models.TextField(help_text="Python expression for calculation")
    target_material = models.ForeignKey(Material, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} -> {self.target_material.name}"

