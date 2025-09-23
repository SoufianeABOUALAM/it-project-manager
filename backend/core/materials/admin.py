from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.core.exceptions import ValidationError
from django.shortcuts import redirect
from django import forms
from .models import Material, Category, PriceHistory

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'material_count', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    list_filter = ('created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at', 'material_count')
    actions = ['view_materials']
    
    fieldsets = (
        ('Category Information', {
            'fields': ('name', 'description'),
            'description': 'Create categories to organize your materials. Each material must belong to a category.'
        }),
        ('Statistics', {
            'fields': ('material_count',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def view_materials(self, request, queryset):
        """Action to view materials for selected categories"""
        if queryset.count() == 1:
            category = queryset.first()
            url = reverse('admin:materials_material_changelist') + f'?category__id__exact={category.id}'
            return redirect(url)
        else:
            self.message_user(request, "Please select only one category to view its materials.")
    view_materials.short_description = "View materials in selected category"
    
    def material_count(self, obj):
        """Display the number of materials in this category"""
        count = obj.materials.count()
        if count > 0:
            url = reverse('admin:materials_material_changelist') + f'?category__id__exact={obj.id}'
            return format_html('<a href="{}">{} materials</a>', url, count)
        return "0 materials"
    material_count.short_description = "Materials Count"
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('materials')

class MaterialForm(forms.ModelForm):
    """Custom form for Material with validation"""
    
    class Meta:
        model = Material
        fields = '__all__'
    
    def clean(self):
        cleaned_data = super().clean()
        category = cleaned_data.get('category')
        
        if not category:
            raise ValidationError({
                'category': 'A category is required. Please create a category first if none exist.'
            })
        
        return cleaned_data

@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    form = MaterialForm
    list_display = ('name', 'category', 'price_france', 'price_morocco', 'unit', 'is_active', 'is_auto_calculated', 'is_service')
    list_filter = ('category', 'is_active', 'is_auto_calculated', 'is_service', 'unit', 'created_at')
    search_fields = ('name', 'category__name', 'description')
    list_editable = ('price_france', 'price_morocco', 'is_active')
    readonly_fields = ('created_at', 'updated_at', 'price_difference_percentage')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'category', 'description', 'unit', 'is_active'),
            'description': 'Select a category for this material. If no categories exist, create one first.'
        }),
        ('Pricing', {
            'fields': ('price_france', 'price_morocco', 'price_difference_percentage')
        }),
        ('Material Properties', {
            'fields': ('is_auto_calculated', 'is_service')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('category')
    
    def add_view(self, request, form_url='', extra_context=None):
        """Customize the add view to show helpful information"""
        extra_context = extra_context or {}
        
        # Check if there are any categories available
        category_count = Category.objects.count()
        if category_count == 0:
            extra_context['show_category_warning'] = True
            extra_context['category_add_url'] = reverse('admin:materials_category_add')
        else:
            extra_context['show_category_warning'] = False
            
        return super().add_view(request, form_url, extra_context)
    
    def changelist_view(self, request, extra_context=None):
        """Customize the changelist view to show helpful information"""
        extra_context = extra_context or {}
        
        # Check if there are any categories available
        category_count = Category.objects.count()
        if category_count == 0:
            extra_context['show_category_warning'] = True
            extra_context['category_add_url'] = reverse('admin:materials_category_add')
        else:
            extra_context['show_category_warning'] = False
            
        return super().changelist_view(request, extra_context)

@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ('material', 'old_price_france', 'new_price_france', 'old_price_morocco', 'new_price_morocco', 'changed_by', 'changed_at')
    list_filter = ('changed_at', 'material__category')
    search_fields = ('material__name', 'reason')
    readonly_fields = ('changed_at',)
    
    fieldsets = (
        ('Material & Pricing Changes', {
            'fields': ('material', 'old_price_france', 'new_price_france', 'old_price_morocco', 'new_price_morocco')
        }),
        ('Change Details', {
            'fields': ('changed_by', 'changed_at', 'reason')
        })
    )
