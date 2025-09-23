from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
# Project + custom actions (budget, recalculate) available at /projects/{pk}/budget/ and /projects/{pk}/recalculate/
router.register(r'projects', views.ProjectViewSet, basename='project')

# Equipments
router.register(r'network-equipment', views.NetworkEquipmentViewSet, basename='networkequipment')
router.register(r'server-equipment', views.ServerEquipmentViewSet, basename='serverequipment')
router.register(r'user-devices', views.UserDeviceViewSet, basename='userdevice')
router.register(r'software-licenses', views.SoftwareLicenseViewSet, basename='softwarelicense')
router.register(r'services', views.ServiceViewSet, basename='service')

# Project items
router.register(r'project-network-items', views.ProjectNetworkItemViewSet, basename='projectnetworkitem')
router.register(r'project-server-items', views.ProjectServerItemViewSet, basename='projectserveritem')
router.register(r'project-userdevice-items', views.ProjectUserDeviceItemViewSet, basename='projectuserdeviceitem')
router.register(r'project-software-items', views.ProjectSoftwareItemViewSet, basename='projectsoftwareitem')
router.register(r'project-service-items', views.ProjectServiceItemViewSet, basename='projectserviceitem')

urlpatterns = [
    path('', include(router.urls)),
]