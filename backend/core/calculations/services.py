import math
from decimal import Decimal
from django.db import transaction
from materials.models import Material, Category
from projects.models import Project
from calculations.models import ProjectItem


class ProjectCalculator:
    """Main calculation engine for IT infrastructure projects"""
    
    def __init__(self):
        self.auto_calculated_items = {
            'Rack': 'sites',
            'UPS': 'sites', 
            'Servers': 'max(users // 50, sites)',
            'Network Switches': 'math.ceil(total_devices / 24) * sites',
            'Network Cables': 'total_devices * 2 * sites',
            'KVM Console': 'sites',
            'KVM Switch': 'sites',
            'KVM Cables': 'sites * 4',
            'PDU': 'sites * 2',
            'DAC Cables': 'servers * 2',
            'Transceivers': 'dac_cables * 2',
        }
    
    def calculate_automatic_items(self, project):
        """Calculate automatically required items based on project specifications"""
        sites = project.number_of_sites
        users = project.number_of_users
        total_devices = project.total_devices
        
        # Calculate basic auto items - using exact database material names
        auto_items = {}
        
        # Rack: 1 per site
        auto_items['Rack'] = sites
        
        # UPS: 1 per site
        auto_items['Onduleur (UPS) 3000VA'] = sites
        
        # Servers: MAX(users ÷ 50, sites)
        auto_items['Application server'] = max(users // 50, sites)
        
        # Network Switches: CEILING(total_devices ÷ 24) per site
        switch_count = math.ceil(total_devices / 24) * sites
        auto_items['Switch 24 Ports PoE'] = min(switch_count, 2)  # Max 2 switches
        auto_items['Switch 48 Ports PoE'] = max(0, switch_count - 2)  # Additional switches
        
        # Network Cables: (total_devices × 2) per site
        cable_count = total_devices * 2 * sites
        auto_items['Câble réseau blindé Cat 6 0.5 m'] = int(cable_count * 0.3)
        auto_items['Câble réseau blindé Cat 6 2 m'] = int(cable_count * 0.4)
        auto_items['Câble réseau blindé Cat 6 5 m'] = int(cable_count * 0.2)
        auto_items['Câble réseau blindé Cat 6 10 m'] = int(cable_count * 0.1)
        
        # KVM Console: 1 per site
        auto_items['KVM Console'] = sites
        
        # KVM Switch: 1 per site
        auto_items['KVM Switch'] = sites
        
        # KVM Cables: 4 per site
        auto_items['KVM Cables'] = sites * 4
        
        # PDU: 2 per site
        auto_items['PDU (Power Distribution Unit)'] = sites * 2
        
        # DAC Cables: servers × 2
        servers = auto_items['Application server']
        auto_items['DAC Cable'] = servers * 2
        
        # Transceivers: DAC cables × 2
        dac_cables = auto_items['DAC Cable']
        auto_items['Tranceiver RJ45'] = dac_cables * 2
        
        return auto_items
    
    def get_user_specified_items(self, project):
        """Get user-specified equipment quantities"""
        user_items = {}
        
        # Equipment items - using exact database material names
        if project.num_laptop_office > 0:
            user_items['Laptop - Office'] = project.num_laptop_office
        if project.num_laptop_tech > 0:
            user_items['Laptop - Tech'] = project.num_laptop_tech
        if project.num_desktop_office > 0:
            user_items['Desktop - Office'] = project.num_desktop_office
        if project.num_desktop_tech > 0:
            user_items['Desktop - Tech'] = project.num_desktop_tech
        if project.num_printers > 0:
            user_items['Printer'] = project.num_printers
        if project.num_traceau > 0:
            user_items['Traceur A0'] = project.num_traceau
        if project.num_videoconference > 0:
            user_items['Standard visio system'] = project.num_videoconference
        if project.num_aps > 0:
            user_items['Access Point'] = project.num_aps
            
        return user_items
    
    def get_service_items(self, project):
        """Get service-related items based on user selections"""
        service_items = {}
        
        # File Server
        if project.file_server:
            service_items['File Server (Standard)'] = 1
        
        # Internet Service - match with database material names
        if project.internet_line_speed:
            # Try to find matching internet service material
            speed = project.internet_line_speed
            line_type = project.internet_line_type or 'FO'
            
            # Check for specific combinations
            if line_type == 'STARLINK':
                service_items[f'STARLINK {speed}'] = 1
            elif line_type == 'VSAT':
                service_items[f'VSAT {speed}'] = 1
            elif line_type == 'FO':
                service_items[f'Fiber Optic {speed}'] = 1
            else:
                # Fallback to generic internet line
                service_items['Internet line (STARLINK)'] = 1
            
        return service_items
    
    def calculate_budget(self, project):
        """Calculate complete project budget"""
        # Get all items
        user_items = self.get_user_specified_items(project)
        auto_items = self.calculate_automatic_items(project)
        service_items = self.get_service_items(project)
        custom_items = self.calculate_custom_materials(project)
        
        # Combine all items
        all_items = {**user_items, **auto_items, **service_items, **custom_items}
        
        # Calculate costs
        total_france = Decimal('0')
        total_morocco = Decimal('0')
        project_items = []
        
        for item_name, quantity in all_items.items():
            if quantity > 0:
                try:
                    material = Material.objects.get(name=item_name, is_active=True)
                    cost_france = quantity * material.price_france
                    cost_morocco = quantity * material.price_morocco
                    
                    total_france += cost_france
                    total_morocco += cost_morocco
                    
                    # Determine if item is auto-calculated
                    is_auto = item_name in auto_items
                    
                    project_items.append({
                        'material': material,
                        'quantity': quantity,
                        'unit_cost_france': material.price_france,
                        'unit_cost_morocco': material.price_morocco,
                        'total_cost_france': cost_france,
                        'total_cost_morocco': cost_morocco,
                        'is_auto_calculated': is_auto
                    })
                    
                except Material.DoesNotExist:
                    # Log missing material for admin to add
                    print(f"Warning: Material '{item_name}' not found in database")
                    continue
        
        return project_items, total_france, total_morocco
    
    @transaction.atomic
    def save_project_budget(self, project):
        """Save calculated budget to database"""
        # Clear existing items
        ProjectItem.objects.filter(project=project).delete()
        
        # Calculate new budget
        project_items, total_france, total_morocco = self.calculate_budget(project)
        
        # Save project items
        for item_data in project_items:
            ProjectItem.objects.create(
                project=project,
                material=item_data['material'],
                quantity=item_data['quantity'],
                is_auto_calculated=item_data['is_auto_calculated'],
                unit_cost_france=item_data['unit_cost_france'],
                unit_cost_morocco=item_data['unit_cost_morocco'],
                total_cost_france=item_data['total_cost_france'],
                total_cost_morocco=item_data['total_cost_morocco']
            )
        
        # Update project totals
        project.total_cost_france = total_france
        project.total_cost_morocco = total_morocco
        project.save()
        
        return project_items, total_france, total_morocco
    
    def get_budget_breakdown(self, project):
        """Get budget breakdown by category"""
        items = ProjectItem.objects.filter(project=project).select_related('material__category')
        
        breakdown = {}
        for item in items:
            category_name = item.material.category.name
            if category_name not in breakdown:
                breakdown[category_name] = {
                    'items': [],
                    'total_france': Decimal('0'),
                    'total_morocco': Decimal('0')
                }
            
            breakdown[category_name]['items'].append(item)
            breakdown[category_name]['total_france'] += item.total_cost_france
            breakdown[category_name]['total_morocco'] += item.total_cost_morocco
        
        return breakdown

    def calculate_custom_materials(self, project):
        """Calculate quantities for custom materials based on smart rules"""
        from materials.models import Material
        
        custom_materials = Material.objects.filter(
            is_active=True,
            calculation_type__in=['PER_USER', 'PER_SERVER', 'PER_DEVICE', 'PER_SWITCH', 'PER_PROJECT', 'FIXED', 'CONDITIONAL']
        )
        
        calculated_items = {}
        
        for material in custom_materials:
            quantity = self._calculate_material_quantity(material, project)
            if quantity > 0:
                calculated_items[material.name] = quantity
        
        return calculated_items

    def _calculate_material_quantity(self, material, project):
        """Calculate quantity for a specific material based on its rules"""
        
        if material.calculation_type == 'PER_USER':
            quantity = project.number_of_users * material.multiplier
            # Apply minimum quantity if specified
            if hasattr(material, 'min_quantity') and material.min_quantity:
                quantity = max(quantity, material.min_quantity)
        
        elif material.calculation_type == 'PER_SERVER':
            # Count servers based on file_server and local_apps choices
            servers = 0
            if project.file_server:
                servers += 1
            if project.local_apps:
                servers += 1
            quantity = servers * material.multiplier
        
        elif material.calculation_type == 'PER_DEVICE':
            # Count total PCs (laptops + desktops)
            total_pcs = (project.num_laptop_office + project.num_laptop_tech + 
                        project.num_desktop_office + project.num_desktop_tech)
            quantity = total_pcs * material.multiplier
        
        elif material.calculation_type == 'PER_SWITCH':
            # Calculate total switches automatically based on user count
            # Switch 24 ports: Always 2 (fixed)
            # Switch 48 ports: (users × 1.5) ÷ 48 (calculated)
            switch_24 = 2  # Always 2
            switch_48 = max(0, int((project.number_of_users * 1.5) // 48))  # Round down
            total_switches = switch_24 + switch_48
            quantity = total_switches * material.multiplier
        
        elif material.calculation_type == 'PER_PROJECT':
            quantity = material.multiplier
        
        elif material.calculation_type == 'FIXED':
            quantity = material.multiplier
        
        elif material.calculation_type == 'CONDITIONAL':
            if self._check_conditions(material.conditions, project):
                quantity = material.multiplier
            else:
                quantity = 0
        
        # Apply min/max limits
        quantity = max(material.min_quantity, min(quantity, material.max_quantity))
        
        return int(quantity)

    def _check_conditions(self, conditions, project):
        """Check if project meets material conditions"""
        for condition, value in conditions.items():
            if condition == 'min_users' and project.number_of_users < value:
                return False
            elif condition == 'max_users' and project.number_of_users > value:
                return False
            elif condition == 'min_servers' and (project.num_laptop_office + project.num_desktop_office) < value:
                return False
            elif condition == 'has_videoconference' and project.num_videoconference == 0:
                return False
            elif condition == 'has_file_server' and not project.file_server:
                return False
            elif condition == 'has_local_apps' and not project.local_apps:
                return False
            # Add more conditions as needed
        return True


class MaterialManager:
    """Helper class for managing materials and categories"""
    
    @staticmethod
    def create_default_categories():
        """Create default categories if they don't exist"""
        categories = [
            'Ordinateurs',
            'Réseau', 
            'Infrastructure',
            'Imprimantes',
            'Services'
        ]
        
        for cat_name in categories:
            Category.objects.get_or_create(name=cat_name)
    
    @staticmethod
    def create_default_materials():
        """Create default materials for testing"""
        materials_data = [
            # Ordinateurs
            ('Laptop Bureautique', 'Ordinateurs', 800, 8000, False),
            ('Laptop Technique', 'Ordinateurs', 1200, 12000, False),
            ('Desktop Bureautique', 'Ordinateurs', 600, 6000, False),
            ('Desktop Technique', 'Ordinateurs', 1000, 10000, False),
            
            # Réseau
            ('Servers', 'Réseau', 2000, 20000, True),
            ('Network Switches', 'Réseau', 200, 2000, True),
            ('Network Cables', 'Réseau', 10, 100, True),
            ('Access Points', 'Réseau', 150, 1500, False),
            ('KVM Console', 'Réseau', 300, 3000, True),
            ('KVM Switch', 'Réseau', 250, 2500, True),
            ('KVM Cables', 'Réseau', 50, 500, True),
            ('DAC Cables', 'Réseau', 100, 1000, True),
            ('Transceivers', 'Réseau', 80, 800, True),
            
            # Infrastructure
            ('Rack', 'Infrastructure', 500, 5000, True),
            ('UPS', 'Infrastructure', 400, 4000, True),
            ('PDU', 'Infrastructure', 150, 1500, True),
            
            # Imprimantes
            ('Printers', 'Imprimantes', 300, 3000, False),
            
            # Services
            ('File Server', 'Services', 1500, 15000, False, True),
            ('Internet 100MBps', 'Services', 200, 2000, False, True),
            ('Internet 200MBps', 'Services', 350, 3500, False, True),
            ('Internet 500MBps', 'Services', 600, 6000, False, True),
        ]
        
        for material_data in materials_data:
            name, category_name, price_fr, price_mo, is_auto = material_data[:5]
            is_service = material_data[5] if len(material_data) > 5 else False
            
            try:
                category = Category.objects.get(name=category_name)
                Material.objects.get_or_create(
                    name=name,
                    defaults={
                        'category': category,
                        'price_france': price_fr,
                        'price_morocco': price_mo,
                        'is_auto_calculated': is_auto,
                        'is_service': is_service
                    }
                )
            except Category.DoesNotExist:
                print(f"Category '{category_name}' not found. Please create categories first.")

    @staticmethod
    def manage_materials(materials_list):
        """
        Enhanced material management function that:
        1. Checks if materials exist in correct categories
        2. Moves materials from wrong categories to correct ones
        3. Adds missing materials with descriptions
        4. Updates existing materials with descriptions if missing
        
        materials_list format:
        [
            {
                'name': 'Material Name',
                'category': 'Category Name',
                'price_france': 100.00,
                'price_morocco': 1000.00,
                'is_auto_calculated': False,
                'is_service': False,
                'description': 'Material description',
                'unit': 'unit'
            },
            ...
        ]
        """
        results = {
            'created': 0,
            'updated': 0,
            'moved': 0,
            'errors': []
        }
        
        for material_data in materials_list:
            try:
                name = material_data['name']
                category_name = material_data['category']
                price_france = material_data.get('price_france', 0)
                price_morocco = material_data.get('price_morocco', 0)
                is_auto_calculated = material_data.get('is_auto_calculated', False)
                is_service = material_data.get('is_service', False)
                description = material_data.get('description', '')
                unit = material_data.get('unit', 'unit')
                
                # Get or create category
                category, category_created = Category.objects.get_or_create(
                    name=category_name,
                    defaults={'description': f'Category for {category_name.lower()} materials'}
                )
                
                # Check if material exists
                try:
                    existing_material = Material.objects.get(name=name)
                    
                    # Check if material is in wrong category
                    if existing_material.category != category:
                        old_category = existing_material.category.name
                        existing_material.category = category
                        existing_material.save()
                        results['moved'] += 1
                        print(f"Moved '{name}' from '{old_category}' to '{category_name}'")
                    
                    # Update description if missing
                    if not existing_material.description and description:
                        existing_material.description = description
                        existing_material.save()
                        results['updated'] += 1
                        print(f"Updated description for '{name}'")
                    
                    # Update other fields if needed
                    if existing_material.price_france != price_france:
                        existing_material.price_france = price_france
                        existing_material.save()
                        results['updated'] += 1
                        print(f"Updated price for '{name}'")
                    
                    if existing_material.price_morocco != price_morocco:
                        existing_material.price_morocco = price_morocco
                        existing_material.save()
                        results['updated'] += 1
                        print(f"Updated price for '{name}'")
                        
                except Material.DoesNotExist:
                    # Create new material
                    Material.objects.create(
                        name=name,
                        category=category,
                        price_france=price_france,
                        price_morocco=price_morocco,
                        is_auto_calculated=is_auto_calculated,
                        is_service=is_service,
                        description=description,
                        unit=unit
                    )
                    results['created'] += 1
                    print(f"Created new material '{name}' in category '{category_name}'")
                    
            except Exception as e:
                error_msg = f"Error processing material '{material_data.get('name', 'Unknown')}': {str(e)}"
                results['errors'].append(error_msg)
                print(error_msg)
        
        return results

