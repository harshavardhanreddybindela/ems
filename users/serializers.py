# serializers.py

from rest_framework import serializers
from .models import CustomUser, Event, Registration

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'is_active', 'is_staff']

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__' 
        #fields = ['event_id', 'name', 'datetime', 'description', 'participant_limit', 'poster']

class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registration
        fields = ['user', 'event', 'registered_at']
