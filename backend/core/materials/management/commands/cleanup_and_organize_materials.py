from django.core.management.base import BaseCommand
from materials.models import Material, Category


class Command(BaseCommand):
    help = 'Clean up and organize all materials into proper categories'

    def handle(self, *args, **options):
        self.stdout.write('Cleaning up and organizing materials...')
        
        # Define the correct category structure
        correct_categories = {
            'Infrastructure Equipment': [
                'Rack',
                'UPS', 
                'PDU'
            ],
            'Équipement Réseau': [
                'Switch 24 Ports PoE',
                'Switch 48 Ports PoE',
                'DAC Cable 1m',
                'DAC Cable 3m',
                'Transceivers',
                'Wifi Access Point Camp',
                'Wifi Access Point Indoor',
                'Wifi Access Point Outdoor',
                'Network Cables 0.5m',
                'Network Cables 2m',
                'Network Cables 5m',
                'Network Cables 10m',
                'KVM Console',
                'KVM Switch',
                'KVM Cables'
            ],
            'Équipement Serveur': [
                'Server Dell R540',
                'Virtual Machine Config'
            ],
            'Services': [
                'File Server',
                'Internet 100MBps',
                'Internet 200MBps',
                'Internet 500MBps'
            ],
            'Licences Logicielles': [
                'Windows Client License (Windows Pro)',
                'Windows Server License'
            ]
        }
        
        moved_count = 0
        deleted_count = 0
        
        # Get or create categories
        categories = {}
        for cat_name in correct_categories.keys():
            category, created = Category.objects.get_or_create(
                name=cat_name,
                defaults={'description': f'Category for {cat_name.lower()}'}
            )
            categories[cat_name] = category
            if created:
                self.stdout.write(f"Created category: {cat_name}")
        
        # Process each category
        for category_name, material_names in correct_categories.items():
            self.stdout.write(f"\nProcessing {category_name}:")
            target_category = categories[category_name]
            
            for material_name in material_names:
                # Find all materials with this name
                materials = Material.objects.filter(name=material_name)
                
                if materials.exists():
                    # Keep the first one and move to correct category
                    material = materials.first()
                    old_category = material.category.name
                    material.category = target_category
                    material.save()
                    
                    if old_category != category_name:
                        self.stdout.write(f"  Moved '{material_name}' from '{old_category}' to '{category_name}'")
                        moved_count += 1
                    else:
                        self.stdout.write(f"  '{material_name}' already in correct category")
                    
                    # Delete duplicates
                    duplicates = materials.exclude(id=material.id)
                    if duplicates.exists():
                        deleted_count += duplicates.count()
                        duplicates.delete()
                        self.stdout.write(f"  Deleted {duplicates.count()} duplicate(s) of '{material_name}'")
                else:
                    self.stdout.write(f"  Material '{material_name}' not found")
        
        # Clean up orphaned categories (categories that are actually material names)
        orphaned_categories = Category.objects.filter(
            name__in=[
                'Access Point (Équipement Réseau)',
                'DAC Cable 1m (Équipement Réseau)',
                'DAC Cable 3m (Équipement Réseau)',
                'Firewall Appliance (Équipement Réseau)',
                'Switch 24 Ports PoE (Équipement Réseau)',
                'Switch 48 Ports PoE (Équipement Réseau)',
                'Transceivers (Équipement Réseau)',
                'Wifi Access Point Camp (Équipement Réseau)',
                'Wifi Access Point Indoor (Équipement Réseau)',
                'Wifi Access Point Outdoor (Équipement Réseau)',
                'File Server (Standard) (Équipement Serveur)',
                'Server Dell R540 (Équipement Serveur)',
                'Virtual Machine Config (Équipement Serveur)',
                'Câble réseau blindé Cat 6 0.5 m (Infrastructure)',
                'Câble réseau blindé Cat 6 10 m (Infrastructure)',
                'Câble réseau blindé Cat 6 2 m (Infrastructure)',
                'Câble réseau blindé Cat 6 5 m (Infrastructure)',
                'Onduleur (UPS) 3000VA (Infrastructure)',
                'PDU (Power Distribution Unit) (Infrastructure)',
                'PDU (Infrastructure Equipment)',
                'Rack (Infrastructure Equipment)',
                'UPS (Infrastructure Equipment)',
                'Windows Client License (Windows Pro) (Licences Logicielles)',
                'Windows Server License (Licences Logicielles)',
                'KVM Cables (Réseau)',
                'KVM Console (Réseau)',
                'KVM Switch (Réseau)',
                'Network Cables 0.5m (Réseau)',
                'Network Cables 10m (Réseau)',
                'Network Cables 2m (Réseau)',
                'Network Cables 5m (Réseau)',
                'Internet line (STARLINK) (Services)',
                'Visio endpoint (Visioconférence)'
            ]
        )
        
        orphaned_count = orphaned_categories.count()
        orphaned_categories.delete()
        
        self.stdout.write(f"\n✅ Cleanup completed:")
        self.stdout.write(f"  - Moved: {moved_count} materials")
        self.stdout.write(f"  - Deleted: {deleted_count} duplicate materials")
        self.stdout.write(f"  - Deleted: {orphaned_count} orphaned categories")
        
        # Show final count
        total_materials = Material.objects.count()
        total_categories = Category.objects.count()
        self.stdout.write(f"\nFinal counts:")
        self.stdout.write(f"  - Total materials: {total_materials}")
        self.stdout.write(f"  - Total categories: {total_categories}")
        
        self.stdout.write(self.style.SUCCESS('\nMaterials cleanup completed successfully!'))
