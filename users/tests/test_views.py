from django.urls import reverse
from django.test import TestCase
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

class EventViewTest(TestCase):

    def setUp(self):
        # Create a user for authentication (ensure you have a User model in your app)
        self.user = get_user_model().objects.create_user(email='testuser', password='password')
        self.token = RefreshToken.for_user(self.user)
        self.access_token = str(self.token.access_token)  # Get the access token
        self.headers = {
            'Authorization': f'Bearer {self.access_token}'  # Pass the token correctly
        }
        self.event_data = {'name': 'Test Event', 'date': '2025-05-01'}

    def test_create_event_get(self):
        # Include the Authorization header with the GET request
        response = self.client.get(reverse('add_event'), **self.headers)
        print(response.status_code)  # Debugging: check the status code
        self.assertEqual(response.status_code, 200)  # Expecting 200 OK

    def test_create_event_post_valid(self):
        # Send valid data with the Authorization header
        response = self.client.post(reverse('add_event'), self.event_data, **self.headers)
        print(response.status_code)  # Debugging: check the status code
        self.assertEqual(response.status_code, 201)  # Expecting 201 Created

    def test_create_event_post_invalid(self):
        invalid_data = {'name': '', 'date': 'invalid-date'}
        # Send invalid data with the Authorization header
        response = self.client.post(reverse('add_event'), invalid_data, **self.headers)
        print(response.status_code)  # Debugging: check the status code
        self.assertEqual(response.status_code, 400)  # Expecting 400 Bad Request due to validation failure
