from django.urls import reverse
from django.test import TestCase

class EventURLTest(TestCase):
    def test_event_list_url(self):
        response = self.client.get(reverse('events'))
        self.assertEqual(response.status_code, 200)

    def test_event_detail_url(self):
        response = self.client.get(reverse('event_detail', args=[1]))  # Assuming event ID 1 exists
        self.assertEqual(response.status_code, 200)
