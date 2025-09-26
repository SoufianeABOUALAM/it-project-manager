from decimal import Decimal
from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "name", "company_name", "entity", "number_of_users", 
        "status", "priority", "progress", "total_cost_france", 
        "total_cost_morocco", "created_at", "created_by"
    )
    list_filter = (
        "entity", "status", "priority", "local_apps", "file_server",
        "internet_line_type", "pc_type", "created_at", "created_by"
    )
    search_fields = ("name", "company_name", "created_by__username")
    readonly_fields = ("created_at", "updated_at", "total_cost_france", "total_cost_morocco")
    
    fieldsets = (
        ("Basic Information", {
            "fields": ("name", "company_name", "entity", "created_by")
        }),
        ("Project Details", {
            "fields": ("number_of_users", "pc_type", "local_apps", "local_apps_list", "file_server")
        }),
        ("Location & Infrastructure", {
            "fields": ("site_addresses", "gps_coordinates", "internet_line_type", "internet_line_speed")
        }),
        ("Equipment Quantities", {
            "fields": (
                "num_laptop_office", "num_laptop_tech", "num_desktop_office", "num_desktop_tech",
                "num_printers", "num_traceau", "num_videoconference", "visio_type", "num_aps",
                "num_switch_24", "num_switch_48"
            )
        }),
        ("Project Management", {
            "fields": ("status", "priority", "progress", "start_date", "end_date")
        }),
        ("Financial", {
            "fields": ("total_cost_france", "total_cost_morocco"),
            "classes": ("collapse",)
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related("created_by")
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by for new objects
            obj.created_by = request.user
        super().save_model(request, obj, form, change)