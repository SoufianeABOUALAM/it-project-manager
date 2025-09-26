from decimal import Decimal
from rest_framework import serializers
from .models import Project
from calculations.models import ProjectItem


class ProjectListSerializer(serializers.ModelSerializer):
    """Serializer for project list view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    total_items = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'company_name', 'entity', 'number_of_users',
            'status', 'priority', 'progress', 'total_cost_france', 'total_cost_morocco',
            'created_at', 'created_by_username', 'total_items'
        ]
    
    def get_total_items(self, obj):
        """Get total number of items in this project"""
        return ProjectItem.objects.filter(project=obj).count()


class ProjectDetailSerializer(serializers.ModelSerializer):
    """Serializer for project detail view"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    total_items = serializers.SerializerMethodField()
    budget_breakdown = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'company_name', 'entity', 'number_of_users',
            'num_laptop_office', 'num_laptop_tech', 'num_desktop_office', 'num_desktop_tech',
            'num_printers', 'num_traceau', 'num_videoconference', 'visio_type', 'num_aps',
            'num_switch_24', 'num_switch_48', 'local_apps', 'local_apps_list', 'file_server',
            'site_addresses', 'gps_coordinates', 'internet_line_type', 'internet_line_speed',
            'status', 'priority', 'progress', 'start_date', 'end_date',
            'total_cost_france', 'total_cost_morocco', 'created_at', 'updated_at',
            'created_by_username', 'total_items', 'budget_breakdown'
        ]
    
    def get_total_items(self, obj):
        """Get total number of items in this project"""
        return ProjectItem.objects.filter(project=obj).count()
    
    def get_budget_breakdown(self, obj):
        """Get budget breakdown by category"""
        from calculations.services import ProjectCalculator
        calculator = ProjectCalculator()
        return calculator.get_budget_breakdown(obj)


class ProjectCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new projects"""
    
    class Meta:
        model = Project
        fields = [
            'name', 'company_name', 'entity', 'number_of_users',
            'num_laptop_office', 'num_laptop_tech', 'num_desktop_office', 'num_desktop_tech',
            'num_printers', 'num_traceau', 'num_videoconference', 'visio_type', 'num_aps',
            'num_switch_24', 'num_switch_48', 'local_apps', 'local_apps_list', 'file_server',
            'site_addresses', 'gps_coordinates', 'internet_line_type', 'internet_line_speed',
            'status', 'priority', 'progress', 'start_date', 'end_date'
        ]
    
    def create(self, validated_data):
        """Create project and calculate budget"""
        project = super().create(validated_data)
        
        # Calculate budget after creation
        from calculations.services import ProjectCalculator
        calculator = ProjectCalculator()
        calculator.save_project_budget(project)
        
        return project


class ProjectUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating projects"""
    
    class Meta:
        model = Project
        fields = [
            'name', 'company_name', 'entity', 'number_of_users',
            'num_laptop_office', 'num_laptop_tech', 'num_desktop_office', 'num_desktop_tech',
            'num_printers', 'num_traceau', 'num_videoconference', 'visio_type', 'num_aps',
            'num_switch_24', 'num_switch_48', 'local_apps', 'local_apps_list', 'file_server',
            'site_addresses', 'gps_coordinates', 'internet_line_type', 'internet_line_speed',
            'status', 'priority', 'progress', 'start_date', 'end_date'
        ]
    
    def update(self, instance, validated_data):
        """Update project and recalculate budget"""
        project = super().update(instance, validated_data)
        
        # Recalculate budget after update
        from calculations.services import ProjectCalculator
        calculator = ProjectCalculator()
        calculator.save_project_budget(project)
        
        return project