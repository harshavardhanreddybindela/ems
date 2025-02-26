from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import FileResponse, HttpResponse

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Event, Registration
from .forms import EventForm

User = get_user_model()


### JWT AUTHENTICATION VIEWS ###
@api_view(['POST'])
def jwt_signup(request):
    """
    Register a new user and return JWT tokens
    """
    email = request.data.get('email')
    password = request.data.get('password')
    confirm_password = request.data.get('confirm_password')

    if password != confirm_password:
        return Response({'error': 'Passwords do not match!'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'User with this email already exists!'}, status=status.HTTP_400_BAD_REQUEST)

    # Create user
    user = User.objects.create(email=email, password=make_password(password))
    user.save()

    # Generate JWT token
    refresh = RefreshToken.for_user(user)
    print("-----Refresh from Signup:----------", refresh)
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    })


@api_view(['POST'])  # Only accept POST requests
def jwt_login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = authenticate(email=email, password=password)

    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    else:
        return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

def login_view(request):
    return render(request, "users/login.html")

@api_view(['POST'])
def jwt_logout(request):
    """
    Logout user by blacklisting refresh token
    """
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message": "Logged out successfully"}, status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    """
    Example of a protected view that requires authentication
    """
    return Response({"message": f"Hello {request.user.email}, you are authenticated!"})


### EVENT MANAGEMENT VIEWS ###
@login_required
def events_view(request):
    return render(request, "users/events.html")


@login_required
def profile_view(request):
    registered_events = request.session.get('registered_events', [])
    events = Event.objects.filter(event_id__in=registered_events)
    return render(request, "users/profile.html", {"events": events})


@login_required
def about_view(request):
    return render(request, "users/about.html")


@login_required
def create_event(request):
    if request.method == "POST":
        form = EventForm(request.POST, request.FILES)
        if form.is_valid():
            event = form.save(commit=False)
            event.created_by = request.user
            event.save()
            return redirect('event_list')
    else:
        form = EventForm()
    return render(request, 'create_event.html', {'form': form})


def get_event_poster(request, event_id):
    event = get_object_or_404(Event, pk=event_id)
    if event.poster:
        return FileResponse(event.poster.open('rb'), content_type='image/jpeg')
    else:
        from django.http import HttpResponseNotFound
        return HttpResponseNotFound("No poster available.")


@login_required
def event_list(request):
    events = Event.objects.all()
    return render(request, 'users/events.html', {'events': events})


@login_required
def add_event(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        description = request.POST.get('description')
        event_datetime = request.POST.get('datetime')
        participant_limit = request.POST.get('participant_limit')
        poster = request.FILES.get('poster')

        event = Event(
            name=name,
            description=description,
            datetime=event_datetime,
            participant_limit=participant_limit,
            poster=poster,
        )
        event.save()
        return redirect('/events/')

    return render(request, 'users/add_event.html')


@login_required
def delete_event(request, event_id):
    event = get_object_or_404(Event, event_id=event_id)
    event.delete()
    return redirect('events')


@login_required
def register_event(request, event_id):
    event = get_object_or_404(Event, event_id=event_id)

    if event.participant_limit and event.participant_limit <= 0:
        messages.warning(request, "No spots available for this event.")
        return redirect("events")

    registration, created = Registration.objects.get_or_create(user=request.user, event=event)

    if created:
        if event.participant_limit:
            event.participant_limit -= 1
            event.save()
        messages.success(request, "Successfully registered for the event!")

        if 'registered_events' not in request.session:
            request.session['registered_events'] = []
        
        request.session['registered_events'].append(event_id)
        request.session.modified = True

    else:
        messages.warning(request, "You are already registered for this event.")

    return redirect("events")


@login_required
def event_registrations(request):
    registrations = Registration.objects.filter(user=request.user)
    return render(request, 'users/registrations.html', {'registrations': registrations})


def home(request):
    events = Event.objects.all()
    return render(request, 'users/home.html', {'events': events})


@login_required
def unregister_event(request, event_id):
    registration = get_object_or_404(Registration, event_id=event_id, user=request.user)
    registration.delete()
    return redirect('event_registrations')
