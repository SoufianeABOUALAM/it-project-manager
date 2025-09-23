from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    path('charts/', views.DashboardChartsView.as_view(), name='dashboard-charts'),
]
