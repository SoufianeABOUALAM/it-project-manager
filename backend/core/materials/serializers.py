from rest_framework import serializers
from .models import Category, Material, PriceHistory


class CategorySerializer(serializers.ModelSerializer):
    materials_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'materials_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_materials_count(self, obj):
        return obj.materials.filter(is_active=True).count()


class MaterialSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    price_difference_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = Material
        fields = [
            'id', 'name', 'description', 'category', 'category_name',
            'price_france', 'price_morocco', 'price_difference_percentage',
            'is_auto_calculated', 'is_service', 'unit',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'price_difference_percentage']
    
    def validate(self, data):
        """Validate material data"""
        # Validate prices
        if data['price_france'] < 0 or data['price_morocco'] < 0:
            raise serializers.ValidationError("Prices cannot be negative")
        
        return data


class MaterialListSerializer(serializers.ModelSerializer):
    """Simplified serializer for material lists"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category = serializers.SerializerMethodField()
    
    class Meta:
        model = Material
        fields = [
            'id', 'name', 'description', 'category', 'category_name', 'price_france', 'price_morocco',
            'is_auto_calculated', 'is_service', 'unit', 'is_active'
        ]
    
    def get_category(self, obj):
        """Return category object with id and name"""
        return {
            'id': obj.category.id,
            'name': obj.category.name
        }


class PriceHistorySerializer(serializers.ModelSerializer):
    material_name = serializers.CharField(source='material.name', read_only=True)
    changed_by_username = serializers.CharField(source='changed_by.username', read_only=True)
    
    class Meta:
        model = PriceHistory
        fields = [
            'id', 'material', 'material_name', 'old_price_france', 'new_price_france',
            'old_price_morocco', 'new_price_morocco', 'changed_by', 'changed_by_username',
            'changed_at', 'reason'
        ]
        read_only_fields = ['id', 'changed_at']


class MaterialUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating material prices with history tracking"""
    reason = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = Material
        fields = [
            'name', 'description', 'category', 'price_france', 'price_morocco',
            'is_auto_calculated', 'is_service', 'unit', 'is_active', 'reason'
        ]
    
    def update(self, instance, validated_data):
        """Update material and track price changes"""
        reason = validated_data.pop('reason', '')
        
        # Track price changes
        old_price_france = instance.price_france
        old_price_morocco = instance.price_morocco
        
        # Update material
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Create price history if prices changed
        if (old_price_france != instance.price_france or 
            old_price_morocco != instance.price_morocco):
            PriceHistory.objects.create(
                material=instance,
                old_price_france=old_price_france,
                new_price_france=instance.price_france,
                old_price_morocco=old_price_morocco,
                new_price_morocco=instance.price_morocco,
                changed_by=self.context['request'].user if 'request' in self.context else None,
                reason=reason
            )
        
        return instance

