# users/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("signup/", views.signup_view, name="signup"),
    path("login/", views.login_view, name="login"),
    path("home/", views.home, name="home"),  # Home page path
    path('registrations/', views.event_registrations, name='event_registrations'),
    path("profile/", views.profile_view, name="profile"),  # Profile page path
    path("about/", views.about_view, name="about"),  # About Us page path
    path("logout/", views.logout_view, name="logout"),
    path('events/add/', views.add_event, name='add_event'),
    path('events/', views.event_list, name='events'), 
    path('events/delete/<int:event_id>/', views.delete_event, name='delete_event'),
    path('register-event/<int:event_id>/', views.register_event, name='register_event'),
    path('unregister/<int:event_id>/', views.unregister_event, name='unregister_event'),
    path('events/poster/<int:event_id>/', views.get_event_poster, name='event_poster'),
]
