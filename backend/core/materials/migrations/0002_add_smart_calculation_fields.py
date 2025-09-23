# Generated manually for smart calculation fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('materials', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='material',
            name='calculation_type',
            field=models.CharField(
                choices=[
                    ('PER_USER', 'Per User'),
                    ('PER_SERVER', 'Per Server'),
                    ('PER_PROJECT', 'Per Project'),
                    ('FIXED', 'Fixed Amount'),
                    ('CONDITIONAL', 'Conditional')
                ],
                default='FIXED',
                help_text='How this material should be calculated',
                max_length=20,
                verbose_name='Calculation Type'
            ),
        ),
        migrations.AddField(
            model_name='material',
            name='multiplier',
            field=models.DecimalField(
                decimal_places=2,
                default=1.0,
                help_text='How many units per user/server/project',
                max_digits=5,
                verbose_name='Multiplier'
            ),
        ),
        migrations.AddField(
            model_name='material',
            name='min_quantity',
            field=models.IntegerField(
                default=0,
                help_text='Minimum quantity to add',
                verbose_name='Min Quantity'
            ),
        ),
        migrations.AddField(
            model_name='material',
            name='max_quantity',
            field=models.IntegerField(
                default=999999,
                help_text='Maximum quantity to add',
                verbose_name='Max Quantity'
            ),
        ),
        migrations.AddField(
            model_name='material',
            name='conditions',
            field=models.JSONField(
                default=dict,
                help_text="Calculation conditions (e.g., {'min_users': 50})",
                verbose_name='Conditions'
            ),
        ),
    ]


