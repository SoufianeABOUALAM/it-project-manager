from rest_framework import serializers
from .models import DashboardCache


class DashboardCacheSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardCache
        fields = ['cache_key', 'data', 'created_at', 'expires_at']
