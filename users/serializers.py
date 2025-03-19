# serializers.py

from rest_framework import serializers
from .models import CustomUser, Event, Registration

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'is_active', 'is_staff', 'name']  # Added 'name' field

    def update(self, instance, validated_data):
        # Ensure the 'name' field gets updated correctly
        instance.name = validated_data.get('name', instance.name)
        instance.email = validated_data.get('email', instance.email)
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])  # Update password securely
        instance.is_active = validated_data.get('is_active', instance.is_active)
        instance.is_staff = validated_data.get('is_staff', instance.is_staff)
        instance.save()
        return instance

class EventSerializer(serializers.ModelSerializer):
    poster = serializers.ImageField(required=False)
    class Meta:
        
        model = Event
        fields = '__all__' 
        #fields = ['event_id', 'name', 'datetime', 'description', 'participant_limit', 'poster']

class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registration
        fields = ['user', 'event', 'registered_at']
