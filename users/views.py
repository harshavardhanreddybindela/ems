import os, pytz
from django.http import JsonResponse
from django.db import transaction
from django.shortcuts import get_object_or_404, redirect, render
from django.contrib.auth import authenticate, get_user_model
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth.hashers import make_password

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from EventManagementSystem import settings
from users.serializers import EventSerializer
from .models import Event, Registration

from ics import Calendar, Event as IcsEvent
from calendar import Calendar


User = get_user_model()

<<<<<<< HEAD
=======
def create_event(request):
    if request.method == 'POST':
        form = EventForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('event_list')  # Redirect to event list after successful event creation
    else:
        form = EventForm()
    return render(request, 'create_event.html', {'form': form})


### JWT AUTHENTICATION VIEWS ###
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def register_event(request, event_id):
    user = request.user
    event = Event.objects.get(pk=event_id)

    if Registration.objects.filter(user=user, event=event).exists():
        return JsonResponse({"error": "You are already registered for this event."}, status=400)

    # Create the registration
    Registration.objects.create(user=user, event=event)

    # Create an ICS calendar event
    cal = Calendar()
    ics_event = IcsEvent()
    ics_event.name = event.name
    ics_event.begin = event.datetime.astimezone(pytz.utc)  # Ensure UTC timezone
    ics_event.duration = {"hours": 2}  # Modify if needed
    ics_event.description = event.description
    cal.events.add(ics_event)

    # Convert calendar object to string
    ics_content = str(cal)

    # Email content
    subject = f"Registration Confirmation for {event.name}"
    message = f"""
    Hello {user.email},

    You have successfully registered for the event: {event.name}.

    📅 Event Details:
    Date: {event.datetime.strftime('%Y-%m-%d %H:%M:%S')}
    Location: Online / In-person (Check event page)

    Attached is the calendar event for your reference.

    Thank you for registering!
    Best regards,
    Event Management Team
    """

>>>>>>> 1d5686edf9afab6a19cf4ae5b581287096ec86a2
   
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def register_event(request, event_id):
    user = request.user
    event = get_object_or_404(Event, pk=event_id)

    # Check if event is already full
    if event.participant_limit is not None and event.participant_limit <= 0:
        return JsonResponse({"error": "Registration closed. This event is full."}, status=400)

    if Registration.objects.filter(user=user, event=event).exists():
        return JsonResponse({"error": "You are already registered for this event."}, status=400)

    # Use a transaction to prevent race conditions
    with transaction.atomic():
        Registration.objects.create(user=user, event=event)
        
        # Decrease participant limit
        if event.participant_limit is not None:
            event.participant_limit -= 1
            event.save()

    # Create ICS calendar event
    cal = Calendar()
    ics_event = IcsEvent()
    ics_event.name = event.name
    ics_event.begin = event.datetime.astimezone(pytz.utc)  # Ensure UTC timezone
    ics_event.duration = {"hours": 2}
    ics_event.description = event.description
    cal.events.add(ics_event)

    # Convert calendar object to string
    ics_content = str(cal)

    # Email content
    subject = f"Registration Confirmation for {event.name}"
    message = f"""
    Hello {user.email},

    You have successfully registered for the event: {event.name}.

    📅 Event Details:
    Date: {event.datetime.strftime('%Y-%m-%d %H:%M:%S')}
    Location: Online / In-person (Check event page)
    Description: {event.description}

    Attached is the calendar event for your reference.

    Thank you for registering!
    Best regards,
    Event Management Team
    """

    email = EmailMultiAlternatives(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
    email.attach("event.ics", ics_content, "text/calendar")

    try:
        email.send()
    except Exception as e:
        return JsonResponse({"error": f"Registration successful, but email failed: {str(e)}"}, status=500)

    return JsonResponse({"message": "Successfully registered! A confirmation email with a calendar invite has been sent."}, status=201)


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


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unregister_event(request, event_id):
    """
    Unregisters the current user from the specified event.
    """
    registration = get_object_or_404(Registration, event_id=event_id, user=request.user)
    registration.delete()

    event = get_object_or_404(Event, event_id=event_id)
    if event.participant_limit is not None:
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

        else:
        # If no poster provided, use the default poster
            default_poster_path = "event_posters/noimage.jpeg"  # Path to your default image
            event.poster.name = default_poster_path
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
    
@permission_classes([IsAuthenticated])
@api_view(["GET", "POST"])
def user_profile(request):
    if request.method == 'GET':
        # Return the user's profile details
        user = request.user  # Assuming the user is authenticated
        user_data = {
            'email': user.email,
            'name': user.name,
        }
        return JsonResponse(user_data)

    elif request.method == 'POST':
        # Update user details
        user = request.user  # Assuming the user is authenticated
        data = request.POST  # Get the form data

        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        # Update user details only if they are provided
        if name:
            user.name = name
        if email:
            user.email = email
        if password:
            user.password = make_password(password)  # Hash the password before saving

        user.save()

        return JsonResponse({'message': 'User details updated successfully'})