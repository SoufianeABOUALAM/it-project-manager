from django.db import models
from django.utils import timezone
from decimal import Decimal, ROUND_HALF_UP
import requests
from datetime import timedelta
from django.conf import settings

from accounts.models import User

_EUR_MAD_CACHE = {"rate": None, "ts": None}
_EUR_MAD_TTL = getattr(settings, "EUR_MAD_TTL_SECONDS", 600)  # 10 min par défaut
_EUR_MAD_FALLBACK = Decimal(str(getattr(settings, "EUR_MAD_FALLBACK", "11.0")))  # fallback si API KO
_FX_URL = getattr(
    settings,
    "EUR_MAD_FX_URL",
    "https://api.exchangerate.host/latest?base=EUR&symbols=MAD",
)

def _quant2(val: Decimal) -> Decimal:
    return (Decimal(val or 0)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

def _get_eur_mad_rate() -> Decimal:
    now = timezone.now()
    if _EUR_MAD_CACHE["rate"] and _EUR_MAD_CACHE["ts"] and (now - _EUR_MAD_CACHE["ts"]).total_seconds() < _EUR_MAD_TTL:
        return _EUR_MAD_CACHE["rate"]
    try:
        resp = requests.get(_FX_URL, timeout=8)
        resp.raise_for_status()
        data = resp.json()
        rate = data.get("rates", {}).get("MAD")
        if rate is None:
            raise ValueError("MAD rate missing")
        rate_dec = Decimal(str(rate))
        _EUR_MAD_CACHE.update({"rate": rate_dec, "ts": now})
        return rate_dec
    except Exception:
        # fallback si l’API est indisponible
        return _EUR_MAD_FALLBACK

class BaseEquipment(models.Model):
    """
    Modèle abstrait pour tout le matériel.
    """
    name = models.CharField(max_length=255, help_text="Nom spécifique de l'article.")
    description = models.TextField(blank=True, null=True)
    supplier = models.CharField(max_length=255, blank=True, null=True)

    # Structure des coûts
    fixed_cost_eur = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fixed_cost_mad = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monthly_cost_eur = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monthly_cost_mad = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        abstract = True
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Recalcule MAD si nouvel objet, si EUR a changé, ou si MAD manquant.
        recalc = False
        if not self.pk:
            recalc = True
        else:
            try:
                old = self.__class__.objects.only("fixed_cost_eur", "monthly_cost_eur", "fixed_cost_mad", "monthly_cost_mad").get(pk=self.pk)
                if (old.fixed_cost_eur != self.fixed_cost_eur) or (old.monthly_cost_eur != self.monthly_cost_eur):
                    recalc = True
                if (old.fixed_cost_mad in (None, Decimal("0"))) and (self.fixed_cost_eur or 0):
                    recalc = True
                if (old.monthly_cost_mad in (None, Decimal("0"))) and (self.monthly_cost_eur or 0):
                    recalc = True
            except self.__class__.DoesNotExist:
                recalc = True

        if recalc:
            rate = _get_eur_mad_rate()
            self.fixed_cost_mad = _quant2(Decimal(self.fixed_cost_eur or 0) * rate)
            self.monthly_cost_mad = _quant2(Decimal(self.monthly_cost_eur or 0) * rate)

        super().save(*args, **kwargs)

class NetworkEquipment(BaseEquipment):
    """Équipements réseau (switch, router, AP...)."""
    class EquipmentType(models.TextChoices):
        SWITCH = "SWITCH", "Switch"
        ROUTER = "ROUTER", "Router"
        FIREWALL = "FIREWALL", "Firewall"
        ACCESS_POINT = "AP", "Access Point"
        UPS = "UPS", "UPS"
        OTHER = "OTHER", "Other"

    equipment_type = models.CharField(max_length=20, choices=EquipmentType.choices, default=EquipmentType.OTHER)
    port_count = models.PositiveIntegerField(null=True, blank=True, help_text="Nombre de ports.")
    speed = models.CharField(max_length=50, blank=True, null=True, help_text="Vitesse des ports (ex: 1Gbps).")


class ServerEquipment(BaseEquipment):
    """Équipements de salle serveur."""
    rack_units = models.PositiveIntegerField(null=True, blank=True, help_text="Hauteur en U.")
    cpu = models.CharField(max_length=100, blank=True, null=True, help_text="CPU modèle.")
    ram_gb = models.PositiveIntegerField(null=True, blank=True, help_text="RAM en GB.")


class UserDevice(BaseEquipment):
    """PC, imprimantes, etc."""
    class DeviceType(models.TextChoices):
        LAPTOP = "LAPTOP", "Laptop"
        DESKTOP = "DESKTOP", "Desktop"
        PRINTER = "PRINTER", "Printer"
        MONITOR = "MONITOR", "Monitor"
        PHONE = "PHONE", "Phone"

    device_type = models.CharField(max_length=20, choices=DeviceType.choices)
    screen_size = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    storage_gb = models.PositiveIntegerField(null=True, blank=True)


class SoftwareLicense(BaseEquipment):
    """Licences logicielles."""
    class LicenseType(models.TextChoices):
        PERPETUAL = "PERPETUAL", "Perpetual"
        SUBSCRIPTION = "SUBSCRIPTION", "Subscription"

    class SubscriptionPeriod(models.TextChoices):
        MONTHLY = "MONTHLY", "Monthly"
        ANNUAL = "ANNUAL", "Annual"

    license_type = models.CharField(max_length=20, choices=LicenseType.choices, default=LicenseType.SUBSCRIPTION)
    subscription_period = models.CharField(max_length=20, choices=SubscriptionPeriod.choices, null=True, blank=True)
    user_limit = models.PositiveIntegerField(null=True, blank=True)


class Service(BaseEquipment):
    """Services (ligne internet, support, etc.)."""
    class ServiceType(models.TextChoices):
        INTERNET = "INTERNET", "Internet Connection"
        INSTALLATION = "INSTALLATION", "Installation"
        CONFIGURATION = "CONFIGURATION", "Configuration"
        SUPPORT = "SUPPORT", "Support Contract"

    service_type = models.CharField(max_length=20, choices=ServiceType.choices)
    bandwidth_mbps = models.PositiveIntegerField(null=True, blank=True)
    sla_response_hours = models.PositiveIntegerField(null=True, blank=True)


# --- NEW: Visio types (shared) ---
class VisioType(models.TextChoices):
    HARDWARE_CODEC = "HARDWARE_CODEC", "Hardware codec (room system)"
    SOFTWARE = "SOFTWARE", "Software (Teams/Zoom)"
    ROOM_SYSTEM = "ROOM_SYSTEM", "Room system"
    SIP_H323 = "SIP_H323", "SIP / H.323"
    OTHER = "OTHER", "Autre"


# --- NEW: Visio equipment model ---
class VisioEquipment(BaseEquipment):
    """Équipements Visioconférence (codec, room system, endpoints...)."""
    # reuse VisioType as equipment type hint
    visio_type = models.CharField(max_length=30, choices=VisioType.choices, default=VisioType.OTHER)
    supported_users = models.PositiveIntegerField(null=True, blank=True, help_text="Nombre d'utilisateurs supportés (approx.)")
    ports = models.PositiveIntegerField(null=True, blank=True, help_text="Nombre de ports (si applicable)")

    class Meta:
        ordering = ["name"]


class PurchaseLocation(models.TextChoices):
    FRANCE = "FR", "France"
    LOCAL = "LOCAL", "Local"


class InfrastructureEquipment(BaseEquipment):
    """Racks, onduleurs, câbles, KVM, accessoires..."""
    class InfraType(models.TextChoices):
        RACK = "RACK", "Rack"
        UPS = "UPS", "Onduleur"
        CABLE = "CABLE", "Câble réseau"
        KVM = "KVM", "KVM Console/Switch"
        ACCESSORY = "ACCESSORY", "Accessoire"
        OTHER = "OTHER", "Autre"

    infra_type = models.CharField(max_length=20, choices=InfraType.choices, default=InfraType.OTHER)
    length_m = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Longueur (m) — pour câbles")
    port_count = models.PositiveIntegerField(null=True, blank=True, help_text="Nombre de ports (pour KVM)")

    class Meta:
        ordering = ["name"]


class Project(models.Model):
    name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255, blank=True, default="")
    services = models.ManyToManyField(Service, through="ProjectServiceItem", blank=True)
    infrastructure_equipment = models.ManyToManyField(InfrastructureEquipment, through="ProjectInfrastructureItem", blank=True)
    class Entity(models.TextChoices):
        BOUYGUES_CONSTRUCTION = "BOUYGUES_CONSTRUCTION", "Bouygues Construction"
        BOUYGUES_IMMOBILIER = "BOUYGUES_IMMOBILIER", "Bouygues Immobilier"
        COLAS = "COLAS", "Colas"
        TF1 = "TF1", "TF1"
        BOUYGUES_ENERGIES_SERVICES = "BOUYGUES_ENERGIES_SERVICES", "Bouygues Energies & Services"
        EQUANS = "EQUANS", "Equans"
        BOUYGUES_TELECOM = "BOUYGUES_TELECOM", "Bouygues Telecom"
        BOUYGUES_SA = "BOUYGUES_SA", "Bouygues SA (Holding)"
        OTHER = "OTHER", "Autre"

    entity = models.CharField(max_length=50, choices=Entity.choices, blank=True, null=True)

    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)

    number_of_users = models.PositiveIntegerField(default=0)

    class PCType(models.TextChoices):
        LAPTOP_ONLY = "LAPTOP_ONLY", "Laptop uniquement"
        DESKTOP_ONLY = "DESKTOP_ONLY", "Desktop uniquement"
        BOTH = "BOTH", "Les deux"

    pc_type = models.CharField(max_length=20, choices=PCType.choices, default=PCType.BOTH)

    num_laptop_office = models.PositiveIntegerField(default=0, help_text="Nombre de laptop bureautique")
    num_laptop_tech = models.PositiveIntegerField(default=0, help_text="Nombre de laptop technique")
    num_desktop_office = models.PositiveIntegerField(default=0, help_text="Nombre de desktop bureautique")
    num_desktop_tech = models.PositiveIntegerField(default=0, help_text="Nombre de desktop technique")

    local_apps = models.BooleanField(default=False, help_text="Y a-t-il des applications locales ?")
    local_apps_list = models.TextField(blank=True, default="", help_text="Liste des applications locales (ex: SAGE, GMAO)")

    file_server = models.BooleanField(default=False, help_text="Serveur de fichiers présent ?")

    site_addresses = models.TextField(blank=True, default="", help_text="Adresses de chaque site/atelier")
    gps_coordinates = models.CharField(max_length=100, blank=True, default="", help_text="Coordonnées GPS (ex: 24.793387, 46.654397)")

    class InternetLineType(models.TextChoices):
        FO = "FO", "FO"
        VSAT = "VSAT", "VSAT"
        STARLINK = "STARLINK", "STARLINK"
        OTHER = "OTHER", "Autre"

    internet_line_type = models.CharField(max_length=20, choices=InternetLineType.choices, blank=True, null=True)
    internet_line_speed = models.CharField(max_length=50, blank=True, default="", help_text="Ex: 100Mbps")

    num_printers = models.PositiveIntegerField(default=0)
    num_traceau = models.PositiveIntegerField(default=0, help_text="Nombre de traceau")
    num_videoconference = models.PositiveIntegerField(default=0)
    num_aps = models.PositiveIntegerField(default=0, help_text="Nombre de points d'accès (AP)")
    
    # Switch quantities
    num_switch_24 = models.PositiveIntegerField(default=0, help_text="Nombre de switch 24 ports")
    num_switch_48 = models.PositiveIntegerField(default=0, help_text="Nombre de switch 48 ports")

    # --- VISIO TYPE (moved inside Project) ---
    visio_type = models.CharField(
        max_length=30,
        choices=VisioType.choices,
        blank=True,
        null=True,
        help_text="Type de visioconférence (ex: room system, software, SIP/H.323)"
    )

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        APPROVED = "approved", "Approved"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    
    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        URGENT = "urgent", "Urgent"
    
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    progress = models.PositiveIntegerField(default=0, help_text="Progress percentage (0-100)")

    # Budget fields - calculated and stored in database
    total_cost_france = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Total cost in EUR")
    total_cost_morocco = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Total cost in MAD")

    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="projects")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    # relations équipement via modèles de liaison
    network_equipment = models.ManyToManyField(NetworkEquipment, through="ProjectNetworkItem", blank=True)
    server_equipment = models.ManyToManyField(ServerEquipment, through="ProjectServerItem", blank=True)
    user_devices = models.ManyToManyField(UserDevice, through="ProjectUserDeviceItem", blank=True)
    software_licenses = models.ManyToManyField(SoftwareLicense, through="ProjectSoftwareItem", blank=True)
    services = models.ManyToManyField(Service, through="ProjectServiceItem", blank=True)
    visio_equipment = models.ManyToManyField(VisioEquipment, through="ProjectVisioItem", blank=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def number_of_sites(self):
        """Calculate number of sites from site_addresses"""
        if not self.site_addresses:
            return 1
        return len([addr.strip() for addr in self.site_addresses.split(',') if addr.strip()])
    
    @property
    def total_devices(self):
        """Calculate total number of devices"""
        return (self.num_laptop_office + self.num_laptop_tech + 
                self.num_desktop_office + self.num_desktop_tech + 
                self.num_printers + self.num_aps + 
                self.num_traceau + self.num_videoconference)

    def get_company_name_from_entity(self):
        """Get company name based on entity selection"""
        if not self.entity:
            return ""
        
        entity_mapping = {
            self.Entity.BOUYGUES_CONSTRUCTION: "Bouygues Construction",
            self.Entity.BOUYGUES_IMMOBILIER: "Bouygues Immobilier", 
            self.Entity.COLAS: "Colas",
            self.Entity.TF1: "TF1",
            self.Entity.BOUYGUES_ENERGIES_SERVICES: "Bouygues Energies & Services",
            self.Entity.EQUANS: "Equans",
            self.Entity.BOUYGUES_TELECOM: "Bouygues Telecom",
            self.Entity.BOUYGUES_SA: "Bouygues SA (Holding)",
            self.Entity.OTHER: "Other Company"
        }
        return entity_mapping.get(self.entity, "")
    
    def calculate_progress_from_status(self):
        """Calculate progress percentage based on project status"""
        status_progress_mapping = {
            'draft': 0,
            'submitted': 20,
            'approved': 40,
            'in_progress': 70,
            'completed': 100
        }
        return status_progress_mapping.get(self.status, 0)
    
    def calculate_priority_from_data(self):
        """Calculate priority based on project data"""
        priority_score = 0
        
        # Factor 1: Number of users (more users = higher priority)
        if self.number_of_users > 500:
            priority_score += 3
        elif self.number_of_users > 200:
            priority_score += 2
        elif self.number_of_users > 50:
            priority_score += 1
        
        # Factor 2: Project duration (shorter projects = higher priority)
        if self.start_date and self.end_date:
            duration_days = (self.end_date - self.start_date).days
            if duration_days < 30:
                priority_score += 3
            elif duration_days < 90:
                priority_score += 2
            elif duration_days < 180:
                priority_score += 1
        
        # Factor 3: Entity type (some entities are more critical)
        critical_entities = ['BOUYGUES_TELECOM', 'BOUYGUES_ENERGIES_SERVICES', 'EQUANS']
        if self.entity in critical_entities:
            priority_score += 2
        
        # Factor 4: Equipment complexity (more equipment = higher priority)
        # Only calculate if project has been saved (has primary key)
        if self.pk:
            total_equipment = (
                self.projectnetworkitem_set.count() +
                self.projectserveritem_set.count() +
                self.projectuserdeviceitem_set.count() +
                self.projectsoftwareitem_set.count() +
                self.projectserviceitem_set.count()
            )
            if total_equipment > 20:
                priority_score += 2
            elif total_equipment > 10:
                priority_score += 1
        else:
            # For new projects, estimate based on user input
            estimated_equipment = (
                self.num_laptop_office + self.num_laptop_tech +
                self.num_desktop_office + self.num_desktop_tech +
                self.num_printers + self.num_traceau + 
                self.num_videoconference + self.num_aps
            )
            if estimated_equipment > 20:
                priority_score += 2
            elif estimated_equipment > 10:
                priority_score += 1
        
        # Convert score to priority
        if priority_score >= 6:
            return 'urgent'
        elif priority_score >= 4:
            return 'high'
        elif priority_score >= 2:
            return 'medium'
        else:
            return 'low'

    def save(self, *args, **kwargs):
        # Auto-set company name based on entity
        if self.entity:
            # Check if this is an update and entity has changed
            if self.pk:
                try:
                    old_instance = Project.objects.get(pk=self.pk)
                    if old_instance.entity != self.entity:
                        # Entity changed, update company name
                        self.company_name = self.get_company_name_from_entity()
                except Project.DoesNotExist:
                    # New instance, set company name
                    self.company_name = self.get_company_name_from_entity()
            else:
                # New instance, set company name
                self.company_name = self.get_company_name_from_entity()
        
        # Auto-update progress based on status
        self.progress = self.calculate_progress_from_status()
        
        # Auto-update priority based on project data (only for new projects or if still default)
        if not self.pk or self.priority == 'medium':
            self.priority = self.calculate_priority_from_data()
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.company_name or 'N/A'}"

class ProjectInfrastructureItem(models.Model):
    equipment = models.ForeignKey(InfrastructureEquipment, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    source = models.CharField(max_length=50, blank=True, default="")
    purchase_location = models.CharField(max_length=10, choices=PurchaseLocation.choices, default=PurchaseLocation.FRANCE)

    class Meta:
        unique_together = ("project", "equipment")

class ProjectNetworkItem(models.Model):
    equipment = models.ForeignKey(NetworkEquipment, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    source = models.CharField(max_length=50, blank=True, default="")
    purchase_location = models.CharField(max_length=10, choices=PurchaseLocation.choices, default=PurchaseLocation.FRANCE)

    class Meta:
        unique_together = ("project", "equipment")


class ProjectServerItem(models.Model):
    equipment = models.ForeignKey(ServerEquipment, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    source = models.CharField(max_length=50, blank=True, default="")
    purchase_location = models.CharField(max_length=10, choices=PurchaseLocation.choices, default=PurchaseLocation.FRANCE)

    class Meta:
        unique_together = ("project", "equipment")


class ProjectUserDeviceItem(models.Model):
    equipment = models.ForeignKey(UserDevice, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    source = models.CharField(max_length=50, blank=True, default="")
    purchase_location = models.CharField(max_length=10, choices=PurchaseLocation.choices, default=PurchaseLocation.FRANCE)

    class Meta:
        unique_together = ("project", "equipment")


class ProjectSoftwareItem(models.Model):
    equipment = models.ForeignKey(SoftwareLicense, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    source = models.CharField(max_length=50, blank=True, default="")
    purchase_location = models.CharField(max_length=10, choices=PurchaseLocation.choices, default=PurchaseLocation.FRANCE)

    class Meta:
        unique_together = ("project", "equipment")


class ProjectServiceItem(models.Model):
    equipment = models.ForeignKey(Service, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    source = models.CharField(max_length=50, blank=True, default="")
    purchase_location = models.CharField(max_length=10, choices=PurchaseLocation.choices, default=PurchaseLocation.FRANCE)

    class Meta:
        unique_together = ("project", "equipment")


# --- NEW: ProjectVisioItem linking table ---
class ProjectVisioItem(models.Model):
    equipment = models.ForeignKey(VisioEquipment, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    source = models.CharField(max_length=50, blank=True, default="")
    purchase_location = models.CharField(max_length=10, choices=PurchaseLocation.choices, default=PurchaseLocation.FRANCE)

    class Meta:
        unique_together = ("project", "equipment")