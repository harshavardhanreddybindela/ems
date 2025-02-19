from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser
from .models import Event

class SignupForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = CustomUser
        fields = ["email", "password1", "password2"]


class EventForm(forms.ModelForm):
    poster_file = forms.FileField(required=False)  # Temporary field for file upload

    class Meta:
        model = Event
        fields = ['name', 'datetime', 'description', 'participant_limit','poster_file']