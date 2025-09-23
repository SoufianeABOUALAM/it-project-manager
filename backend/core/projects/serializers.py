from decimal import Decimal
from rest_framework import serializers
from .models import (
    Project,
    ProjectNetworkItem,
    ProjectServerItem,
    ProjectUserDeviceItem,
    ProjectSoftwareItem,
    ProjectServiceItem,
    InfrastructureEquipment,
    ProjectInfrastructureItem,
    Service,
    VisioEquipment,
    ProjectVisioItem,
)


def _iter_all_items(project):
    """Yield all item instances for a project with a category tag."""
    for item in project.projectnetworkitem_set.select_related('equipment').all():
        yield 'network', item
    for item in project.projectserveritem_set.select_related('equipment').all():
        yield 'server', item
    for item in project.projectuserdeviceitem_set.select_related('equipment').all():
        yield 'user_device', item
    for item in project.projectsoftwareitem_set.select_related('equipment').all():
        yield 'software', item
    for item in project.projectserviceitem_set.select_related('equipment').all():
        yield 'service', item


class ProjectLineItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    category = serializers.CharField()
    equipment_id = serializers.IntegerField()
    equipment_name = serializers.CharField()
    quantity = serializers.IntegerField()
    source = serializers.CharField()
    unit_cost_france = serializers.DecimalField(max_digits=12, decimal_places=2)
    unit_cost_morocco = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_cost_france = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_cost_morocco = serializers.DecimalField(max_digits=14, decimal_places=2)


class ProjectListSerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()
    number_of_user_devices = serializers.SerializerMethodField()
    total_cost_france = serializers.SerializerMethodField()
    total_cost_morocco = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            'id', 'name', 'company_name', 'entity',
            'start_date', 'end_date', 'number_of_users',
            'pc_type', 'num_laptop_office', 'num_laptop_tech',
            'num_desktop_office', 'num_desktop_tech',
            'num_printers', 'num_traceau', 'num_videoconference', 'num_aps',
            'local_apps', 'local_apps_list', 'file_server',
            'site_addresses', 'gps_coordinates',
            'internet_line_type', 'internet_line_speed',
            'visio_type', 'status', 'priority', 'progress',
            'items_count', 'number_of_user_devices',
            'total_cost_france', 'total_cost_morocco',
            'created_by', 'created_at', 'updated_at',
        )

    def get_created_by(self, obj):
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'username': obj.created_by.username,
                'email': obj.created_by.email,
                'role': obj.created_by.role,
                'is_admin': obj.created_by.is_admin
            }
        return None

    def get_items_count(self, obj):
        return sum(1 for _ in _iter_all_items(obj))

    def get_number_of_user_devices(self, obj):
        # Calculate from direct project fields instead of relationship table
        total = (
            (obj.num_laptop_office or 0) +
            (obj.num_laptop_tech or 0) +
            (obj.num_desktop_office or 0) +
            (obj.num_desktop_tech or 0) +
            (obj.num_printers or 0) +
            (obj.num_traceau or 0) +
            (obj.num_videoconference or 0)
        )
        return total

    def _sum_cost(self, obj, field_name):
        total = Decimal('0')
        for _, item in _iter_all_items(obj):
            equipment = getattr(item, 'equipment', None)
            if not equipment:
                continue
            cost = getattr(equipment, field_name, None) or Decimal('0')
            qty = item.quantity or 0
            total += cost * qty
        return total

    def get_total_cost_france(self, obj):
        # Use the stored budget value from database
        return obj.total_cost_france or Decimal('0')

    def get_total_cost_morocco(self, obj):
        # Use the stored budget value from database
        return obj.total_cost_morocco or Decimal('0')


class ProjectDetailSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    total_cost_france = serializers.SerializerMethodField()
    total_cost_morocco = serializers.SerializerMethodField()
    number_of_user_devices = serializers.SerializerMethodField()
    created_by = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            'id', 'name', 'company_name', 'entity',
            'start_date', 'end_date', 'number_of_users',
            'pc_type', 'num_laptop_office', 'num_laptop_tech',
            'num_desktop_office', 'num_desktop_tech',
            'num_printers', 'num_traceau', 'num_videoconference', 'num_aps',
            'local_apps', 'local_apps_list', 'file_server',
            'site_addresses', 'gps_coordinates',
            'internet_line_type', 'internet_line_speed',
            'visio_type', 'status', 'priority', 'progress',
            'created_by', 'created_at', 'updated_at',
            'number_of_user_devices',
            'total_cost_france', 'total_cost_morocco',
            'items',
        )
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at', 'total_cost_france', 'total_cost_morocco', 'items')

    def get_created_by(self, obj):
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'username': obj.created_by.username,
                'email': obj.created_by.email,
                'role': obj.created_by.role,
                'is_admin': obj.created_by.is_admin
            }
        return None

    def get_items(self, obj):
        out = []
        for category, item in _iter_all_items(obj):
            eq = getattr(item, 'equipment', None)
            unit_fr = getattr(eq, 'fixed_cost_eur', Decimal('0')) if eq else Decimal('0')
            unit_ma = getattr(eq, 'fixed_cost_mad', Decimal('0')) if eq else Decimal('0')
            qty = item.quantity or 0
            out.append({
                'id': item.id,
                'category': category,
                'equipment_id': getattr(eq, 'id', None),
                'equipment_name': getattr(eq, 'name', None),
                'quantity': qty,
                'source': item.source,
                'unit_cost_france': unit_fr,
                'unit_cost_morocco': unit_ma,
                'total_cost_france': unit_fr * qty,
                'total_cost_morocco': unit_ma * qty,
            })
        return ProjectLineItemSerializer(out, many=True).data

    def get_total_cost_france(self, obj):
        # Use the stored budget value from database
        return obj.total_cost_france or Decimal('0')

    def get_total_cost_morocco(self, obj):
        # Use the stored budget value from database
        return obj.total_cost_morocco or Decimal('0')

    def get_number_of_user_devices(self, obj):
        # Calculate from direct project fields instead of relationship table
        total = (
            (obj.num_laptop_office or 0) +
            (obj.num_laptop_tech or 0) +
            (obj.num_desktop_office or 0) +
            (obj.num_desktop_tech or 0) +
            (obj.num_printers or 0) +
            (obj.num_traceau or 0) +
            (obj.num_videoconference or 0)
        )
        return total


class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = (
            'id', 'name', 'company_name', 'entity',
            'start_date', 'end_date', 'number_of_users',
            'pc_type', 'num_laptop_office', 'num_laptop_tech',
            'num_desktop_office', 'num_desktop_tech',
            'num_printers', 'num_traceau', 'num_videoconference', 'num_aps',
            'local_apps', 'local_apps_list', 'file_server',
            'site_addresses', 'gps_coordinates',
            'internet_line_type', 'internet_line_speed',
            'visio_type', 'status', 'priority', 'progress',
            'total_cost_france', 'total_cost_morocco', 'created_by'
        )
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at', 'total_cost_france', 'total_cost_morocco')

    def create(self, validated_data):
        # Remove budget fields from validated_data as they will be calculated
        validated_data.pop('total_cost_france', None)
        validated_data.pop('total_cost_morocco', None)
        
        project = Project.objects.create(**validated_data)
        
        # Calculate and save budget
        from calculations.services import ProjectCalculator
        calculator = ProjectCalculator()
        calculator.save_project_budget(project)
        
        return project


class ProjectUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = (
            'name', 'company_name', 'entity',
            'start_date', 'end_date', 'number_of_users',
            'pc_type', 'num_laptop_office', 'num_laptop_tech',
            'num_desktop_office', 'num_desktop_tech',
            'num_printers', 'num_traceau', 'num_videoconference', 'num_aps',
            'local_apps', 'local_apps_list', 'file_server',
            'site_addresses', 'gps_coordinates',
            'internet_line_type', 'internet_line_speed',
            'visio_type', 'status', 'priority', 'progress',
            'total_cost_france', 'total_cost_morocco', 'created_by'
        )
        read_only_fields = ('created_by', 'created_at', 'updated_at', 'total_cost_france', 'total_cost_morocco')

    def update(self, instance, validated_data):
        # Remove budget fields from validated_data as they will be recalculated
        validated_data.pop('total_cost_france', None)
        validated_data.pop('total_cost_morocco', None)
        
        # Preserve the original creator - don't allow changing created_by
        validated_data.pop('created_by', None)
        
        for k, v in validated_data.items():
            setattr(instance, k, v)
        instance.save()
        
        # Recalculate and save budget
        from calculations.services import ProjectCalculator
        calculator = ProjectCalculator()
        calculator.save_project_budget(instance)
        
        return instance


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'


class InfrastructureEquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = InfrastructureEquipment
        fields = '__all__'


class ProjectInfrastructureItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectInfrastructureItem
        fields = '__all__'


class VisioEquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisioEquipment
        fields = '__all__'


class ProjectVisioItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectVisioItem
        fields = '__all__'