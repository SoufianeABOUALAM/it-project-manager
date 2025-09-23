from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='user', write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'phone_number', 'role']
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords must match")
        
        # Check if user is trying to create admin/super_admin
        if data.get('role') in ['admin', 'super_admin']:
            request = self.context.get('request')
            if not request or not request.user.is_authenticated:
                raise serializers.ValidationError("Authentication required to create admin accounts")
            if not request.user.is_super_admin:
                raise serializers.ValidationError("Only super admins can create admin accounts")
        
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        role = validated_data.pop('role', 'user')
        user = User.objects.create_user(**validated_data)
        user.role = role
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    projects_count = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'phone_number', 'date_joined', 'role', 'role_display', 
            'projects_count', 'is_admin', 'is_super_admin', 'can_create_admin',
            'password', 'is_active'
        ]
        read_only_fields = [
            'id', 'date_joined', 'projects_count', 'is_admin', 
            'is_super_admin', 'can_create_admin', 'role_display'
        ]
    
    def validate_role(self, value):
        """Validate role changes - only super admins can change roles"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required")
        
        # Check if role is actually being changed from the original value
        if hasattr(self, 'instance') and self.instance:
            original_role = self.instance.role
            if original_role == value:
                # Role is not being changed, allow it
                return value
        
        # Only super admins can change user roles
        if not request.user.is_super_admin:
            raise serializers.ValidationError("Only super admins can change user roles")
        
        return value
    
    def validate_is_active(self, value):
        """Validate is_active changes - admins and super admins can change activity status"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required")
        
        # Check if trying to modify a super admin account
        if hasattr(self, 'instance') and self.instance and self.instance.is_super_admin:
            # Only super admins can modify other super admin accounts
            if not request.user.is_super_admin:
                raise serializers.ValidationError("Only super admins can modify super admin accounts")
        
        # Both admins and super admins can change activity status (for non-super-admin accounts)
        if not request.user.is_admin:
            raise serializers.ValidationError("Only admins can change user activity status")
        
        return value
    
    def validate(self, data):
        """General validation to prevent admins from modifying super admin accounts"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required")
        
        # Check if trying to modify a super admin account
        if hasattr(self, 'instance') and self.instance and self.instance.is_super_admin:
            # Only super admins can modify other super admin accounts
            if not request.user.is_super_admin:
                raise serializers.ValidationError("Only super admins can modify super admin accounts")
        
        return data
    
    def get_projects_count(self, obj):
        return obj.projects.count()
    
    def update(self, instance, validated_data):
        # Handle password update
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError("User account is disabled")
            else:
                raise serializers.ValidationError("Invalid credentials")
        else:
            raise serializers.ValidationError("Must include username and password")
        
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    new_password2 = serializers.CharField(required=True)
    
    def validate(self, data):
        if data['new_password'] != data['new_password2']:
            raise serializers.ValidationError("New passwords must match")
        return data
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value