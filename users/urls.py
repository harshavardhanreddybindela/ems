from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Authentication routes (JWT-based only)
    path("api/signup/", views.signup, name="signup"),
    path("api/login/", views.jwt_login, name="login"),  # API login (JWT-based)
    path("api/logout/", views.jwt_logout, name="logout"),  # API logout (JWT-based)
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),  # Refresh token
    path("api/check-staff/", views.check_staff_status, name="check-staff"),


    # Event management routes
    path("api/events/", views.event_list, name="events"),
    path("api/events/<int:event_id>/", views.event_detail, name="event_detail"),
    path("api/admin/add/", views.add_event, name="add_event"),
    path("api/admin/delete/<int:event_id>/", views.delete_event, name="delete_event"),
    path("api/admin/update/<int:event_id>/", views.update_event, name="update_event"),
    path("api/register-event/<int:event_id>/", views.register_event, name="register_event"),
    path("api/unregister/<int:event_id>/", views.unregister_event, name="unregister_event"),
    path("api/registrations/", views.event_registrations, name="event_registrations"),
    path('api/profile/', views.user_profile, name='user_profile'),


]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
