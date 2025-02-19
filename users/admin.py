from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Event


from django.contrib import admin
from .models import CustomUser, Event

class EventAdmin(admin.ModelAdmin):
    list_display = ('name', 'datetime', 'participant_limit')

class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'is_staff', 'is_active')
    filter_horizontal = ('events',)  # Add this to display a multi-select box for events

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Event, EventAdmin)

