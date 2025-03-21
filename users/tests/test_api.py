from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from users.models import Event, CustomUser

class EventAPITest(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(email='testuser@example.com', password='password123')
        self.event = Event.objects.create(
            name="Sample Event",
            datetime="2025-03-21 10:00:00",
            description="Test event",
            participant_limit=100
        )

    def test_event_creation(self):
        self.client.login(email='testuser@example.com', password='password123')
        data = {'name': 'New Event', 'datetime': '2025-05-01 12:00:00', 'description': 'New test event', 'participant_limit': 50}
        response = self.client.post(reverse('add_event'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_event_registration(self):
        self.client.login(email='testuser@example.com', password='password123')
        response = self.client.post(reverse('register_event', args=[self.event.event_id]))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
