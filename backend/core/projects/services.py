from math import ceil
from decimal import Decimal
from django.db import transaction
from django.db.models import Sum
from .models import (
    Project,
    UserDevice as UserDeviceModel,
    NetworkEquipment, ServerEquipment,
    Service as ServiceModel,
    SoftwareLicense as SoftwareLicenseModel,
    VisioEquipment, VisioType,
    InfrastructureEquipment, ProjectInfrastructureItem,
    ProjectUserDeviceItem, ProjectNetworkItem, ProjectServerItem, ProjectServiceItem, ProjectVisioItem,
    PurchaseLocation,
    ProjectSoftwareItem
)

# ---------- Paramètres / règles câbles ----------
PERCENT_LAPTOP_OFFICE_DOCKED = 0.50   # % laptops bureautiques qui utilisent un dock (et donc 1 câble)
PERCENT_LAPTOP_TECH_DOCKED   = 0.30   # % laptops techniques dockés
SPARE_RATIO = 0.10                     # 10% de marge
# Règles supplémentaires
UPS_FOR_FILE_SERVER_QTY = 1           # 1 UPS si serveur présent
PDU_FOR_SERVERS_QTY = 1               # 1 PDU si ≥1 serveur

# Licences logicielles (noms des SKU génériques)
WINDOWS_CLIENT_NAME = "Windows Client License (Windows Pro)"
WINDOWS_SERVER_NAME = "Windows Server License"
PDU_NAME = "PDU (Power Distribution Unit)"

# Longueurs standards
LENGTH_05M = Decimal("0.5")
LENGTH_2M  = Decimal("2")
LENGTH_5M  = Decimal("5")
LENGTH_10M = Decimal("10")

# Attribution des longueurs par type d’usage
DESKTOP_CABLE_LENGTH = LENGTH_5M       # Desktop → 5 m
LAPTOP_DOCK_LENGTH   = LENGTH_2M       # Laptop dock → 2 m
PRINTER_CABLE_LENGTH = LENGTH_5M       # Imprimante/Traceur → 5 m
AP_CABLE_LENGTH      = LENGTH_10M      # AP → 10 m
SERVER_PATCH_LENGTH  = LENGTH_05M      # Patch cord baie → 0.5 m


def _parse_bandwidth(speed_str: str) -> int:
    if not speed_str:
        return 0
    # extract first integer in string (e.g. "100Mbps" -> 100)
    num = "".join(ch if ch.isdigit() else " " for ch in speed_str).strip().split()
    return int(num[0]) if num else 0


def _ensure_cable_equipment(length_m: Decimal) -> InfrastructureEquipment:
    name = f"Câble réseau blindé Cat 6 {length_m} m"
    eq, _ = InfrastructureEquipment.objects.get_or_create(
        name=name,
        defaults=dict(
            infra_type=InfrastructureEquipment.InfraType.CABLE,
            length_m=length_m,
            fixed_cost_eur=0,
            fixed_cost_mad=0,
            description="",
        ),
    )
    # si l’objet existait sans length_m/infra_type, on aligne
    changed = False
    if eq.infra_type != InfrastructureEquipment.InfraType.CABLE:
        eq.infra_type = InfrastructureEquipment.InfraType.CABLE
        changed = True
    if eq.length_m != length_m:
        eq.length_m = length_m
        changed = True
    if changed:
        eq.save(update_fields=["infra_type", "length_m"])
    return eq


class ProjectItemGenerator:
    def __init__(self, purchase_location=PurchaseLocation.FRANCE):
        self.purchase_location = purchase_location

    @transaction.atomic
    def generate(self, project: Project, replace: bool = False) -> dict:
        created, updated, deleted = 0, 0, 0

        if replace:
            deleted += ProjectUserDeviceItem.objects.filter(project=project).delete()[0]
            deleted += ProjectNetworkItem.objects.filter(project=project).delete()[0]
            deleted += ProjectServerItem.objects.filter(project=project).delete()[0]
            deleted += ProjectServiceItem.objects.filter(project=project).delete()[0]
            deleted += ProjectVisioItem.objects.filter(project=project).delete()[0]
            deleted += ProjectInfrastructureItem.objects.filter(project=project, equipment__infra_type=InfrastructureEquipment.InfraType.CABLE).delete()[0]

        # --- User devices (laptops/desktops/printers/traceau) ---
        user_device_specs = [
            ("Laptop - Office", UserDeviceModel.DeviceType.LAPTOP, project.num_laptop_office),
            ("Laptop - Tech",   UserDeviceModel.DeviceType.LAPTOP, project.num_laptop_tech),
            ("Desktop - Office",UserDeviceModel.DeviceType.DESKTOP, project.num_desktop_office),
            ("Desktop - Tech",  UserDeviceModel.DeviceType.DESKTOP, project.num_desktop_tech),
            ("Printer",         UserDeviceModel.DeviceType.PRINTER, project.num_printers),
            ("Traceau",         UserDeviceModel.DeviceType.PRINTER, project.num_traceau),
        ]
        for name, device_type, qty in user_device_specs:
            if not qty:
                continue
            equipment, _ = UserDeviceModel.objects.get_or_create(
                name=name,
                defaults=dict(device_type=device_type, fixed_cost_eur=0, fixed_cost_mad=0, description=""),
            )
            item, created_flag = ProjectUserDeviceItem.objects.update_or_create(
                project=project, equipment=equipment,
                defaults=dict(quantity=qty, source="auto", purchase_location=self.purchase_location),
            )
            created += int(created_flag)
            updated += int(not created_flag)

        # --- Network (APs; simple rule based on num_aps) ---
        if project.num_aps:
            ap_equipment, _ = NetworkEquipment.objects.get_or_create(
                name="Access Point",
                defaults=dict(equipment_type=NetworkEquipment.EquipmentType.ACCESS_POINT, description=""),
            )
            item, created_flag = ProjectNetworkItem.objects.update_or_create(
                project=project, equipment=ap_equipment,
                defaults=dict(quantity=project.num_aps, source="auto", purchase_location=self.purchase_location),
            )
            created += int(created_flag)
            updated += int(not created_flag)

        # Optional: simple firewall if internet line exists
        if project.internet_line_type:
            fw_equipment, _ = NetworkEquipment.objects.get_or_create(
                name="Firewall Appliance",
                defaults=dict(equipment_type=NetworkEquipment.EquipmentType.FIREWALL, description=""),
            )
            item, created_flag = ProjectNetworkItem.objects.update_or_create(
                project=project, equipment=fw_equipment,
                defaults=dict(quantity=1, source="auto", purchase_location=self.purchase_location),
            )
            created += int(created_flag)
            updated += int(not created_flag)

        # --- Servers (file server) ---
        if project.file_server:
            srv_equipment, _ = ServerEquipment.objects.get_or_create(
                name="File Server (Standard)",
                defaults=dict(rack_units=1, description=""),
            )
            item, created_flag = ProjectServerItem.objects.update_or_create(
                project=project, equipment=srv_equipment,
                defaults=dict(quantity=1, source="auto", purchase_location=self.purchase_location),
            )
            created += int(created_flag)
            updated += int(not created_flag)

        # --- Licences Windows Client (par ordinateur) ---
        computers_total = (
            (project.num_laptop_office or 0) +
            (project.num_laptop_tech or 0) +
            (project.num_desktop_office or 0) +
            (project.num_desktop_tech or 0)
        )
        if computers_total > 0:
            win_client, _ = SoftwareLicenseModel.objects.get_or_create(
                name=WINDOWS_CLIENT_NAME,
                defaults=dict(license_type=SoftwareLicenseModel.LicenseType.PERPETUAL, description=""),
            )
            ps_item, created_flag = ProjectSoftwareItem.objects.update_or_create(
                project=project, equipment=win_client,
                defaults=dict(quantity=computers_total, source="auto", purchase_location=self.purchase_location),
            )
            created += int(created_flag)
            updated += int(not created_flag)

        # --- Licences Windows Server + UPS + PDU si serveurs existent ---
        server_qty = ProjectServerItem.objects.filter(project=project).aggregate(total=Sum('quantity'))['total'] or 0
        if server_qty > 0:
            # Windows Server license
            win_server, _ = SoftwareLicenseModel.objects.get_or_create(
                name=WINDOWS_SERVER_NAME,
                defaults=dict(license_type=SoftwareLicenseModel.LicenseType.PERPETUAL, description=""),
            )
            ps_item, created_flag = ProjectSoftwareItem.objects.update_or_create(
                project=project, equipment=win_server,
                defaults=dict(quantity=server_qty, source="auto", purchase_location=self.purchase_location),
            )
            created += int(created_flag)
            updated += int(not created_flag)

            # UPS
            ups_eq, _ = InfrastructureEquipment.objects.get_or_create(
                name="Onduleur (UPS) 3000VA",
                defaults=dict(infra_type=InfrastructureEquipment.InfraType.UPS, description=""),
            )
            if ups_eq.infra_type != InfrastructureEquipment.InfraType.UPS:
                ups_eq.infra_type = InfrastructureEquipment.InfraType.UPS
                ups_eq.save(update_fields=["infra_type"])
            ups_item, ups_created = ProjectInfrastructureItem.objects.update_or_create(
                project=project, equipment=ups_eq,
                defaults=dict(quantity=UPS_FOR_FILE_SERVER_QTY, source="auto", purchase_location=self.purchase_location),
            )
            created += int(ups_created)
            updated += int(not ups_created)

            # PDU
            pdu_eq, _ = InfrastructureEquipment.objects.get_or_create(
                name=PDU_NAME,
                defaults=dict(infra_type=InfrastructureEquipment.InfraType.ACCESSORY, description=""),
            )
            if pdu_eq.infra_type != InfrastructureEquipment.InfraType.ACCESSORY:
                pdu_eq.infra_type = InfrastructureEquipment.InfraType.ACCESSORY
                pdu_eq.save(update_fields=["infra_type"])
            pdu_item, pdu_created = ProjectInfrastructureItem.objects.update_or_create(
                project=project, equipment=pdu_eq,
                defaults=dict(quantity=PDU_FOR_SERVERS_QTY, source="auto", purchase_location=self.purchase_location),
            )
            created += int(pdu_created)
            updated += int(not pdu_created)

        # --- Cables (InfrastructureEquipment, infra_type=CABLE) ---
        # Règles:
        # - 1 câble 5m par desktop
        # - Laptops: % dockés → 1 câble 2m
        # - 1 câble 5m par imprimante/traceur
        # - 1 câble 10m par AP
        # - Si file server: 2 câbles 0.5m (patch cords) dans la baie
        desktop_total = (project.num_desktop_office or 0) + (project.num_desktop_tech or 0)
        laptop_office_cabled = ceil((project.num_laptop_office or 0) * PERCENT_LAPTOP_OFFICE_DOCKED)
        laptop_tech_cabled   = ceil((project.num_laptop_tech or 0) * PERCENT_LAPTOP_TECH_DOCKED)
        printers_total = (project.num_printers or 0) + (project.num_traceau or 0)
        aps_total = (project.num_aps or 0)
        server_patch_qty = 2 if project.file_server else 0

        cable_counts = {
            DESKTOP_CABLE_LENGTH: desktop_total,
            LAPTOP_DOCK_LENGTH: laptop_office_cabled + laptop_tech_cabled,
            PRINTER_CABLE_LENGTH: printers_total,
            AP_CABLE_LENGTH: aps_total,
            SERVER_PATCH_LENGTH: server_patch_qty,
        }

        # appliquer la marge de sécurité
        for length, count in list(cable_counts.items()):
            if count <= 0:
                continue
            count_with_spare = ceil(count * (1 + SPARE_RATIO))
            if count_with_spare <= 0:
                continue
            eq = _ensure_cable_equipment(length)
            item, created_flag = ProjectInfrastructureItem.objects.update_or_create(
                project=project, equipment=eq,
                defaults=dict(quantity=count_with_spare, source="auto", purchase_location=self.purchase_location),
            )
            created += int(created_flag)
            updated += int(not created_flag)

        return {"created": created, "updated": updated, "deleted": deleted}