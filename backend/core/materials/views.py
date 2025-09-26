from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import api_view, permission_classes
from accounts.permissions import IsAdminOrSuperAdmin
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.db import transaction
from .models import Category, Material, PriceHistory
from .serializers import (
    CategorySerializer, MaterialSerializer, MaterialListSerializer,
    MaterialUpdateSerializer, PriceHistorySerializer
)
from calculations.services import MaterialManager, ProjectCalculator
from projects.models import Project


class MaterialPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class CategoryListCreateView(APIView):
    """List and create categories (Admin only)"""
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]
    
    def get(self, request):
        """Get all categories"""
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Create new category"""
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetailView(APIView):
    """Retrieve, update or delete a category (Admin only)"""
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]
    
    def get(self, request, pk):
        """Get category details"""
        category = get_object_or_404(Category, pk=pk)
        serializer = CategorySerializer(category)
        return Response(serializer.data)
    
    def put(self, request, pk):
        """Update category"""
        category = get_object_or_404(Category, pk=pk)
        serializer = CategorySerializer(category, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Delete category"""
        category = get_object_or_404(Category, pk=pk)
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MaterialListCreateView(APIView):
    """List and create materials (Admin only)"""
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]
    pagination_class = MaterialPagination
    
    def get(self, request):
        """Get all materials with optional filtering"""
        materials = Material.objects.select_related('category')
        
        # Apply filters
        category = request.query_params.get('category', None)
        search = request.query_params.get('search', None)
        is_auto = request.query_params.get('is_auto_calculated', None)
        is_service = request.query_params.get('is_service', None)
        is_active = request.query_params.get('is_active', None)
        
        if category:
            materials = materials.filter(category__name=category)
        
        if search:
            materials = materials.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search)
            )
        
        if is_auto is not None:
            materials = materials.filter(is_auto_calculated=is_auto.lower() == 'true')
        
        if is_service is not None:
            materials = materials.filter(is_service=is_service.lower() == 'true')
        
        if is_active is not None:
            materials = materials.filter(is_active=is_active.lower() == 'true')
        
        # Apply pagination
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(materials, request)
        
        if page is not None:
            serializer = MaterialListSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = MaterialListSerializer(materials, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Create new material"""
        serializer = MaterialSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MaterialDetailView(APIView):
    """Retrieve, update or delete a material (Admin only)"""
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]
    
    def get(self, request, pk):
        """Get material details"""
        material = get_object_or_404(Material, pk=pk)
        serializer = MaterialSerializer(material)
        return Response(serializer.data)
    
    def put(self, request, pk):
        """Update material"""
        material = get_object_or_404(Material, pk=pk)
        serializer = MaterialUpdateSerializer(
            material, 
            data=request.data, 
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            response_serializer = MaterialSerializer(material)
            return Response(response_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, pk):
        """Partially update material"""
        material = get_object_or_404(Material, pk=pk)
        serializer = MaterialUpdateSerializer(
            material, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            response_serializer = MaterialSerializer(material)
            return Response(response_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Delete material"""
        material = get_object_or_404(Material, pk=pk)
        material.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MaterialPriceHistoryView(APIView):
    """Get material price history (Admin only)"""
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]
    
    def get(self, request, pk):
        """Get price history for a material"""
        material = get_object_or_404(Material, pk=pk)
        history = PriceHistory.objects.filter(material=material).order_by('-changed_at')
        serializer = PriceHistorySerializer(history, many=True)
        return Response(serializer.data)


class MaterialBulkUpdateView(APIView):
    """Bulk update material prices (Admin only)"""
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]
    
    def post(self, request):
        """Bulk update material prices"""
        updates = request.data.get('updates', [])
        reason = request.data.get('reason', 'Bulk update')
        
        updated_materials = []
        errors = []
        
        for update in updates:
            material_id = update.get('material_id')
            new_price_france = update.get('price_france')
            new_price_morocco = update.get('price_morocco')
            
            try:
                material = Material.objects.get(pk=material_id)
                
                # Track old prices
                old_price_france = material.price_france
                old_price_morocco = material.price_morocco
                
                # Update prices
                if new_price_france is not None:
                    material.price_france = new_price_france
                if new_price_morocco is not None:
                    material.price_morocco = new_price_morocco
                
                material.save()
                
                # Create price history
                if (old_price_france != material.price_france or 
                    old_price_morocco != material.price_morocco):
                    PriceHistory.objects.create(
                        material=material,
                        old_price_france=old_price_france,
                        new_price_france=material.price_france,
                        old_price_morocco=old_price_morocco,
                        new_price_morocco=material.price_morocco,
                        changed_by=request.user,
                        reason=reason
                    )
                
                updated_materials.append(material)
                
            except Material.DoesNotExist:
                errors.append(f"Material with ID {material_id} not found")
            except Exception as e:
                errors.append(f"Error updating material {material_id}: {str(e)}")
        
        return Response({
            'updated_count': len(updated_materials),
            'errors': errors,
            'updated_materials': MaterialSerializer(updated_materials, many=True).data
        })


class MaterialSetupView(APIView):
    """Setup default materials and categories (Admin only)"""
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]
    
    def post(self, request):
        """Create default categories and materials"""
        try:
            # Create default categories
            MaterialManager.create_default_categories()
            
            # Create default materials
            MaterialManager.create_default_materials()
            
            return Response({
                'message': 'Default categories and materials created successfully',
                'categories_count': Category.objects.count(),
                'materials_count': Material.objects.count()
            })
        except Exception as e:
            return Response(
                {'error': f'Error setting up materials: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MaterialBulkCreateView(APIView):
    """Bulk create materials (Admin only)"""
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]
    
    def post(self, request):
        """Bulk create materials from provided data"""
        materials_data = request.data.get('materials', [])
        
        if not materials_data:
            return Response(
                {'error': 'No materials data provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            results = MaterialManager.manage_materials(materials_data)
            
            return Response({
                'message': 'Materials processed successfully',
                'created': results['created'],
                'updated': results['updated'],
                'moved': results['moved'],
                'errors': results['errors'],
                'total_materials': Material.objects.count()
            })
        except Exception as e:
            return Response(
                {'error': f'Error processing materials: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MaterialSetupRequiredView(APIView):
    """Setup required materials for project form (Admin only)"""
    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]
    
    def post(self, request):
        """Setup all required materials for the project form"""
        # try:
        #     # Import the setup function
        #     import sys
        #     import os
        #     sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        #     from setup_missing_materials import add_missing_materials
        #     
        #     # Run the setup
        #     add_missing_materials()
        #     
        #     return Response({
        #         'message': 'Required materials setup completed successfully',
        #         'total_materials': Material.objects.count()
        #     })
        # except Exception as e:
        #     return Response(
        #         {'error': f'Error setting up required materials: {str(e)}'}, 
        #         status=status.HTTP_500_INTERNAL_SERVER_ERROR
        #     )
        return Response({
            'message': 'Materials setup disabled - materials already configured',
            'total_materials': Material.objects.count()
        })


# Additional functions for custom material system
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminOrSuperAdmin])
def add_custom_material(request):
    """Add a custom material to a category"""
    try:
        data = request.data
        
        # Validate required fields
        required_fields = ['name', 'category', 'price_france', 'price_morocco']
        for field in required_fields:
            if field not in data:
                return Response(
                    {'error': f'Missing required field: {field}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Check if material already exists
        if Material.objects.filter(name=data['name']).exists():
            return Response(
                {'error': 'Material with this name already exists'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get category
        try:
            category = Category.objects.get(id=data['category'])
        except Category.DoesNotExist:
            return Response(
                {'error': 'Category not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create material
        material = Material.objects.create(
            name=data['name'],
            description=data.get('description', ''),
            category=category,
            price_france=data['price_france'],
            price_morocco=data['price_morocco'],
            unit=data.get('unit', 'unit'),
            is_auto_calculated=False,  # Custom materials are not auto-calculated
            is_service=data.get('is_service', False),
            # Smart calculation fields
            calculation_type=data.get('calculation_type', 'FIXED'),
            multiplier=data.get('multiplier', 1.0),
            min_quantity=data.get('min_quantity', 0),
            max_quantity=data.get('max_quantity', 999999),
            conditions=data.get('conditions', {})
        )
        
        serializer = MaterialSerializer(material)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminOrSuperAdmin])
def delete_custom_material(request, material_id):
    """Delete a custom material (only non-static materials)"""
    try:
        material = Material.objects.get(id=material_id)
        
        # Check if material is static (auto-calculated) - don't allow deletion
        if material.is_auto_calculated:
            return Response(
                {'error': 'Cannot delete static/auto-calculated materials'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if material is used in any projects and handle cascading deletion
        from calculations.models import ProjectItem
        from projects.models import Project
        
        project_items = ProjectItem.objects.filter(material=material).select_related('project')
        affected_projects = []
        
        if project_items.exists():
            # Get project names that use this material
            project_names = [item.project.name for item in project_items]
            project_count = len(project_names)
            
            # Delete all project items that use this material
            deleted_items_count = project_items.count()
            project_items.delete()
            
            # Recalculate budgets for affected projects
            from calculations.services import ProjectCalculator
            calculator = ProjectCalculator()
            
            for project in Project.objects.filter(items__material=material).distinct():
                try:
                    calculator.save_project_budget(project)
                    affected_projects.append(project.name)
                except Exception as e:
                    # Log error but continue with deletion
                    print(f"Error recalculating budget for project {project.name}: {str(e)}")
            
            # Prepare success message with cascade information
            if project_count == 1:
                cascade_msg = f'Material was also removed from project "{project_names[0]}" and its budget was recalculated.'
            else:
                project_list = ', '.join(f'"{name}"' for name in project_names[:3])
                if project_count > 3:
                    project_list += f' and {project_count - 3} other project(s)'
                cascade_msg = f'Material was also removed from {project_count} projects: {project_list} and their budgets were recalculated.'
        else:
            cascade_msg = ''
        
        material_name = material.name
        material.delete()
        
        # Prepare success message
        success_message = f'Material "{material_name}" has been deleted successfully'
        if cascade_msg:
            success_message += f' {cascade_msg}'
        
        return Response({
            'message': success_message,
            'cascade_info': {
                'affected_projects': affected_projects,
                'deleted_items_count': deleted_items_count if 'deleted_items_count' in locals() else 0
            }
        }, status=status.HTTP_200_OK)
        
    except Material.DoesNotExist:
        return Response(
            {'error': 'Material not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recalculate_project_budget(request, project_id):
    """Recalculate project budget after adding custom materials"""
    try:
        project = Project.objects.get(id=project_id)
        
        # Recalculate budget using the ProjectCalculator
        calculator = ProjectCalculator()
        project_items, total_france, total_morocco = calculator.save_project_budget(project)
        
        return Response({
            'message': 'Budget recalculated successfully',
            'total_france': float(total_france),
            'total_morocco': float(total_morocco),
            'items_count': len(project_items)
        })
        
    except Project.DoesNotExist:
        return Response(
            {'error': 'Project not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def setup_default_materials(request):
    """Create default materials and categories if they don't exist"""
    try:
        from calculations.services import MaterialManager
        
        print("Setting up default materials...")
        
        # Create default categories
        MaterialManager.create_default_categories()
        print("Default categories created")
        
        # Create default materials
        MaterialManager.create_default_materials()
        print("Default materials created")
        
        # Count created items
        total_categories = Category.objects.count()
        total_materials = Material.objects.count()
        
        print(f"Total categories: {total_categories}, Total materials: {total_materials}")
        
        return Response({
            'message': 'Default materials and categories created successfully',
            'total_categories': total_categories,
            'total_materials': total_materials
        })
        
    except Exception as e:
        print(f"Error in setup_default_materials: {str(e)}")
        return Response(
            {'error': f'Failed to setup default materials: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_materials_status(request):
    """Check if materials and categories exist in database"""
    try:
        total_categories = Category.objects.count()
        total_materials = Material.objects.count()
        
        categories = list(Category.objects.values_list('name', flat=True))
        materials = list(Material.objects.values_list('name', flat=True))
        
        return Response({
            'total_categories': total_categories,
            'total_materials': total_materials,
            'categories': categories,
            'materials': materials[:10],  # First 10 materials
            'status': 'ok' if total_materials > 0 else 'empty'
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_materials_by_category(request, category_id):
    """Get all materials in a specific category"""
    try:
        category = Category.objects.get(id=category_id)
        materials = Material.objects.filter(category=category, is_active=True)
        serializer = MaterialSerializer(materials, many=True)
        return Response(serializer.data)
    except Category.DoesNotExist:
        return Response(
            {'error': 'Category not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


