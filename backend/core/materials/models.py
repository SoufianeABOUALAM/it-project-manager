from django.db import models
from django.conf import settings
from decimal import Decimal, ROUND_HALF_UP
from django.utils import timezone
import requests
import threading

# EUR to MAD conversion cache
_EUR_MAD_CACHE = {"rate": None, "ts": None}
_EUR_MAD_TTL = 3600  # 1 hour
_FX_URL = "https://api.exchangerate-api.com/v4/latest/EUR"
_lock = threading.Lock()

def _quant2(val: Decimal) -> Decimal:
    return (Decimal(val or 0)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

def _get_eur_mad_rate() -> Decimal:
    now = timezone.now()
    if _EUR_MAD_CACHE["rate"] and _EUR_MAD_CACHE["ts"] and (now - _EUR_MAD_CACHE["ts"]).total_seconds() < _EUR_MAD_TTL:
        return _EUR_MAD_CACHE["rate"]
    try:
        resp = requests.get(_FX_URL, timeout=8)
        resp.raise_for_status()
        data = resp.json()
        rate = data.get("rates", {}).get("MAD")
        if rate is None:
            raise ValueError("MAD rate missing")
        rate_dec = Decimal(str(rate))
        with _lock:
            _EUR_MAD_CACHE["rate"] = rate_dec
            _EUR_MAD_CACHE["ts"] = now
        return rate_dec
    except Exception:
        # Fallback to a default rate if API fails
        return Decimal("10.5")


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Category Name")
    description = models.TextField(blank=True, verbose_name="Description")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Material(models.Model):
    name = models.CharField(max_length=200, unique=True, verbose_name="Material Name")
    description = models.TextField(blank=True, verbose_name="Description")
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='materials')
    
    # Pricing
    price_france = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Price (France - €)")
    price_morocco = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Price (Morocco - MAD)")
    
    # Material Properties
    is_auto_calculated = models.BooleanField(default=False, verbose_name="Auto Calculated")
    is_service = models.BooleanField(default=False, verbose_name="Is Service")
    unit = models.CharField(max_length=20, default="unit", verbose_name="Unit")
    
    # Smart Calculation Fields
    calculation_type = models.CharField(
        max_length=20,
        choices=[
            ('PER_USER', 'Per User (Number of Users)'),
            ('PER_SERVER', 'Per Server'),
            ('PER_PC', 'Per PC (Number of PCs)'),
            ('PER_DEVICE', 'Per Device'),
            ('PER_SWITCH', 'Per Switch'),
            ('FIXED', 'Fixed Amount'),
            ('CONDITIONAL', 'Conditional (Based on Requirements)')
        ],
        default='FIXED',
        verbose_name="Calculation Type"
    )
    
    multiplier = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=1.0,
        help_text="How many units per user/server/project",
        verbose_name="Multiplier"
    )
    
    min_quantity = models.IntegerField(
        default=0,
        help_text="Minimum quantity to add",
        verbose_name="Min Quantity"
    )
    
    max_quantity = models.IntegerField(
        default=999999,
        help_text="Maximum quantity to add",
        verbose_name="Max Quantity"
    )
    
    conditions = models.JSONField(
        default=dict,
        help_text="Calculation conditions (e.g., {'min_users': 50})",
        verbose_name="Conditions"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True, verbose_name="Active")
    
    class Meta:
        ordering = ['category__name', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.category.name})"
    
    def save(self, *args, **kwargs):
        # Auto-convert EUR to MAD if MAD is 0 or not set
        if self.price_france and (not self.price_morocco or self.price_morocco == 0):
            rate = _get_eur_mad_rate()
            self.price_morocco = _quant2(Decimal(self.price_france) * rate)
        
        super().save(*args, **kwargs)
    
    @property
    def price_difference_percentage(self):
        """Calculate price difference between France and Morocco"""
        if self.price_france > 0:
            return ((self.price_morocco - self.price_france) / self.price_france) * 100
        return 0


class PriceHistory(models.Model):
    """Track price changes over time"""
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='price_history')
    old_price_france = models.DecimalField(max_digits=10, decimal_places=2)
    new_price_france = models.DecimalField(max_digits=10, decimal_places=2)
    old_price_morocco = models.DecimalField(max_digits=10, decimal_places=2)
    new_price_morocco = models.DecimalField(max_digits=10, decimal_places=2)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"{self.material.name} - {self.changed_at.strftime('%Y-%m-%d')}"

