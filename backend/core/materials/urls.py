from django.urls import path
from . import views

urlpatterns = [
    # Existing URLs
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('materials/', views.MaterialListCreateView.as_view(), name='material-list-create'),
    path('materials/<int:pk>/', views.MaterialDetailView.as_view(), name='material-detail'),
    path('materials/<int:pk>/history/', views.MaterialPriceHistoryView.as_view(), name='material-price-history'),
    path('materials/bulk-update/', views.MaterialBulkUpdateView.as_view(), name='material-bulk-update'),
    path('materials/setup/', views.MaterialSetupView.as_view(), name='material-setup'),
    path('materials/setup-required/', views.MaterialSetupRequiredView.as_view(), name='material-setup-required'),
    path('materials/bulk-create/', views.MaterialBulkCreateView.as_view(), name='material-bulk-create'),
    
    # Custom Material System URLs
    path('materials/<int:category_id>/', views.get_materials_by_category, name='materials-by-category'),
    path('custom-material/', views.add_custom_material, name='add-custom-material'),
    path('recalculate-budget/<int:project_id>/', views.recalculate_project_budget, name='recalculate-budget'),
]