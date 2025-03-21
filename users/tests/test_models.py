# users/tests/test_models.py
from django.test import TestCase
from users.models import CustomUser, Event, Registration
from django.utils import timezone

class CustomUserTest(TestCase):
    def test_create_user(self):
        # Create a CustomUser instance
        user = CustomUser.objects.create_user(email="testuser@example.com", password="password123")
        self.assertEqual(user.email, "testuser@example.com")
        self.assertTrue(user.check_password("password123"))

    def test_create_superuser(self):
        # Create a superuser instance
        user = CustomUser.objects.create_superuser(email="admin@example.com", password="adminpass")
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_staff)

class EventTest(TestCase):
    def test_event_creation(self):
        # Create an Event instance
        event = Event.objects.create(
            name="Test Event",
            datetime=timezone.now(),
            description="Test event description",
            participant_limit=100
        )
        self.assertEqual(event.name, "Test Event")
        self.assertEqual(event.description, "Test event description")
        self.assertEqual(event.participant_limit, 100)

class RegistrationTest(TestCase):
    def setUp(self):
        # Create a user and an event to associate with registration
        self.user = CustomUser.objects.create_user(email="testuser@example.com", password="password123")
        self.event = Event.objects.create(
            name="Test Event",
            datetime=timezone.now(),
            description="Test event description",
            participant_limit=100
        )

    def test_registration_creation(self):
        # Create a Registration instance
        registration = Registration.objects.create(user=self.user, event=self.event)
        self.assertEqual(registration.user.email, "testuser@example.com")
        self.assertEqual(registration.event.name, "Test Event")

    def test_duplicate_registration(self):
        # Test preventing duplicate registrations for the same user and event
        Registration.objects.create(user=self.user, event=self.event)
        with self.assertRaises(Exception):  # It should raise an exception due to unique_together constraint
            Registration.objects.create(user=self.user, event=self.event)
