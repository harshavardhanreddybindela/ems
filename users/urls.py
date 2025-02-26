from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication routes
    path("login/", views.login_view, name="login"),  # Renders the login template
    path("api/login/", views.jwt_login, name="jwt_login"),  # API login (JWT-based)
    path("signup/", views.jwt_signup, name="jwt_signup"),
    path("logout/", views.jwt_logout, name="jwt_logout"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Protected API route (requires JWT authentication)
    path("api/protected/", views.protected_view, name="protected_view"),

    # User dashboard and profile
    path("profile/", views.profile_view, name="profile"),
    path("about/", views.about_view, name="about"),

    # Event management routes
    path("events/", views.event_list, name="events"),
    path("events/add/", views.add_event, name="add_event"),
    path("events/delete/<int:event_id>/", views.delete_event, name="delete_event"),
    path("register-event/<int:event_id>/", views.register_event, name="register_event"),
    path("unregister/<int:event_id>/", views.unregister_event, name="unregister_event"),
    path("registrations/", views.event_registrations, name="event_registrations"),
    path("events/poster/<int:event_id>/", views.get_event_poster, name="event_poster"),

    # Main Home route
    path("", views.home, name="home"),
    path("home/", views.home, name="home"),
]
