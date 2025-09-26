from django.db import models
from django.utils import timezone
from accounts.models import User

# Legacy equipment models removed - using Material model instead

class VisioType(models.TextChoices):
    HARDWARE_CODEC = "HARDWARE_CODEC", "Hardware codec (room system)"
    SOFTWARE = "SOFTWARE", "Software (Teams/Zoom)"
    ROOM_SYSTEM = "ROOM_SYSTEM", "Room system"
    SIP_H323 = "SIP_H323", "SIP / H.323"
    OTHER = "OTHER", "Autre"

class Project(models.Model):
    name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255, blank=True, default="")
    # Legacy equipment relations removed - using Material model instead
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
    num_traceau = models.PositiveIntegerField(default=0, help_text="Nombre de Traceur A0")
    num_videoconference = models.PositiveIntegerField(default=0)
    num_aps = models.PositiveIntegerField(default=0, help_text="Nombre de points d'accès (AP)")
    
    # Switch quantities
    num_switch_24 = models.PositiveIntegerField(default=0, help_text="Nombre de switch 24 ports")
    num_switch_48 = models.PositiveIntegerField(default=0, help_text="Nombre de switch 48 ports")

    # --- VISIO TYPE ---
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

    # Legacy equipment relations removed - using Material model instead

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

# Legacy project item models removed - using calculations.models.ProjectItem instead