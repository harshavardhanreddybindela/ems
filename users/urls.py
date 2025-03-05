from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication routes (JWT-based only)
    path("api/signup/", views.signup, name="signup"),
    path("api/login/", views.jwt_login, name="login"),  # API login (JWT-based)
    path("api/logout/", views.jwt_logout, name="logout"),  # API logout (JWT-based)
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),  # Refresh token

    # Protected API route (requires JWT authentication)
    #path("api/protected/", views.protected_view, name="protected_view"),

    # User dashboard and profile (use API to manage profile)
    #path("api/profile/", views.profile_view, name="profile"),
    #path("api/about/", views.about_view, name="about"),

    # Event management routes
    path("api/events/", views.event_list, name="events"),
    path("api/events/<int:event_id>/", views.event_detail, name="event_detail"),
    path("api/events/add/", views.add_event, name="add_event"),
    path("api/events/delete/<int:event_id>/", views.delete_event, name="delete_event"),
    path("api/register-event/<int:event_id>/", views.register_event, name="register_event"),
    path("api/unregister/<int:event_id>/", views.unregister_event, name="unregister_event"),
    path("api/registrations/", views.event_registrations, name="event_registrations"),
    # path("api/events/poster/<int:event_id>/", views.get_event_poster, name="event_poster"),

    # Home route (API route for events)
    #path("api/home/", views.home, name="home"),
]
