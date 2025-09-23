#!/usr/bin/env python
"""
Script to populate the database with IT Infrastructure categories and materials
based on the provided spreadsheet structure.
"""

import os
import sys
import django
from decimal import Decimal

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from materials.models import Category, Material

def create_categories():
    """Create the IT Infrastructure categories"""
    categories_data = [
        {
            'name': 'Infrastructure',
            'description': 'Cables, UPS, PDU and other infrastructure equipment'
        },
        {
            'name': 'Network Equipment',
            'description': 'Network equipment like switches, routers, access points, firewalls'
        },
        {
            'name': 'Server Equipment',
            'description': 'Server equipment and related hardware'
        },
        {
            'name': 'User Devices',
            'description': 'User devices like laptops, desktops, printers'
        },
        {
            'name': 'Software Licenses',
            'description': 'Software licenses for Windows and other applications'
        },
        {
            'name': 'Services',
            'description': 'Internet services and other subscriptions'
        },
        {
            'name': 'Videoconferencing',
            'description': 'Videoconferencing equipment and endpoints'
        }
    ]
    
    created_categories = {}
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={'description': cat_data['description']}
        )
        created_categories[cat_data['name']] = category
        if created:
            print(f"✅ Created category: {category.name}")
        else:
            print(f"ℹ️  Category already exists: {category.name}")
    
    return created_categories

def create_materials(categories):
    """Create materials based on the spreadsheet data"""
    materials_data = [
        # Infrastructure
        {
            'name': 'Rack',
            'description': 'Server Rack',
            'category': 'Infrastructure',
            'price_france': Decimal('500.00'),
            'price_morocco': Decimal('5000.00'),
            'unit': 'unit'
        },
        {
            'name': 'Câble réseau blindé Cat 6 5 m',
            'description': 'Shielded network cable Cat 6 5m',
            'category': 'Infrastructure',
            'price_france': Decimal('0.00'),
            'price_morocco': Decimal('0.00'),
            'unit': 'unit'
        },
        {
            'name': 'Câble réseau blindé Cat 6 2 m',
            'description': 'Shielded network cable Cat 6 2m',
            'category': 'Infrastructure',
            'price_france': Decimal('0.00'),
            'price_morocco': Decimal('0.00'),
            'unit': 'unit'
        },
        {
            'name': 'Câble réseau blindé Cat 6 10 m',
            'description': 'Shielded network cable Cat 6 10m',
            'category': 'Infrastructure',
            'price_france': Decimal('0.00'),
            'price_morocco': Decimal('0.00'),
            'unit': 'unit'
        },
        {
            'name': 'Câble réseau blindé Cat 6 0.5 m',
            'description': 'Shielded network cable Cat 6 0.5m',
            'category': 'Infrastructure',
            'price_france': Decimal('122.00'),
            'price_morocco': Decimal('0.00'),
            'unit': 'unit'
        },
        {
            'name': 'Onduleur (UPS) 3000VA',
            'description': 'UPS 3000VA',
            'category': 'Infrastructure',
            'price_france': Decimal('0.00'),
            'price_morocco': Decimal('0.00'),
            'unit': 'unit'
        },
        {
            'name': 'PDU (Power Distribution Unit)',
            'description': 'Power Distribution Unit',
            'category': 'Infrastructure',
            'price_france': Decimal('0.00'),
            'price_morocco': Decimal('0.00'),
            'unit': 'unit'
        },
        {
            'name': 'Switch 24 Ports PoE',
            'description': '24 Port PoE Switch',
            'category': 'Network Equipment',
            'price_france': Decimal('800.00'),
            'price_morocco': Decimal('8000.00'),
            'unit': 'unit'
        },
        {
            'name': 'Switch 48 Ports PoE',
            'description': '48 Port PoE Switch',
            'category': 'Network Equipment',
            'price_france': Decimal('1400.00'),
            'price_morocco': Decimal('14000.00'),
            'unit': 'unit'
        },
        
        # Network Equipment
        {
            'name': 'KVM Switch',
            'description': 'Dell KVM DMPU2016-G01 16ports',
            'category': 'Network Equipment',
            'price_france': Decimal('1205.00'),
            'price_morocco': Decimal('0.00'),
            'unit': 'unit'
        },
        {
            'name': 'KVM Console',
            'description': 'KVM Console',
            'category': 'Network Equipment',
            'price_france': Decimal('300.00'),
            'price_morocco': Decimal('3000.00'),
            'unit': 'unit'
        },
        {
            'name': 'KVM Cables',
            'description': 'KVM Cables',
            'category': 'Network Equipment',
            'price_france': Decimal('50.00'),
            'price_morocco': Decimal('500.00'),
            'unit': 'unit'
        },
        {
            'name': 'Access Point',
            'description': 'Wireless Access Point',
            'category': 'Network Equipment',
            'price_france': Decimal('0.00'),
            'price_morocco': Decimal('0.00'),
            'unit': 'unit'
        },
        {
            'name': 'Firewall Appliance',
            'description': 'Network Firewall Appliance',
            'category': 'Network Equipment',
            'price_france': Decimal('0.00'),
            'price_morocco': Decimal('0.00'),
            'unit': 'unit'
        },
        
        # Server Equipment
        {
            'name': 'File Server (Standard)',
            'description': 'Standard File Server',
            'category': 'Server Equipment',
            'price_france': Decimal('0.00'),
            'price_morocco': Decimal('0.00'),
            'unit': 'unit'
        },
        {
            'name': 'Application server',
            'description': 'Application server for local apps',
            'category': 'Server Equipment',
            'price_france': Decimal('1800.00'),
            'price_morocco': Decimal('18000.00'),
            'unit': 'unit'
        },
        
        # User Devices
        {
            'name': 'Laptop - Office',
            'description': 'Office Laptop',
            'category': 'User Devices',
            'price_france': Decimal('0.00'),
            'price_morocco': Decimal('0.00'),
            'unit': 'unit'
        },
        {
            'name': 'Laptop - Tech',
            'description': 'Technical Laptop',
            'category': 'User Devices',
            'price_france': Decimal('0.00'),
            'price_morocco': Decimal('0.00'),
            'unit': 'unit'
        },
        {
            'name': 'Desktop - Office',
            'description': 'Office Desktop',
            'category': 'User Devices',
            'price_france': Decimal('0.00'),
            'price_morocco': Decimal('0.00'),
            'unit': 'unit'
        },
        {
            'name': 'Desktop - Tech',
            'description': 'Technical Desktop',
            'category': 'User Devices',
            'price_france': Decimal('0.00'),
            'price_morocco': Decimal('0.00'),
            'unit': 'unit'
        },
        {
            'name': 'Printer',
            'description': 'Office Printer',
            'category': 'User Devices',
            'price_france': Decimal('0.00'),
            'price_morocco': Decimal('0.00'),
            'unit': 'unit'
        },
        {
            'name': 'Traceau',
            'description': 'Plotter/Tracer',
            'category': 'User Devices',
            'price_france': Decimal('0.00'),
            'price_morocco': Decimal('0.00'),
            'unit': 'unit'
        },
        {
            'name': 'Traceur A0',
            'description': 'Large format A0 plotter',
            'category': 'User Devices',
            'price_france': Decimal('1200.00'),
            'price_morocco': Decimal('12000.00'),
            'unit': 'unit'
        },
        
        # Software Licenses
        {
            'name': 'Windows Client License (Windows Pro)',
            'description': 'Windows Pro Client License',
            'category': 'Software Licenses',
            'price_france': Decimal('0.00'),
            'price_morocco': Decimal('0.00'),
            'unit': 'license'
        },
        {
            'name': 'Windows Server License',
            'description': 'Windows Server License',
            'category': 'Software Licenses',
            'price_france': Decimal('0.00'),
            'price_morocco': Decimal('0.00'),
            'unit': 'license'
        },
        
        # Services
        {
            'name': 'Internet line (STARLINK)',
            'description': 'STARLINK Internet Connection',
            'category': 'Services',
            'price_france': Decimal('0.00'),
            'price_morocco': Decimal('0.00'),
            'unit': 'service',
            'is_service': True
        },
        
        # Videoconferencing
        {
            'name': 'Visio endpoint',
            'description': 'Videoconferencing Endpoint',
            'category': 'Videoconferencing',
            'price_france': Decimal('0.00'),
            'price_morocco': Decimal('0.00'),
            'unit': 'unit'
        },
        {
            'name': 'Standard visio system',
            'description': 'Standard video conferencing system',
            'category': 'Videoconferencing',
            'price_france': Decimal('1500.00'),
            'price_morocco': Decimal('15000.00'),
            'unit': 'unit'
        },
        
        # User Devices - Auto-calculated materials
        {
            'name': 'Screen 24',
            'description': '24 inch monitor for users',
            'category': 'User Devices',
            'price_france': Decimal('200.00'),
            'price_morocco': Decimal('2000.00'),
            'unit': 'unit',
            'is_auto_calculated': True,
            'calculation_type': 'PER_USER',
            'multiplier': Decimal('1.5')
        },
        {
            'name': 'Keyboard + Mouse',
            'description': 'Keyboard and mouse set for users',
            'category': 'User Devices',
            'price_france': Decimal('50.00'),
            'price_morocco': Decimal('500.00'),
            'unit': 'set',
            'is_auto_calculated': True,
            'calculation_type': 'PER_USER',
            'multiplier': Decimal('1.5')
        },
        {
            'name': 'Docking Station',
            'description': 'Docking station for laptops',
            'category': 'User Devices',
            'price_france': Decimal('150.00'),
            'price_morocco': Decimal('1500.00'),
            'unit': 'unit',
            'is_auto_calculated': True,
            'calculation_type': 'PER_SERVER',
            'multiplier': Decimal('1.0')
        },
        
        # Services - SD-WAN materials
        {
            'name': 'SD-WAN MX67',
            'description': 'SD-WAN appliance for small offices (up to 50 users)',
            'category': 'Services',
            'price_france': Decimal('800.00'),
            'price_morocco': Decimal('8000.00'),
            'unit': 'unit',
            'is_auto_calculated': True,
            'is_service': True,
            'calculation_type': 'CONDITIONAL',
            'multiplier': Decimal('1.0'),
            'conditions': {'max_users': 50}
        },
        {
            'name': 'SD-WAN MX75',
            'description': 'SD-WAN appliance for medium offices (51-200 users)',
            'category': 'Services',
            'price_france': Decimal('1200.00'),
            'price_morocco': Decimal('12000.00'),
            'unit': 'unit',
            'is_auto_calculated': True,
            'is_service': True,
            'calculation_type': 'CONDITIONAL',
            'multiplier': Decimal('1.0'),
            'conditions': {'min_users': 51, 'max_users': 200}
        },
        {
            'name': 'SD-WAN MX95',
            'description': 'SD-WAN appliance for large offices (200+ users)',
            'category': 'Services',
            'price_france': Decimal('1800.00'),
            'price_morocco': Decimal('18000.00'),
            'unit': 'unit',
            'is_auto_calculated': True,
            'is_service': True,
            'calculation_type': 'CONDITIONAL',
            'multiplier': Decimal('1.0'),
            'conditions': {'min_users': 201}
        }
    ]

    # Additional aliases required by calculation engine expectations
    materials_data.extend([
        {
            'name': 'DAC Cable',
            'description': 'Direct Attach Copper Cable',
            'category': 'Network Equipment',
            'price_france': Decimal('100.00'),
            'price_morocco': Decimal('1000.00'),
            'unit': 'unit'
        },
        {
            'name': 'Tranceiver RJ45',
            'description': 'RJ45 Transceiver',
            'category': 'Network Equipment',
            'price_france': Decimal('80.00'),
            'price_morocco': Decimal('800.00'),
            'unit': 'unit'
        },
        # Internet service name patterns used by calculator
        {
            'name': 'Fiber Optic 100MBps',
            'description': 'Fiber optic internet 100MBps',
            'category': 'Services',
            'price_france': Decimal('200.00'),
            'price_morocco': Decimal('2000.00'),
            'unit': 'month',
            'is_service': True
        },
        {
            'name': 'Fiber Optic 200MBps',
            'description': 'Fiber optic internet 200MBps',
            'category': 'Services',
            'price_france': Decimal('350.00'),
            'price_morocco': Decimal('3500.00'),
            'unit': 'month',
            'is_service': True
        },
        {
            'name': 'Fiber Optic 500MBps',
            'description': 'Fiber optic internet 500MBps',
            'category': 'Services',
            'price_france': Decimal('600.00'),
            'price_morocco': Decimal('6000.00'),
            'unit': 'month',
            'is_service': True
        },
        {
            'name': 'Fiber Optic 1GBps',
            'description': 'Fiber optic internet 1GBps',
            'category': 'Services',
            'price_france': Decimal('1000.00'),
            'price_morocco': Decimal('10000.00'),
            'unit': 'month',
            'is_service': True
        },
        {
            'name': 'STARLINK 100MBps',
            'description': 'Starlink internet 100MBps',
            'category': 'Services',
            'price_france': Decimal('200.00'),
            'price_morocco': Decimal('2000.00'),
            'unit': 'month',
            'is_service': True
        },
        {
            'name': 'VSAT 100MBps',
            'description': 'VSAT internet 100MBps',
            'category': 'Services',
            'price_france': Decimal('300.00'),
            'price_morocco': Decimal('3000.00'),
            'unit': 'month',
            'is_service': True
        },
    ])
    
    created_materials = []
    for mat_data in materials_data:
        category = categories[mat_data['category']]
        
        material, created = Material.objects.get_or_create(
            name=mat_data['name'],
            defaults={
                'description': mat_data['description'],
                'category': category,
                'price_france': mat_data['price_france'],
                'price_morocco': mat_data['price_morocco'],
                'unit': mat_data.get('unit', 'unit'),
                'is_service': mat_data.get('is_service', False),
                'is_auto_calculated': mat_data.get('is_auto_calculated', False),
                'calculation_type': mat_data.get('calculation_type', 'FIXED'),
                'multiplier': mat_data.get('multiplier', Decimal('1.0')),
                'conditions': mat_data.get('conditions', {})
            }
        )
        
        if created:
            print(f"✅ Created material: {material.name} in {category.name}")
            created_materials.append(material)
        else:
            print(f"ℹ️  Material already exists: {material.name}")
    
    return created_materials

def main():
    """Main function to setup IT Infrastructure data"""
    print("🚀 Setting up IT Infrastructure categories and materials...")
    print("=" * 60)
    
    # Create categories
    print("\n📁 Creating categories...")
    categories = create_categories()
    
    # Create materials
    print("\n📦 Creating materials...")
    materials = create_materials(categories)
    
    print("\n" + "=" * 60)
    print(f"✅ Setup complete!")
    print(f"📁 Categories created: {len(categories)}")
    print(f"📦 Materials created: {len(materials)}")
    print(f"📊 Total categories in database: {Category.objects.count()}")
    print(f"📊 Total materials in database: {Material.objects.count()}")

if __name__ == '__main__':
    main()
