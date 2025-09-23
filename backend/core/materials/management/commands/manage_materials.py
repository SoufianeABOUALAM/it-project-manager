from django.core.management.base import BaseCommand
from calculations.services import MaterialManager
from materials.models import Material, Category


class Command(BaseCommand):
    help = 'Manage materials: add, update, move between categories, and add descriptions'

    def add_arguments(self, parser):
        parser.add_argument(
            '--materials',
            type=str,
            help='JSON string of materials to manage',
        )
        parser.add_argument(
            '--file',
            type=str,
            help='Path to JSON file containing materials data',
        )
        parser.add_argument(
            '--list-current',
            action='store_true',
            help='List all current materials with their categories',
        )

    def handle(self, *args, **options):
        if options['list_current']:
            self.list_current_materials()
            return

        materials_data = None
        
        if options['materials']:
            import json
            try:
                materials_data = json.loads(options['materials'])
            except json.JSONDecodeError as e:
                self.stdout.write(
                    self.style.ERROR(f'Invalid JSON format: {e}')
                )
                return
        elif options['file']:
            import json
            import os
            try:
                file_path = options['file']
                if not os.path.exists(file_path):
                    self.stdout.write(
                        self.style.ERROR(f'File not found: {file_path}')
                    )
                    return
                
                with open(file_path, 'r', encoding='utf-8') as f:
                    materials_data = json.load(f)
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error reading file: {e}')
                )
                return
        else:
            self.stdout.write(
                self.style.ERROR('Please provide either --materials or --file argument')
            )
            return

        if not materials_data:
            self.stdout.write(
                self.style.ERROR('No materials data provided')
            )
            return

        # Process materials
        self.stdout.write('Processing materials...')
        results = MaterialManager.manage_materials(materials_data)
        
        # Display results
        self.stdout.write(
            self.style.SUCCESS(f"✅ Created: {results['created']} materials")
        )
        self.stdout.write(
            self.style.SUCCESS(f"✅ Updated: {results['updated']} materials")
        )
        self.stdout.write(
            self.style.SUCCESS(f"✅ Moved: {results['moved']} materials")
        )
        
        if results['errors']:
            self.stdout.write(
                self.style.ERROR(f"❌ Errors: {len(results['errors'])}")
            )
            for error in results['errors']:
                self.stdout.write(self.style.ERROR(f"  - {error}"))

    def list_current_materials(self):
        """List all current materials with their categories"""
        self.stdout.write(self.style.SUCCESS('Current Materials:'))
        self.stdout.write('=' * 80)
        
        categories = Category.objects.all().order_by('name')
        
        for category in categories:
            self.stdout.write(f"\n📁 {category.name}")
            materials = Material.objects.filter(category=category).order_by('name')
            
            if not materials:
                self.stdout.write("  (No materials)")
                continue
                
            for material in materials:
                desc = f" - {material.description}" if material.description else ""
                auto = " [AUTO]" if material.is_auto_calculated else ""
                service = " [SERVICE]" if material.is_service else ""
                self.stdout.write(
                    f"  • {material.name}{auto}{service}{desc}"
                )
                self.stdout.write(
                    f"    Price: €{material.price_france} / {material.price_morocco} MAD"
                )
