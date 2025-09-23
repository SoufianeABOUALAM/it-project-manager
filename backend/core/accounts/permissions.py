from rest_framework.permissions import BasePermission

class IsAdminOrSuperAdmin(BasePermission):
    """
    Custom permission to only allow admin or super admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin

class IsSuperAdmin(BasePermission):
    """
    Custom permission to only allow super admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_super_admin

class CanCreateAdmin(BasePermission):
    """
    Custom permission to only allow users who can create admin accounts (super admins).
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.can_create_admin

