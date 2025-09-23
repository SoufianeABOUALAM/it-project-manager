from decimal import Decimal
from django.contrib import admin
from .services import ProjectItemGenerator

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
    ProjectInfrastructureItem,
    ProjectUserDeviceItem,
    ProjectSoftwareItem,
    ProjectServiceItem,
    ProjectVisioItem,
)


class ProjectInfrastructureItemInline(admin.TabularInline):
    model = ProjectInfrastructureItem
    extra = 0
    raw_id_fields = ("equipment",)
    fields = ("equipment", "quantity", "source", "purchase_location")
    autocomplete_fields = ("equipment",)


class ProjectNetworkItemInline(admin.TabularInline):
    model = ProjectNetworkItem
    extra = 0
    raw_id_fields = ("equipment",)
    fields = ("equipment", "quantity", "source", "purchase_location")
    autocomplete_fields = ("equipment",)


class ProjectServerItemInline(admin.TabularInline):
    model = ProjectServerItem
    extra = 0
    raw_id_fields = ("equipment",)
    fields = ("equipment", "quantity", "source", "purchase_location")
    autocomplete_fields = ("equipment",)


class ProjectUserDeviceItemInline(admin.TabularInline):
    model = ProjectUserDeviceItem
    extra = 0
    raw_id_fields = ("equipment",)
    fields = ("equipment", "quantity", "source", "purchase_location")
    autocomplete_fields = ("equipment",)


class ProjectSoftwareItemInline(admin.TabularInline):
    model = ProjectSoftwareItem
    extra = 0
    raw_id_fields = ("equipment",)
    fields = ("equipment", "quantity", "source", "purchase_location")
    autocomplete_fields = ("equipment",)


class ProjectServiceItemInline(admin.TabularInline):
    model = ProjectServiceItem
    extra = 0
    raw_id_fields = ("equipment",)
    fields = ("equipment", "quantity", "source", "purchase_location")
    autocomplete_fields = ("equipment",)


class ProjectVisioItemInline(admin.TabularInline):
    model = ProjectVisioItem
    extra = 0
    raw_id_fields = ("equipment",)
    fields = ("equipment", "quantity", "source", "purchase_location")
    autocomplete_fields = ("equipment",)


@admin.register(NetworkEquipment)
class NetworkEquipmentAdmin(admin.ModelAdmin):
    list_display = ("name", "equipment_type", "supplier", "fixed_cost_eur", "fixed_cost_mad")
    list_filter = ("equipment_type", "supplier")
    search_fields = ("name", "supplier", "description")


@admin.register(InfrastructureEquipment)
class InfrastructureEquipmentAdmin(admin.ModelAdmin):
    list_display = ("name", "infra_type", "supplier", "fixed_cost_eur", "fixed_cost_mad")
    list_filter = ("infra_type", "supplier")
    search_fields = ("name", "supplier", "description")


@admin.register(ServerEquipment)
class ServerEquipmentAdmin(admin.ModelAdmin):
    list_display = ("name", "rack_units", "cpu", "ram_gb", "supplier")
    list_filter = ("supplier",)
    search_fields = ("name", "cpu", "supplier")


@admin.register(UserDevice)
class UserDeviceAdmin(admin.ModelAdmin):
    list_display = ("name", "device_type", "supplier", "fixed_cost_eur")
    list_filter = ("device_type", "supplier")
    search_fields = ("name", "supplier")


@admin.register(SoftwareLicense)
class SoftwareLicenseAdmin(admin.ModelAdmin):
    list_display = ("name", "license_type", "subscription_period", "user_limit", "supplier")
    list_filter = ("license_type", "subscription_period", "supplier")
    search_fields = ("name", "supplier")


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "service_type", "bandwidth_mbps", "supplier")
    list_filter = ("service_type", "supplier")
    search_fields = ("name", "supplier")


@admin.register(VisioEquipment)
class VisioEquipmentAdmin(admin.ModelAdmin):
    list_display = ("name", "visio_type", "supplier", "fixed_cost_eur", "fixed_cost_mad")
    list_filter = ("visio_type", "supplier")
    search_fields = ("name", "supplier", "description")


@admin.register(ProjectNetworkItem)
class ProjectNetworkItemAdmin(admin.ModelAdmin):
    list_display = ("project", "equipment", "quantity", "purchase_location", "source")
    raw_id_fields = ("project", "equipment")
    search_fields = ("project__name", "equipment__name", "source")


@admin.register(ProjectServerItem)
class ProjectServerItemAdmin(admin.ModelAdmin):
    list_display = ("project", "equipment", "quantity", "purchase_location", "source")
    raw_id_fields = ("project", "equipment")


@admin.register(ProjectInfrastructureItem)
class ProjectInfrastructureItemAdmin(admin.ModelAdmin):
    list_display = ("project", "equipment", "quantity", "purchase_location", "source")
    raw_id_fields = ("project", "equipment")


@admin.register(ProjectUserDeviceItem)
class ProjectUserDeviceItemAdmin(admin.ModelAdmin):
    list_display = ("project", "equipment", "quantity", "purchase_location", "source")
    raw_id_fields = ("project", "equipment")


@admin.register(ProjectSoftwareItem)
class ProjectSoftwareItemAdmin(admin.ModelAdmin):
    list_display = ("project", "equipment", "quantity", "purchase_location", "source")
    raw_id_fields = ("project", "equipment")


@admin.register(ProjectServiceItem)
class ProjectServiceItemAdmin(admin.ModelAdmin):
    list_display = ("project", "equipment", "quantity", "purchase_location", "source")
    raw_id_fields = ("project", "equipment")


@admin.register(ProjectVisioItem)
class ProjectVisioItemAdmin(admin.ModelAdmin):
    list_display = ("project", "equipment", "quantity", "purchase_location", "source")
    raw_id_fields = ("project", "equipment")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    actions = ["generate_items_action"]

    list_display = (
        "name",
        "company_name",
        "entity",
        "start_date",
        "end_date",
        "number_of_users",
        "number_of_user_devices",
        "pc_type",
        "num_laptop_office",
        "num_laptop_tech",
        "num_desktop_office",
        "num_desktop_tech",
        "local_apps",
        "file_server",
        "internet_line_type",
        "internet_line_speed",
        "num_printers",
        "num_traceau",
        "num_videoconference",
        "visio_type",
        "num_aps",
        "total_cost_france",
        "total_cost_morocco",
        "created_by",
        "created_at",
    )
    list_filter = (
        "entity",
        "pc_type",
        "local_apps",
        "file_server",
        "internet_line_type",
        "visio_type",
        "created_by",
    )
    search_fields = ("name", "company_name", "created_by__username", "site_addresses", "local_apps_list")
    readonly_fields = ("total_cost_france", "total_cost_morocco", "created_at", "updated_at", "number_of_user_devices")
    fieldsets = (
        ("Basic Information", {
            "fields": ("name", "company_name", "entity", "start_date", "end_date", "created_by")
        }),
        ("User / Devices", {
            "fields": ("number_of_users", "pc_type", "num_laptop_office", "num_laptop_tech", "num_desktop_office", "num_desktop_tech"),
            "classes": ("collapse",),
        }),
        ("Applications & Servers", {
            "fields": ("local_apps", "local_apps_list", "file_server"),
            "classes": ("collapse",),
        }),
        ("Connectivity", {
            "fields": ("site_addresses", "gps_coordinates", "internet_line_type", "internet_line_speed"),
            "classes": ("collapse",),
        }),
        ("Counts & Summary", {
            "fields": ("num_printers", "num_traceau", "num_videoconference", "visio_type", "num_aps", "total_cost_france", "total_cost_morocco"),
            "classes": ("collapse",),
        }),
    )
    inlines = (
        ProjectNetworkItemInline,
        ProjectServerItemInline,
        ProjectUserDeviceItemInline,
        ProjectSoftwareItemInline,
        ProjectInfrastructureItemInline,
        ProjectVisioItemInline,
        ProjectServiceItemInline,
    )
    date_hierarchy = "start_date"
    ordering = ("-created_at",)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("created_by").prefetch_related(
            "projectnetworkitem_set",
            "projectserveritem_set",
            "projectuserdeviceitem_set",
            "projectsoftwareitem_set",
            "projectserviceitem_set",
            "projectinfrastructureitem_set",
            "projectvisioitem_set",
        )

    def get_fieldsets(self, request, obj=None):
        fieldsets = list(super().get_fieldsets(request, obj))
        if obj:
            for i, (title, opts) in enumerate(fieldsets):
                if title == "User / Devices":
                    fields = list(opts.get("fields", ()))
                    if "number_of_user_devices" not in fields:
                        fields.append("number_of_user_devices")
                        new_opts = opts.copy()
                        new_opts["fields"] = tuple(fields)
                        fieldsets[i] = (title, new_opts)
                    break
        return tuple(fieldsets)

    def number_of_user_devices(self, obj):
        total = 0
        for item in getattr(obj, "projectuserdeviceitem_set").all():
            total += (item.quantity or 0)
        return total
    number_of_user_devices.short_description = "Nbr devices"

    def _sum_cost_for_field(self, obj, field_name):
        total = Decimal("0")
        sets = (
            getattr(obj, "projectnetworkitem_set").select_related("equipment").all(),
            getattr(obj, "projectserveritem_set").select_related("equipment").all(),
            getattr(obj, "projectuserdeviceitem_set").select_related("equipment").all(),
            getattr(obj, "projectsoftwareitem_set").select_related("equipment").all(),
            getattr(obj, "projectserviceitem_set").select_related("equipment").all(),
            getattr(obj, "projectinfrastructureitem_set").select_related("equipment").all(),
            getattr(obj, "projectvisioitem_set").select_related("equipment").all(),
        )
        for qs in sets:
            for item in qs:
                equipment = getattr(item, "equipment", None)
                if not equipment:
                    continue
                cost = getattr(equipment, field_name, None) or Decimal("0")
                qty = item.quantity or 0
                total += cost * qty
        return total

    def total_cost_france(self, obj):
        return self._sum_cost_for_field(obj, "fixed_cost_eur")
    total_cost_france.short_description = "Total cost (EUR)"

    def total_cost_morocco(self, obj):
        return self._sum_cost_for_field(obj, "fixed_cost_mad")
    total_cost_morocco.short_description = "Total cost (MAD)"

    def generate_items_action(self, request, queryset):
        gen = ProjectItemGenerator()
        total = {"created": 0, "updated": 0, "deleted": 0}
        for project in queryset:
            res = gen.generate(project, replace=False)
            for k in total:
                total[k] += res.get(k, 0)
        self.message_user(
            request,
            f"Items generated. Created: {total['created']}, Updated: {total['updated']}, Deleted: {total['deleted']}"
        )
    generate_items_action.short_description = "Generate items for selected projects"