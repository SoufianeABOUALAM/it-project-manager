from decimal import Decimal
from rest_framework import viewsets, serializers, status, permissions, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from .services import ProjectItemGenerator
from django.http import HttpResponse
from .exporters import ExcelExporter
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone
import os
import posixpath

from .models import (
    Project,
    NetworkEquipment,
    ServerEquipment,
    UserDevice,
    SoftwareLicense,
    Service,
    InfrastructureEquipment,
    VisioEquipment,
    ProjectNetworkItem,
    ProjectServerItem,
    ProjectUserDeviceItem,
    ProjectSoftwareItem,
    ProjectServiceItem,
    ProjectInfrastructureItem,
    ProjectVisioItem,
)
from .serializers import (
    ProjectListSerializer,
    ProjectDetailSerializer,
    ProjectCreateSerializer,
    ProjectUpdateSerializer,
    InfrastructureEquipmentSerializer,
    VisioEquipmentSerializer,
    ProjectInfrastructureItemSerializer,
    ProjectVisioItemSerializer,
)


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


# Simple ModelSerializers for equipments and project items
class NetworkEquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = NetworkEquipment
        fields = '__all__'


class ServerEquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServerEquipment
        fields = '__all__'


class UserDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDevice
        fields = '__all__'


class SoftwareLicenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = SoftwareLicense
        fields = '__all__'


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'


class ProjectNetworkItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectNetworkItem
        fields = '__all__'


class ProjectServerItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectServerItem
        fields = '__all__'


class ProjectUserDeviceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectUserDeviceItem
        fields = '__all__'


class ProjectSoftwareItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectSoftwareItem
        fields = '__all__'


class ProjectServiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectServiceItem
        fields = '__all__'


# Generic viewsets for equipment and items (CRUD)
class EquipmentBaseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'supplier']


class NetworkEquipmentViewSet(EquipmentBaseViewSet):
    queryset = NetworkEquipment.objects.all()
    serializer_class = NetworkEquipmentSerializer
    search_fields = ['name', 'supplier', 'equipment_type']


class ServerEquipmentViewSet(EquipmentBaseViewSet):
    queryset = ServerEquipment.objects.all()
    serializer_class = ServerEquipmentSerializer


class UserDeviceViewSet(EquipmentBaseViewSet):
    queryset = UserDevice.objects.all()
    serializer_class = UserDeviceSerializer


class SoftwareLicenseViewSet(EquipmentBaseViewSet):
    queryset = SoftwareLicense.objects.all()
    serializer_class = SoftwareLicenseSerializer


class ServiceViewSet(EquipmentBaseViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


class InfrastructureEquipmentViewSet(EquipmentBaseViewSet):
    queryset = InfrastructureEquipment.objects.all()
    serializer_class = InfrastructureEquipmentSerializer
    search_fields = ['name', 'supplier', 'infra_type']


class VisioEquipmentViewSet(EquipmentBaseViewSet):
    queryset = VisioEquipment.objects.all()
    serializer_class = VisioEquipmentSerializer
    search_fields = ['name', 'supplier', 'visio_type']


class ProjectItemBaseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['project__name', 'equipment__name']


class ProjectNetworkItemViewSet(ProjectItemBaseViewSet):
    queryset = ProjectNetworkItem.objects.all()
    serializer_class = ProjectNetworkItemSerializer


class ProjectServerItemViewSet(ProjectItemBaseViewSet):
    queryset = ProjectServerItem.objects.all()
    serializer_class = ProjectServerItemSerializer


class ProjectUserDeviceItemViewSet(ProjectItemBaseViewSet):
    queryset = ProjectUserDeviceItem.objects.all()
    serializer_class = ProjectUserDeviceItemSerializer


class ProjectSoftwareItemViewSet(ProjectItemBaseViewSet):
    queryset = ProjectSoftwareItem.objects.all()
    serializer_class = ProjectSoftwareItemSerializer


class ProjectServiceItemViewSet(ProjectItemBaseViewSet):
    queryset = ProjectServiceItem.objects.all()
    serializer_class = ProjectServiceItemSerializer


class ProjectInfrastructureItemViewSet(ProjectItemBaseViewSet):
    queryset = ProjectInfrastructureItem.objects.all()
    serializer_class = ProjectInfrastructureItemSerializer


class ProjectVisioItemViewSet(ProjectItemBaseViewSet):
    queryset = ProjectVisioItem.objects.all()
    serializer_class = ProjectVisioItemSerializer


# Project viewset: owner / admin restrictions + use your custom serializers
class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'company_name', 'entity', 'status']
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        print(f"DEBUG: User: {user.username}")
        print(f"DEBUG: User role: {getattr(user, 'role', None)}")
        print(f"DEBUG: Is staff: {user.is_staff}")
        print(f"DEBUG: Is superuser: {user.is_superuser}")
        
        # allow admins to see all projects
        if getattr(user, 'role', None) in ['admin', 'super_admin'] or user.is_staff or user.is_superuser:
            projects = Project.objects.all()
            print(f"DEBUG: Returning all projects: {projects.count()}")
            return projects
        projects = Project.objects.filter(created_by=user)
        print(f"DEBUG: Returning user projects: {projects.count()}")
        return projects
    
    def get_object(self):
        """
        Override get_object to allow admins to access any project
        """
        obj = super().get_object()
        user = self.request.user
        
        # Allow admins to access any project
        if getattr(user, 'role', None) in ['admin', 'super_admin'] or user.is_staff or user.is_superuser:
            return obj
            
        # For non-admins, check if they created the project
        if obj.created_by != user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You don't have permission to access this project.")
        
        return obj
    
    @action(detail=True, methods=['get'], url_path='export-excel')
    def export_excel(self, request, pk=None):
        project = self.get_object()
        exporter = ExcelExporter()
        excel_buffer = exporter.generate_project_excel(project)

        # If save=1, save to MEDIA_ROOT/exports/projects and return JSON
        save_flag = request.query_params.get("save", "0").lower() in ("1", "true", "yes")
        if save_flag:
            filename = f"budget_{slugify(project.name)}_{project.pk}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
            export_dir = os.path.join(settings.MEDIA_ROOT, "exports", "projects")
            os.makedirs(export_dir, exist_ok=True)
            file_path = os.path.join(export_dir, filename)
            with open(file_path, "wb") as f:
                f.write(excel_buffer.getvalue())

            file_url = None
            if getattr(settings, "MEDIA_URL", None):
                file_url = request.build_absolute_uri(
                    posixpath.join(settings.MEDIA_URL.rstrip("/"), "exports/projects", filename)
                )
            return Response({"saved": True, "path": file_path, "url": file_url})

        # Default behavior: download the file
        response = HttpResponse(
            excel_buffer.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = f'attachment; filename="budget_{slugify(project.name)}_{project.pk}.xlsx"'
        return response

    def get_serializer_class(self):
        if self.action == 'list':
            return ProjectListSerializer
        if self.action in ['retrieve']:
            return ProjectDetailSerializer
        if self.action == 'create':
            return ProjectCreateSerializer
        if self.action in ['update', 'partial_update']:
            return ProjectUpdateSerializer
        return ProjectDetailSerializer

    def create(self, request, *args, **kwargs):
        """
        Override create to ensure proper response serialization
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project = serializer.save(created_by=request.user)
        
        # Return a simple response to avoid accessing related objects
        response_data = {
            'id': project.id,
            'name': project.name,
            'company_name': project.company_name,
            'entity': project.entity,
            'status': project.status,
            'priority': project.priority,
            'progress': project.progress,
            'created_at': project.created_at,
        }
        return Response(response_data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        project = serializer.save(created_by=self.request.user)
        # Ensure project is saved and has a primary key
        project.refresh_from_db()
        # Disable auto-generation for now - let frontend handle budget calculation
        # autogen = self.request.query_params.get("autogen", "1") != "0"
        # if autogen:
        #     ProjectItemGenerator().generate(project, replace=False)


    @action(detail=True, methods=['post'], url_path='generate-items')
    def generate_items(self, request, pk=None):
        project = self.get_object()
        replace = request.data.get("replace", False) in (True, "1", "true", "True")
        result = ProjectItemGenerator().generate(project, replace=replace)
        return Response({"project_id": project.id, **result})

    # convenience endpoint to recalculate budget (keeps old behavior)
    @action(detail=True, methods=['post'], url_path='recalculate')
    def recalculate(self, request, pk=None):
        project = self.get_object()
        from calculations.services import ProjectCalculator  # local import to avoid circulars
        calculator = ProjectCalculator()
        calculator.save_project_budget(project)
        return Response(ProjectDetailSerializer(project, context={'request': request}).data)

    @action(detail=True, methods=['get'], url_path='budget')
    def budget(self, request, pk=None):
        project = self.get_object()
        from calculations.services import ProjectCalculator
        calculator = ProjectCalculator()
        breakdown = calculator.get_budget_breakdown(project)
        data = {
            'project_id': project.id,
            'project_name': project.name,
            'total_cost_france': getattr(project, 'total_cost_france', None),
            'total_cost_morocco': getattr(project, 'total_cost_morocco', None),
            'budget_breakdown': breakdown,
        }
        return Response(data)

    @action(detail=True, methods=['get'], url_path='financial-details')
    def financial_details(self, request, pk=None):
        """
        Get detailed financial breakdown by category
        """
        project = self.get_object()
        from .budget_calculator import ProjectBudgetCalculator
        
        calculator = ProjectBudgetCalculator()
        breakdown = calculator.calculate_detailed_budget(project)
        
        # Calculate totals
        total_france = sum(cat['france'] for cat in breakdown.values())
        total_morocco = sum(cat['morocco'] for cat in breakdown.values())
        total_items = sum(cat['items'] for cat in breakdown.values())
        
        # Calculate cost per user
        cost_per_user_france = total_france / project.number_of_users if project.number_of_users > 0 else 0
        cost_per_user_morocco = total_morocco / project.number_of_users if project.number_of_users > 0 else 0
        
        data = {
            'project_id': project.id,
            'project_name': project.name,
            'number_of_users': project.number_of_users,
            'totals': {
                'france': float(total_france),
                'morocco': float(total_morocco),
                'items': total_items,
                'cost_per_user_france': float(cost_per_user_france),
                'cost_per_user_morocco': float(cost_per_user_morocco),
            },
            'breakdown': {
                'user_devices': {
                    'france': float(breakdown['user_devices']['france']),
                    'morocco': float(breakdown['user_devices']['morocco']),
                    'items': breakdown['user_devices']['items']
                },
                'network_equipment': {
                    'france': float(breakdown['network_equipment']['france']),
                    'morocco': float(breakdown['network_equipment']['morocco']),
                    'items': breakdown['network_equipment']['items']
                },
                'server_equipment': {
                    'france': float(breakdown['server_equipment']['france']),
                    'morocco': float(breakdown['server_equipment']['morocco']),
                    'items': breakdown['server_equipment']['items']
                },
                'infrastructure_equipment': {
                    'france': float(breakdown['infrastructure_equipment']['france']),
                    'morocco': float(breakdown['infrastructure_equipment']['morocco']),
                    'items': breakdown['infrastructure_equipment']['items']
                },
                'software_licenses': {
                    'france': float(breakdown['software_licenses']['france']),
                    'morocco': float(breakdown['software_licenses']['morocco']),
                    'items': breakdown['software_licenses']['items']
                },
                'services': {
                    'france': float(breakdown['services']['france']),
                    'morocco': float(breakdown['services']['morocco']),
                    'items': breakdown['services']['items']
                },
            }
        }
        return Response(data)