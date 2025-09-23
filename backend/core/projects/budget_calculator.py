from decimal import Decimal
from django.db import transaction
from materials.models import Material


class ProjectBudgetCalculator:
    """
    Service class to calculate project budgets based on project requirements
    and material prices from the database.
    """
    
    def __init__(self):
        self.materials_cache = {}
        self._load_materials()
    
    def _load_materials(self):
        """Load all materials into cache for faster lookup"""
        materials = Material.objects.all()
        for material in materials:
            self.materials_cache[material.name] = material
        print(f"Loaded {len(self.materials_cache)} materials for budget calculation")
    
    def _find_material(self, name):
        """Find material by name with fallback logic"""
        # Direct match
        if name in self.materials_cache:
            return self.materials_cache[name]
        
        # Case-insensitive match
        for material_name, material in self.materials_cache.items():
            if material_name.lower() == name.lower():
                return material
        
        # Partial match for internet services
        if any(keyword in name.lower() for keyword in ['fiber', 'starlink', 'vsat', 'internet']):
            for material_name, material in self.materials_cache.items():
                if any(keyword in material_name.lower() for keyword in ['fiber', 'starlink', 'vsat', 'internet']):
                    # Check if speed matches
                    if self._extract_speed(name) == self._extract_speed(material_name):
                        return material
        
        print(f"Material not found: {name}")
        return None
    
    def _extract_speed(self, name):
        """Extract speed from material name (e.g., '100MBps' from 'Fiber Optic 100MBps')"""
        import re
        match = re.search(r'(\d+)\s*MBps?', name, re.IGNORECASE)
        return match.group(1) if match else None
    
    def calculate_budget(self, project):
        """
        Calculate total budget for a project based on its requirements
        """
        total_france = Decimal('0')
        total_morocco = Decimal('0')
        
        # User-specified equipment
        equipment_mappings = [
            ('num_laptop_office', 'Laptop - Office'),
            ('num_laptop_tech', 'Laptop - Tech'),
            ('num_desktop_office', 'Desktop - Office'),
            ('num_desktop_tech', 'Desktop - Tech'),
            ('num_printers', 'Printer'),
            ('num_aps', 'Access Point'),
            ('num_traceau', 'Traceau'),
            ('num_videoconference', 'Visio endpoint'),
        ]
        
        for field_name, material_name in equipment_mappings:
            quantity = getattr(project, field_name, 0) or 0
            if quantity > 0:
                material = self._find_material(material_name)
                if material:
                    cost_france = quantity * material.price_france
                    cost_morocco = quantity * material.price_morocco
                    total_france += cost_france
                    total_morocco += cost_morocco
                    print(f"Added {material_name}: {quantity} x {material.price_france}€ = {cost_france}€")
        
        # Auto-calculated infrastructure items
        auto_items = self._calculate_auto_items(project)
        
        for item_name, quantity in auto_items.items():
            if quantity > 0:
                material = self._find_material(item_name)
                if material:
                    cost_france = quantity * material.price_france
                    cost_morocco = quantity * material.price_morocco
                    total_france += cost_france
                    total_morocco += cost_morocco
                    print(f"Added {item_name}: {quantity} x {material.price_france}€ = {cost_france}€")
                else:
                    print(f"Warning: Material not found for auto item: {item_name}")
        
        return total_france, total_morocco

    def calculate_detailed_budget(self, project):
        """
        Calculate detailed budget breakdown by category
        """
        breakdown = {
            'user_devices': {'france': Decimal('0'), 'morocco': Decimal('0'), 'items': 0},
            'network_equipment': {'france': Decimal('0'), 'morocco': Decimal('0'), 'items': 0},
            'server_equipment': {'france': Decimal('0'), 'morocco': Decimal('0'), 'items': 0},
            'infrastructure_equipment': {'france': Decimal('0'), 'morocco': Decimal('0'), 'items': 0},
            'software_licenses': {'france': Decimal('0'), 'morocco': Decimal('0'), 'items': 0},
            'services': {'france': Decimal('0'), 'morocco': Decimal('0'), 'items': 0},
        }
        
        # User-specified equipment (User Devices)
        equipment_mappings = [
            ('num_laptop_office', 'Laptop - Office'),
            ('num_laptop_tech', 'Laptop - Tech'),
            ('num_desktop_office', 'Desktop - Office'),
            ('num_desktop_tech', 'Desktop - Tech'),
            ('num_printers', 'Printer'),
            ('num_aps', 'Access Point'),
            ('num_traceau', 'Traceau'),
            ('num_videoconference', 'Visio endpoint'),
        ]
        
        for field_name, material_name in equipment_mappings:
            quantity = getattr(project, field_name, 0) or 0
            if quantity > 0:
                material = self._find_material(material_name)
                if material:
                    cost_france = quantity * material.price_france
                    cost_morocco = quantity * material.price_morocco
                    breakdown['user_devices']['france'] += cost_france
                    breakdown['user_devices']['morocco'] += cost_morocco
                    breakdown['user_devices']['items'] += quantity
        
        # Auto-calculated infrastructure items
        auto_items = self._calculate_auto_items(project)
        
        for item_name, quantity in auto_items.items():
            if quantity > 0:
                material = self._find_material(item_name)
                if material:
                    cost_france = quantity * material.price_france
                    cost_morocco = quantity * material.price_morocco
                    
                    # Categorize items
                    category = self._categorize_item(item_name)
                    breakdown[category]['france'] += cost_france
                    breakdown[category]['morocco'] += cost_morocco
                    breakdown[category]['items'] += quantity
        
        return breakdown

    def _categorize_item(self, item_name):
        """
        Categorize an item based on its name
        """
        item_lower = item_name.lower()
        
        # Server Equipment
        if any(keyword in item_lower for keyword in ['server', 'virtual machine']):
            return 'server_equipment'
        
        # Network Equipment
        elif any(keyword in item_lower for keyword in ['switch', 'cable', 'dac', 'transceiver', 'firewall', 'wifi', 'access point']):
            return 'network_equipment'
        
        # Infrastructure Equipment
        elif any(keyword in item_lower for keyword in ['rack', 'ups', 'pdu', 'kvm']):
            return 'infrastructure_equipment'
        
        # Software Licenses
        elif any(keyword in item_lower for keyword in ['license', 'windows']):
            return 'software_licenses'
        
        # Services (Internet, etc.)
        elif any(keyword in item_lower for keyword in ['fiber', 'starlink', 'vsat', 'internet']):
            return 'services'
        
        # Default to infrastructure
        else:
            return 'infrastructure_equipment'
    
    def _calculate_auto_items(self, project):
        """
        Calculate auto-generated items based on project requirements
        """
        number_of_users = project.number_of_users or 0
        number_of_sites = project.number_of_sites
        total_devices = (
            (project.num_laptop_office or 0) +
            (project.num_laptop_tech or 0) +
            (project.num_desktop_office or 0) +
            (project.num_desktop_tech or 0) +
            (project.num_printers or 0) +
            (project.num_aps or 0) +
            (project.num_traceau or 0) +
            (project.num_videoconference or 0)
        )
        
        # Calculate server and network requirements
        server_count = max(number_of_users // 50, number_of_sites)
        switch_count = ((total_devices + 23) // 24) * number_of_sites  # Round up division
        cable_count = total_devices * 2 * number_of_sites
        
        auto_items = {
            # Infrastructure Equipment
            'Rack': number_of_sites,
            'Onduleur (UPS) 3000VA': number_of_sites,
            'PDU (Power Distribution Unit)': number_of_sites * 2,
            
            # Servers
            'Server Dell R540': server_count,
            'Virtual Machine Config': server_count,
            
            # Network Equipment - Switches
            'Switch 24 Ports PoE': min(switch_count, 2),
            'Switch 48 Ports PoE': max(0, switch_count - 2),
            
            # Network Equipment - Cables
            'Câble réseau blindé Cat 6 0.5 m': int(cable_count * 0.3),
            'Câble réseau blindé Cat 6 2 m': int(cable_count * 0.4),
            'Câble réseau blindé Cat 6 5 m': int(cable_count * 0.2),
            'Câble réseau blindé Cat 6 10 m': int(cable_count * 0.1),
            
            # Network Equipment - Server connections
            'DAC Cable 1m': server_count * 2,
            'DAC Cable 3m': server_count * 1,
            'Transceivers': server_count * 4,
            
            # Network Equipment - Security
            'Firewall Appliance': number_of_sites,
            
            # Network Equipment - WiFi
            'Wifi Access Point Indoor': (number_of_users + 19) // 20,  # Round up division
            'Wifi Access Point Outdoor': number_of_sites,
            'Wifi Access Point Camp': (number_of_sites + 1) // 2,  # Round up division
            
            # KVM Equipment
            'KVM Console': number_of_sites,
            'KVM Switch': number_of_sites,
            'KVM Cables': number_of_sites * 4,
            
            # Licenses
            'Windows Client License (Windows Pro)': total_devices,
            'Windows Server License': server_count,
        }
        
        # Add File Server if needed
        if project.file_server:
            auto_items['File Server (Standard)'] = 1
        
        # Add Internet service if specified
        if project.internet_line_type and project.internet_line_speed:
            internet_name = self._get_internet_material_name(project.internet_line_type, project.internet_line_speed)
            auto_items[internet_name] = 1
        
        return auto_items
    
    def _get_internet_material_name(self, line_type, speed):
        """Get the correct material name for internet service"""
        if line_type == 'FO':
            return f'Fiber Optic {speed}'
        elif line_type == 'STARLINK':
            return f'STARLINK {speed}'
        elif line_type == 'VSAT':
            return f'VSAT {speed}'
        else:
            return f'Internet {speed}'
    
    @transaction.atomic
    def save_project_budget(self, project):
        """
        Calculate and save budget to project
        """
        total_france, total_morocco = self.calculate_budget(project)
        
        project.total_cost_france = total_france
        project.total_cost_morocco = total_morocco
        project.save(update_fields=['total_cost_france', 'total_cost_morocco'])
        
        print(f"Saved budget for project {project.name}: {total_france}€ / {total_morocco} MAD")
        return total_france, total_morocco
