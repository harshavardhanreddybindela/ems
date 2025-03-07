import os
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth import login as auth_login, logout as auth_logout
from django.contrib import messages
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

from users.serializers import EventSerializer
from .models import Event, Registration
from .forms import EventForm

User = get_user_model()


### JWT AUTHENTICATION VIEWS ###

@api_view(['GET', 'POST'])
def signup(request):
    """
    Registers a new user by handling POST requests, and handles GET requests as needed.
    """
    # Handle GET request if needed (e.g., to check if user is logged in or fetch some data)
    if request.method == 'GET':
        return Response({"message": "Please fill out the form to sign up."}, status=status.HTTP_200_OK)

    # Handle POST request for sign up
    elif request.method == 'POST':
        email = request.data.get('email')
        password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')

        if not email or not password or not confirm_password:
            return Response({"error": "Please provide email and both password fields."}, status=status.HTTP_400_BAD_REQUEST)

        if password != confirm_password:
            return Response({"error": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already registered."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(email=email, password=password)
            user.save()
            return Response({"message": "Registration successful. Please log in."}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def jwt_login(request):
    """
    Authenticates a user and returns JWT tokens.
    """
    if request.method == 'GET':
        return Response({'error': 'GET method not allowed. Use POST to log in.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(email=email, password=password)

    if user:
        refresh = RefreshToken.for_user(user)
        tokens = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

        response = Response(tokens, status=status.HTTP_200_OK)
        response.set_cookie(
            'refresh_token',
            tokens['refresh'],
            httponly=True,
            samesite='Strict',
            max_age=3600 * 24 * 7  # 7 days
        )
        return response

    return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_staff_status(request):
    """
    Checks if the authenticated user is a staff member.
    """
    return Response({"is_staff": request.user.is_staff}, status=status.HTTP_200_OK)

@api_view(['POST'])
def jwt_logout(request):
    """
    Logs the user out by blacklisting the refresh token.
    """
    refresh_token = request.COOKIES.get('refresh_token')

    if refresh_token:
        token = RefreshToken(refresh_token)
        token.blacklist()

    response = Response({"message": "Logged out successfully"}, status=status.HTTP_205_RESET_CONTENT)
    response.delete_cookie('refresh_token')
    return response

@api_view(['GET'])
def event_list(request):
    """
    Retrieves all events.
    """
    events = Event.objects.all().values('event_id', 'name', 'datetime', 'description', 'participant_limit', 'poster')
    return Response({"events": list(events)}, status=status.HTTP_200_OK)

@api_view(['GET'])
def event_detail(request, event_id):
    """
    Retrieves a specific event by ID.
    """
    try:
        event = get_object_or_404(Event, event_id=event_id)
    except Event.DoesNotExist:
        return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
    
    event_data = {
        'event_id': event.event_id,
        'name': event.name,
        'datetime': event.datetime,
        'description': event.description,
        'participant_limit': event.participant_limit,
        'poster': event.poster.url if event.poster else None
    }
    return Response(event_data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_event(request, event_id):
    """
    Registers the current user for the specified event.
    """
    event = get_object_or_404(Event, event_id=event_id)

    if event.participant_limit and event.participant_limit <= 0:
        return Response({"error": "No spots available for this event."}, status=status.HTTP_400_BAD_REQUEST)

    registration, created = Registration.objects.get_or_create(user=request.user, event=event)

    if created:
        if event.participant_limit:
            event.participant_limit -= 1
            event.save()
        return Response({"message": "Successfully registered for the event!"}, status=status.HTTP_201_CREATED)

    return Response({"error": "You are already registered for this event."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unregister_event(request, event_id):
    """
    Unregisters the current user from the specified event.
    """
    registration = get_object_or_404(Registration, event_id=event_id, user=request.user)
    registration.delete()

    event = get_object_or_404(Event, event_id=event_id)
    if event.participant_limit:
        event.participant_limit += 1
        event.save()

    return Response({"message": "Successfully unregistered from the event."}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def event_registrations(request):
    """
    Retrieves the list of events the current user is registered for.
    """
    registrations = Registration.objects.filter(user=request.user)
    registered_events = []
    for registration in registrations:
        registered_events.append({
            'event_id': registration.event.event_id,
            'name': registration.event.name,
            'datetime': registration.event.datetime,
            'description': registration.event.description
        })
    return Response({"registrations": registered_events}, status=status.HTTP_200_OK)

from rest_framework.parsers import MultiPartParser, FormParser

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_event(request):
    """
    Allows staff users to create a new event.
    """
    if not request.user.is_staff:
        return Response({"error": "Only staff members can add events."}, status=status.HTTP_403_FORBIDDEN)

    # Extract event data from request
    name = request.data.get("name")
    datetime = request.data.get("datetime")
    description = request.data.get("description")
    participant_limit = request.data.get("participant_limit")
    poster = request.FILES.get("poster")  # Handle file upload

    # Validate required fields
    if not name or not datetime or not description:
        return Response({"error": "Please provide all required fields."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Create the event (without the poster to get event_id)
        event = Event.objects.create(
            name=name,
            datetime=datetime,
            description=description,
            participant_limit=int(participant_limit) if participant_limit else None,
        )

        # Save the poster if provided
        if poster:
            ext = os.path.splitext(poster.name)[1]  # Get the file extension
            new_filename = f"event_{event.event_id}_{name.replace(' ', '_')}{ext}"
            file_path = os.path.join("event_posters/", new_filename)

            # Save the file to the media storage
            saved_path = default_storage.save(file_path, ContentFile(poster.read()))

            # Update event poster field
            event.poster.name = saved_path
            event.save()

        # Serialize event data
        serializer = EventSerializer(event)

        return Response({"message": "Event created successfully!", "event": serializer.data}, status=status.HTTP_201_CREATED)

    except Exception as e:
        print(e)
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_event(request, event_id):
    """
    Allows staff users to delete an event.
    """
    if not request.user.is_staff:
        return Response({"error": "Only staff members can delete events."}, status=status.HTTP_403_FORBIDDEN)

    event = get_object_or_404(Event, event_id=event_id) 
    event.delete()
    return Response({"message": "Event deleted successfully!"}, status=status.HTTP_200_OK)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def update_event(request, event_id):
    """
    Handles retrieving event details (GET) and updating event details (PUT) by staff users.
    """
    event = get_object_or_404(Event, event_id=event_id)

    if request.method == "GET":
        serializer = EventSerializer(event)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if not request.user.is_staff:
        return Response({"error": "Only staff members can update events."}, status=status.HTTP_403_FORBIDDEN)

    # Extract event data from request
    event.name = request.data.get("name", event.name)
    event.datetime = request.data.get("datetime", event.datetime)
    event.description = request.data.get("description", event.description)
    event.participant_limit = request.data.get("participant_limit", event.participant_limit)
    
    # Handle poster update
    if "poster" in request.FILES:
        event.poster = request.FILES["poster"]

    event.save()
    return Response({"message": "Event updated successfully!"}, status=status.HTTP_200_OK)
    
    