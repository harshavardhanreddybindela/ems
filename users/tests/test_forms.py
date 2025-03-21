from django.test import TestCase
from users.forms import SignupForm, EventForm

class SignupFormTest(TestCase):
    def setUp(self):
        self.valid_data = {'email': 'testuser@example.com', 'password1': 'password123', 'password2': 'password123'}
        self.invalid_data = {'email': 'testuser@example.com', 'password1': 'password123', 'password2': 'wrongpassword'}

    def test_valid_signup(self):
        form = SignupForm(data=self.valid_data)
        self.assertTrue(form.is_valid())

    def test_invalid_signup(self):
        form = SignupForm(data=self.invalid_data)
        self.assertFalse(form.is_valid())

class EventFormTest(TestCase):
    def setUp(self):
        self.valid_data = {'name': 'Event One', 'datetime': '2025-03-21 10:00:00', 'description': 'Test event', 'participant_limit': 50}
        self.invalid_data = {'name': '', 'datetime': '', 'description': 'Test event'}

    def test_valid_event_form(self):
        form = EventForm(data=self.valid_data)
        self.assertTrue(form.is_valid())

    def test_invalid_event_form(self):
        form = EventForm(data=self.invalid_data)
        self.assertFalse(form.is_valid())
