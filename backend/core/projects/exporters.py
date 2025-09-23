# application/exporters.py

from io import BytesIO
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
from .models import Project

class ExcelExporter:
    """
    Génère un rapport de budget de projet au format Excel (.xlsx).
    """

    def __init__(self):
        # Définition des styles pour le fichier Excel
        self.header_font = Font(bold=True, color="FFFFFF")
        self.header_fill = PatternFill(start_color="4F81BD", end_color="4F81BD", fill_type="solid")
        self.header_align = Alignment(horizontal="center", vertical="center")
        self.category_font = Font(bold=True)
        self.currency_format_eur = '"€"#,##0.00'
        self.currency_format_mad = '"MAD"#,##0.00'
        self.thin_border = Border(left=Side(style='thin'), right=Side(style='thin'), top=Side(style='thin'), bottom=Side(style='thin'))

    def generate_project_excel(self, project: Project):
        wb = Workbook()
        ws = wb.active
        ws.title = "Budget Projet"

        # --- Création de l'en-tête ---
        headers = [
            "Catégorie", "Item", "Description", "Fournisseur", "Qté",
            "Coût Fixe Unitaire (€)", "Coût Fixe Total (€)",
            "Coût Mensuel Unitaire (€)", "Coût Mensuel Total (€)",
            "Coût Fixe Unitaire (MAD)", "Coût Fixe Total (MAD)",
            "Coût Mensuel Unitaire (MAD)", "Coût Mensuel Total (MAD)"
        ]
        ws.append(headers)
        for cell in ws[1]:
            cell.font = self.header_font
            cell.fill = self.header_fill
            cell.alignment = self.header_align

        # --- Collecte et écriture des données ---
        all_items = []
        
        # Regrouper tous les items de toutes les catégories
        item_relations = [
            ("Infrastructure Equipment", project.projectinfrastructureitem_set.all()),
            ("Network Equipment", project.projectnetworkitem_set.all()),
            ("Servers", project.projectserveritem_set.all()),
            ("Appareils Utilisateur", project.projectuserdeviceitem_set.all()),
            ("Licenses", project.projectsoftwareitem_set.all()),
            ("Internet Services", project.projectserviceitem_set.all()),
            ("Visio Conference", project.projectvisioitem_set.all()),
        ]

        row_cursor = 2
        for category_name, item_set in item_relations:
            if not item_set.exists():
                continue

            # Écrire la ligne de la catégorie
            ws.cell(row=row_cursor, column=1, value=category_name).font = self.category_font
            row_cursor += 1

            for item in item_set.select_related('equipment'):
                eq = item.equipment
                qty = item.quantity
                
                # Créer une ligne de données pour l'item
                row_data = [
                    "",  # Colonne catégorie vide pour les items
                    eq.name,
                    eq.description,
                    eq.supplier,
                    qty,
                    eq.fixed_cost_eur,
                    eq.fixed_cost_eur * qty,
                    eq.monthly_cost_eur,
                    eq.monthly_cost_eur * qty,
                    eq.fixed_cost_mad,
                    eq.fixed_cost_mad * qty,
                    eq.monthly_cost_mad,
                    eq.monthly_cost_mad * qty,
                ]
                ws.append(row_data)
                row_cursor += 1

        # --- Mise en forme des cellules de données ---
        for row in ws.iter_rows(min_row=2, max_row=ws.max_row):
            for cell in row:
                cell.border = self.thin_border
            # Formats monétaires
            ws[f'F{row[0].row}'].number_format = self.currency_format_eur
            ws[f'G{row[0].row}'].number_format = self.currency_format_eur
            ws[f'H{row[0].row}'].number_format = self.currency_format_eur
            ws[f'I{row[0].row}'].number_format = self.currency_format_eur
            ws[f'J{row[0].row}'].number_format = self.currency_format_mad
            ws[f'K{row[0].row}'].number_format = self.currency_format_mad
            ws[f'L{row[0].row}'].number_format = self.currency_format_mad
            ws[f'M{row[0].row}'].number_format = self.currency_format_mad

        # --- Ajustement de la largeur des colonnes ---
        column_widths = {'A': 25, 'B': 35, 'C': 50, 'D': 20, 'E': 5}
        for col, width in column_widths.items():
            ws.column_dimensions[col].width = width
        for col_letter in ['F', 'G', 'H', 'I', 'J', 'K', 'L', 'M']:
             ws.column_dimensions[col_letter].width = 22

        # --- Sauvegarde du fichier en mémoire ---
        buffer = BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer