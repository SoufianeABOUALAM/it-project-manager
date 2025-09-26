from django.core.management.base import BaseCommand
from projects.models import Project
from calculations.services import ProjectCalculator


class Command(BaseCommand):
    help = 'Recalculate budgets for all projects'

    def handle(self, *args, **options):
        self.stdout.write('Starting budget recalculation for all projects...')
        
        calculator = ProjectCalculator()
        projects = Project.objects.all()
        
        if not projects.exists():
            self.stdout.write(self.style.WARNING('No projects found in database'))
            return
        
        self.stdout.write(f'Found {projects.count()} projects to process')
        
        success_count = 0
        error_count = 0
        
        for project in projects:
            try:
                self.stdout.write(f'Processing project: {project.name} (ID: {project.id})')
                
                # Recalculate budget
                project_items, total_france, total_morocco = calculator.save_project_budget(project)
                
                self.stdout.write(
                    f'  ✓ Budget calculated: €{total_france} / MAD {total_morocco} '
                    f'({len(project_items)} items)'
                )
                success_count += 1
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'  ✗ Error processing project {project.name}: {str(e)}')
                )
                error_count += 1
        
        self.stdout.write('')
        self.stdout.write(
            self.style.SUCCESS(
                f'Budget recalculation completed! '
                f'Success: {success_count}, Errors: {error_count}'
            )
        )
