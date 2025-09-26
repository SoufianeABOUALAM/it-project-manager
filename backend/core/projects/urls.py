from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# Project + custom actions (budget, recalculate) available at /projects/{pk}/budget/ and /projects/{pk}/recalculate/
router.register(r'projects', views.ProjectViewSet, basename='project')

# Legacy equipment URLs removed - using Material model instead

urlpatterns = [
    path('', include(router.urls)),
]