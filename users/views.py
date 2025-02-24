from asyncio import events
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from django.http import FileResponse

from django.http import HttpResponse
from .models import Event, Registration
from .forms import EventForm
from django.core.files.base import ContentFile
import base64

User = get_user_model()

def signup_view(request):
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")
        confirm_password = request.POST.get("confirm_password")

        if password != confirm_password:
            messages.error(request, "Passwords do not match!")
            return redirect("signup")

        if User.objects.filter(email=email).exists():
            messages.error(request, "User with this email already exists!")
            return redirect("signup")

        # Creating user
        user = User(email=email, password=make_password(password))
        user.save()

        messages.success(request, "Signup successful! Please log in.")
        return redirect("login")

    return render(request, "users/signup.html")


def login_view(request):
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")

        user = authenticate(request, email=email, password=password)

        if user is not None:
            login(request, user)
            return redirect("home")  # Redirect to home after login
        else:
            messages.error(request, "Invalid email or password.")
            return redirect("login")

    return render(request, "users/login.html")

# @login_required
# # def home_view(request):
# #     return render(request, "users/home.html")

@login_required
def events_view(request):
    return render(request, "users/events.html")

@login_required
def profile_view(request):
    return render(request, "users/profile.html")

@login_required
def about_view(request):
    return render(request, "users/about.html")

def logout_view(request):
    logout(request)
    return redirect("login")

@login_required
def create_event(request):
    if request.method == "POST":
        form = EventForm(request.POST, request.FILES)
        if form.is_valid():
            event = form.save(commit=False)
            event.created_by = request.user  # Associate event with the logged-in user
            event.save()
            return redirect('event_list')  # Redirect to events page
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



from .models import Event
from .forms import EventForm

@login_required
def event_list(request):
    print("entering into event list")
    events = Event.objects.all()
    for event in events:
        print(f"Event ID: {event.event_id}, Event Name: {event.name}")

    return render(request, 'users/events.html', {'events': events})

@login_required
def add_event(request):
    if request.method == 'POST':
        # Extracting form data
        name = request.POST.get('name')
        description = request.POST.get('description')
        event_datetime = request.POST.get('datetime')  # Event date and time
        participant_limit = request.POST.get('participant_limit')
        poster = request.FILES.get('poster')  # Handling file uploads
        
        # Create a new Event object
        event = Event(
            name=name,
            description=description,
            datetime=event_datetime,
            participant_limit=participant_limit,
            poster=poster,
        )
        event.save()  # Save the event to the database
        return redirect('/events/')  # Redirect to event list page after adding
    
    return render(request, 'users/add_event.html')


@login_required
def delete_event(request, event_id):
    # Get the event object or 404 if not found
    event = get_object_or_404(Event, event_id = event_id)
    # Delete the event
    event.delete()
    # Redirect to the event list page
    return redirect('events')

# @login_required
# def register_for_event(request, event_id):
#     event = get_object_or_404(Event, event_id = event_id)

#     # Check if the event has available slots
#     if event.participant_limit and event.participant_limit <= 0:
#         messages.warning(request, "No spots available for this event.")
#         return redirect("events")

#     if Registration.objects.filter(user=request.user, event=event).exists():
#         messages.warning(request, "You are already registered for this event.")
#     else:
#         # Create a registration
#         Registration.objects.create(user=request.user, event=event)

#         # Decrease participant limit if available
#         if event.participant_limit:
#             event.participant_limit -= 1
#             event.save()

#         messages.success(request, "Successfully registered for the event!")

#     return redirect("events")  # Redirect to the events page

@login_required
def register_event(request, event_id):
    event = get_object_or_404(Event, event_id=event_id)

    # Check participant limit
    if event.participant_limit and event.participant_limit <= 0:
        messages.warning(request, "No spots available for this event.")
        return redirect("events")

    registration, created = Registration.objects.get_or_create(user=request.user, event=event)
    
    if created:
        if event.participant_limit:
            event.participant_limit -= 1
            event.save()
        messages.success(request, "Successfully registered for the event!")
    else:
        messages.warning(request, "You are already registered for this event.")

    return redirect("events")

@login_required
def event_registrations(request):
    registrations = Registration.objects.filter(user=request.user)
    return render(request, 'users/registrations.html', {'registrations': registrations})

@login_required
def home(request):
    events = Event.objects.all()  # Fetch all events from the database
    return render(request, 'users/home.html', {'events': events})

@login_required
def unregister_event(request, event_id):
    registration = get_object_or_404(Registration, event_id=event_id, user=request.user)
    registration.delete()
    return redirect('event_registrations')