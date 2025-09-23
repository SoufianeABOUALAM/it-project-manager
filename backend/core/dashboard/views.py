from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q, Avg
from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
import json

from accounts.models import User
from projects.models import Project, ProjectNetworkItem, ProjectServerItem, ProjectUserDeviceItem, ProjectInfrastructureItem, ProjectVisioItem
from materials.models import Material, Category
from calculations.models import ProjectItem
from .models import DashboardCache


class DashboardStatsView(APIView):
    """Real-time dashboard statistics API"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get comprehensive dashboard statistics"""
        try:
            print(f"Dashboard API called by user: {request.user.username}, role: {getattr(request.user, 'role', 'no role')}")
            
            # Check if user is admin for full stats
            user_role = getattr(request.user, 'role', 'user')
            if not (user_role in ['admin', 'super_admin'] or request.user.is_staff):
                print("User not authorized")
                return Response(
                    {'error': 'Admin privileges required'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            print("User authorized, calculating stats...")
            
            # Calculate real-time statistics (skip caching for now)
            print("Calculating real-time statistics...")
            stats = self.calculate_dashboard_stats()
            print("Stats calculated successfully")
            
            return Response(stats)
            
        except Exception as e:
            print(f"Error in dashboard API: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Failed to fetch dashboard stats: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def calculate_dashboard_stats(self):
        """Calculate comprehensive dashboard statistics"""
        try:
            print("Starting dashboard stats calculation...")
            
            # Basic counts first
            total_users = User.objects.count()
            total_projects = Project.objects.count()
            total_materials = Material.objects.filter(is_active=True).count()
            total_categories = Category.objects.count()
            
            print(f"Basic counts - Users: {total_users}, Projects: {total_projects}, Materials: {total_materials}, Categories: {total_categories}")
            
            # User Statistics
            active_users = User.objects.filter(is_active=True).count()
            admin_users = User.objects.filter(role__in=['admin', 'super_admin']).count()
            
            # Project Statistics (using date fields instead of status)
            today = timezone.now().date()
            
            # Active projects: have start_date and no end_date, or end_date is in the future
            active_projects = Project.objects.filter(
                models.Q(start_date__lte=today) & 
                (models.Q(end_date__isnull=True) | models.Q(end_date__gte=today))
            ).count()
            
            # Completed projects: have end_date in the past
            completed_projects = Project.objects.filter(end_date__lt=today).count()
            
            # Draft projects: no start_date set
            draft_projects = Project.objects.filter(start_date__isnull=True).count()
            
            # Real Financial Statistics from ProjectItem calculations
            from calculations.models import ProjectItem
            
            # Calculate total project costs
            total_cost_france = ProjectItem.objects.aggregate(
                total=Sum('total_cost_france')
            )['total'] or 0
            
            total_cost_morocco = ProjectItem.objects.aggregate(
                total=Sum('total_cost_morocco')
            )['total'] or 0
            
            # Average project cost
            avg_project_cost_france = ProjectItem.objects.aggregate(
                avg=Avg('total_cost_france')
            )['avg'] or 0
            
            avg_project_cost_morocco = ProjectItem.objects.aggregate(
                avg=Avg('total_cost_morocco')
            )['avg'] or 0
            
            # Equipment Statistics
            total_network_equipment = sum([
                ProjectNetworkItem.objects.aggregate(total=Sum('quantity'))['total'] or 0,
                ProjectServerItem.objects.aggregate(total=Sum('quantity'))['total'] or 0,
                ProjectUserDeviceItem.objects.aggregate(total=Sum('quantity'))['total'] or 0,
                ProjectInfrastructureItem.objects.aggregate(total=Sum('quantity'))['total'] or 0,
                ProjectVisioItem.objects.aggregate(total=Sum('quantity'))['total'] or 0
            ])
            
            # Most used equipment types
            most_used_network = ProjectNetworkItem.objects.values('equipment__name').annotate(
                total_quantity=Sum('quantity')
            ).order_by('-total_quantity')[:5]
            
            most_used_servers = ProjectServerItem.objects.values('equipment__name').annotate(
                total_quantity=Sum('quantity')
            ).order_by('-total_quantity')[:5]
            
            # Project timeline analytics
            projects_this_month = Project.objects.filter(
                created_at__gte=timezone.now().replace(day=1)
            ).count()
            
            projects_last_month = Project.objects.filter(
                created_at__gte=timezone.now().replace(day=1) - timedelta(days=30),
                created_at__lt=timezone.now().replace(day=1)
            ).count()
            
            # User activity analytics
            recent_user_activity = User.objects.filter(
                last_login__gte=timezone.now() - timedelta(days=7)
            ).count()
            
            # Material usage analytics
            most_used_materials = ProjectItem.objects.values('material__name', 'material__category__name').annotate(
                total_quantity=Sum('quantity'),
                total_value_france=Sum('total_cost_france'),
                total_value_morocco=Sum('total_cost_morocco')
            ).order_by('-total_quantity')[:10]
            
            # Geographic distribution (by entity)
            entity_distribution = Project.objects.values('entity').annotate(
                count=Count('id')
            ).order_by('-count')
            
            # Internet connection types distribution
            internet_types = Project.objects.exclude(internet_line_type__isnull=True).values('internet_line_type').annotate(
                count=Count('id')
            ).order_by('-count')
            
            # Device type analytics
            total_laptops = sum([
                Project.objects.aggregate(total=Sum('num_laptop_office'))['total'] or 0,
                Project.objects.aggregate(total=Sum('num_laptop_tech'))['total'] or 0
            ])
            
            total_desktops = sum([
                Project.objects.aggregate(total=Sum('num_desktop_office'))['total'] or 0,
                Project.objects.aggregate(total=Sum('num_desktop_tech'))['total'] or 0
            ])
            
            total_printers = Project.objects.aggregate(total=Sum('num_printers'))['total'] or 0
            total_aps = Project.objects.aggregate(total=Sum('num_aps'))['total'] or 0
            total_videoconference = Project.objects.aggregate(total=Sum('num_videoconference'))['total'] or 0
            
            # Cost efficiency metrics
            avg_cost_per_user_france = 0
            avg_cost_per_user_morocco = 0
            total_users_in_projects = Project.objects.aggregate(total=Sum('number_of_users'))['total'] or 0
            if total_users_in_projects > 0:
                avg_cost_per_user_france = total_cost_france / total_users_in_projects
                avg_cost_per_user_morocco = total_cost_morocco / total_users_in_projects
            # Calculate growth rates
            project_growth_rate = 0
            if projects_last_month > 0:
                project_growth_rate = ((projects_this_month - projects_last_month) / projects_last_month) * 100
            
            print(f"Financial - Total France: {total_cost_france}, Total Morocco: {total_cost_morocco}")
            print(f"Equipment - Total: {total_network_equipment}, Laptops: {total_laptops}, Desktops: {total_desktops}")
            print(f"Growth - Projects this month: {projects_this_month}, Growth rate: {project_growth_rate:.1f}%")
            
            return {
                'summary': {
                    'total_users': total_users,
                    'active_users': active_users,
                    'admin_users': admin_users,
                    'total_projects': total_projects,
                    'active_projects': active_projects,
                    'completed_projects': completed_projects,
                    'draft_projects': draft_projects,
                    'total_materials': total_materials,
                    'total_categories': total_categories,
                },
                'financial': {
                    'total_cost_france': float(total_cost_france),
                    'total_cost_morocco': float(total_cost_morocco),
                    'avg_project_cost_france': float(avg_project_cost_france),
                    'avg_project_cost_morocco': float(avg_project_cost_morocco),
                    'avg_cost_per_user_france': float(avg_cost_per_user_france),
                    'avg_cost_per_user_morocco': float(avg_cost_per_user_morocco),
                    'project_growth_percentage': round(project_growth_rate, 1),
                },
                'equipment_analytics': {
                    'total_network_equipment': total_network_equipment,
                    'total_laptops': total_laptops,
                    'total_desktops': total_desktops,
                    'total_printers': total_printers,
                    'total_aps': total_aps,
                    'total_videoconference': total_videoconference,
                    'total_users_in_projects': total_users_in_projects,
                    'most_used_network_equipment': list(most_used_network),
                    'most_used_server_equipment': list(most_used_servers)
                },
                'trends': {
                    'projects_this_month': projects_this_month,
                    'projects_last_month': projects_last_month,
                    'recent_user_activity': recent_user_activity,
                    'project_status_distribution': {
                        'draft': draft_projects,
                        'in_progress': active_projects,
                        'completed': completed_projects
                    },
                },
                'material_analytics': {
                    'most_used_materials': list(most_used_materials)
                },
                'geographic_distribution': {
                    'entity_distribution': list(entity_distribution),
                    'internet_types': list(internet_types)
                },
                'last_updated': timezone.now().isoformat()
            }
        except Exception as e:
            print(f"Error in calculate_dashboard_stats: {str(e)}")
            import traceback
            traceback.print_exc()
            # Return minimal stats if there's an error
            return {
                'summary': {
                    'total_users': 0,
                    'active_users': 0,
                    'admin_users': 0,
                    'total_projects': 0,
                    'active_projects': 0,
                    'completed_projects': 0,
                    'total_materials': 0,
                    'total_categories': 0,
                },
                'financial': {
                    'total_earnings': 0.0,
                    'total_spending': 0.0,
                    'balance': 0.0,
                    'current_month_revenue': 0.0,
                    'revenue_growth_percentage': 0.0,
                    'project_growth_percentage': 0.0,
                },
                'trends': {
                    'new_users_this_month': 0,
                    'new_projects_this_month': 0,
                    'project_status_distribution': {},
                },
                'averages': {
                    'avg_project_cost_france': 0.0,
                    'avg_project_cost_morocco': 0.0,
                    'avg_material_cost_france': 0.0,
                    'avg_material_cost_morocco': 0.0,
                },
                'recent_activity': {
                    'recent_projects': [],
                    'recent_users': []
                },
                'last_updated': timezone.now().isoformat(),
                'error': str(e)
            }
    
    def get_cached_data(self, cache_key):
        """Get cached dashboard data if available and not expired"""
        try:
            cache_obj = DashboardCache.objects.get(
                cache_key=cache_key,
                expires_at__gt=timezone.now()
            )
            return cache_obj.data
        except DashboardCache.DoesNotExist:
            return None
    
    def cache_data(self, cache_key, data):
        """Cache dashboard data for 1 hour"""
        try:
            expires_at = timezone.now() + timedelta(hours=1)
            DashboardCache.objects.update_or_create(
                cache_key=cache_key,
                defaults={
                    'data': data,
                    'expires_at': expires_at
                }
            )
        except Exception as e:
            # Don't fail if caching fails
            print(f"Failed to cache dashboard data: {e}")


class DashboardChartsView(APIView):
    """Dashboard charts and visualizations data"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get data for dashboard charts"""
        try:
            if not (request.user.role in ['admin', 'super_admin'] or request.user.is_staff):
                return Response(
                    {'error': 'Admin privileges required'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Enhanced analytics data
            monthly_revenue = self.get_monthly_revenue_data()
            equipment_trends = self.get_equipment_usage_trends()
            cost_analysis = self.get_cost_analysis_by_category()
            complexity_analysis = self.get_project_complexity_analysis()
            project_status_data = self.get_project_status_data()
            user_registration_trends = self.get_user_registration_trends()
            material_category_data = self.get_material_category_data()
            
            return Response({
                'monthly_revenue': monthly_revenue,
                'equipment_trends': equipment_trends,
                'cost_analysis_by_category': cost_analysis,
                'project_complexity_analysis': complexity_analysis,
                'project_status': project_status_data,
                'user_registration_trends': user_registration_trends,
                'material_categories': material_category_data,
                'last_updated': timezone.now().isoformat()
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to fetch chart data: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_monthly_revenue_data(self):
        """Get monthly revenue data for the last 12 months"""
        monthly_data = []
        for i in range(12):
            month_start = timezone.now().replace(day=1) - timedelta(days=30*i)
            month_end = month_start + timedelta(days=30)
            
            # Calculate total costs for projects created in this month
            month_projects = Project.objects.filter(
                created_at__gte=month_start,
                created_at__lt=month_end
            )
            
            total_france = 0
            total_morocco = 0
            for project in month_projects:
                project_items = ProjectItem.objects.filter(project=project)
                total_france += sum([item.total_cost_france for item in project_items])
                total_morocco += sum([item.total_cost_morocco for item in project_items])
            
            monthly_data.append({
                'month': month_start.strftime('%Y-%m'),
                'month_name': month_start.strftime('%B %Y'),
                'total_france': float(total_france),
                'total_morocco': float(total_morocco),
                'project_count': month_projects.count()
            })
        
        return list(reversed(monthly_data))
    
    def get_equipment_usage_trends(self):
        """Get equipment usage trends over time"""
        trends = []
        for i in range(6):  # Last 6 months
            month_start = timezone.now().replace(day=1) - timedelta(days=30*i)
            month_end = month_start + timedelta(days=30)
            
            # Count equipment usage in projects created this month
            month_projects = Project.objects.filter(
                    created_at__gte=month_start,
                    created_at__lt=month_end
            )
            
            total_laptops = sum([p.num_laptop_office + p.num_laptop_tech for p in month_projects])
            total_desktops = sum([p.num_desktop_office + p.num_desktop_tech for p in month_projects])
            total_printers = sum([p.num_printers for p in month_projects])
            total_aps = sum([p.num_aps for p in month_projects])
            
            trends.append({
                'month': month_start.strftime('%Y-%m'),
                'month_name': month_start.strftime('%B'),
                'laptops': total_laptops,
                'desktops': total_desktops,
                'printers': total_printers,
                'access_points': total_aps
            })
        
        return list(reversed(trends))
    
    def get_cost_analysis_by_category(self):
        """Get cost analysis by material category"""
        from django.db.models import Sum
        
        category_costs = ProjectItem.objects.values(
            'material__category__name'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_cost_france=Sum('total_cost_france'),
            total_cost_morocco=Sum('total_cost_morocco')
        ).order_by('-total_cost_france')
        
        return list(category_costs)
    
    def get_project_complexity_analysis(self):
        """Analyze project complexity based on equipment count and user count"""
        projects = Project.objects.all()
        complexity_data = []
        
        for project in projects:
            # Calculate complexity score based on various factors
            equipment_count = (
                project.num_laptop_office + project.num_laptop_tech +
                project.num_desktop_office + project.num_desktop_tech +
                project.num_printers + project.num_aps + project.num_videoconference
            )
            
            # Get project items count
            items_count = ProjectItem.objects.filter(project=project).count()
            
            # Calculate total project value
            project_items = ProjectItem.objects.filter(project=project)
            total_value_france = sum([item.total_cost_france for item in project_items])
            total_value_morocco = sum([item.total_cost_morocco for item in project_items])
            
            complexity_score = (
                (equipment_count * 0.3) +
                (items_count * 0.4) +
                (project.number_of_users * 0.2) +
                (project.number_of_sites * 0.1)
            )
            
            complexity_data.append({
                'project_name': project.name,
                'company_name': project.company_name,
                'equipment_count': equipment_count,
                'items_count': items_count,
                'user_count': project.number_of_users,
                'site_count': project.number_of_sites,
                'complexity_score': round(complexity_score, 2),
                'total_value_france': float(total_value_france),
                'total_value_morocco': float(total_value_morocco),
                'created_at': project.created_at.isoformat()
            })
        
        # Sort by complexity score
        complexity_data.sort(key=lambda x: x['complexity_score'], reverse=True)
        return complexity_data[:20]  # Top 20 most complex projects
    
    def get_project_status_data(self):
        """Get project status distribution for pie chart based on dates"""
        today = timezone.now().date()
        
        # Calculate project status based on dates instead of status field
        draft_projects = Project.objects.filter(start_date__isnull=True).count()
        active_projects = Project.objects.filter(
            models.Q(start_date__lte=today) & 
            (models.Q(end_date__isnull=True) | models.Q(end_date__gte=today))
        ).count()
        completed_projects = Project.objects.filter(end_date__lt=today).count()
        
        total_projects = Project.objects.count()
        
        return [
            {
                'status': 'draft',
                'count': draft_projects,
                'percentage': round((draft_projects / total_projects) * 100, 2) if total_projects > 0 else 0
            },
            {
                'status': 'in_progress',
                'count': active_projects,
                'percentage': round((active_projects / total_projects) * 100, 2) if total_projects > 0 else 0
            },
            {
                'status': 'completed',
                'count': completed_projects,
                'percentage': round((completed_projects / total_projects) * 100, 2) if total_projects > 0 else 0
            }
        ]
    
    def get_user_registration_trends(self):
        """Get user registration trends for the last 6 months"""
        now = timezone.now()
        data = []
        
        for i in range(6):
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_start = month_start - timedelta(days=30 * i)
            month_end = month_start + timedelta(days=30)
            
            count = User.objects.filter(
                created_at__gte=month_start,
                created_at__lt=month_end
            ).count()
            
            data.append({
                'month': month_start.strftime('%Y-%m'),
                'registrations': count
            })
        
        return list(reversed(data))
    
    def get_material_category_data(self):
        """Get material category distribution"""
        category_data = Category.objects.annotate(
            material_count=Count('materials', filter=Q(materials__is_active=True)),
            total_france_value=Sum('materials__price_france', filter=Q(materials__is_active=True)),
            total_morocco_value=Sum('materials__price_morocco', filter=Q(materials__is_active=True))
        ).order_by('-material_count')
        
        return [
            {
                'category': cat.name,
                'material_count': cat.material_count,
                'total_france_value': float(cat.total_france_value or 0),
                'total_morocco_value': float(cat.total_morocco_value or 0)
            }
            for cat in category_data
        ]
