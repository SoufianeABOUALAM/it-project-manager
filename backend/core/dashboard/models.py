from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class DashboardCache(models.Model):
    """Cache for dashboard statistics to improve performance"""
    cache_key = models.CharField(max_length=100, unique=True)
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Dashboard Cache: {self.cache_key}"
