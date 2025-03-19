from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None):
        if not email:
            raise ValueError("Users must have an email address")
        user = self.model(email=self.normalize_email(email))
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password):
        user = self.create_user(email, password)
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, null=False, default='Unknown')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"

    def __str__(self):
        return self.email

class Event(models.Model):
    event_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    datetime = models.DateTimeField()
    description = models.TextField()
    participant_limit = models.IntegerField(null=True, blank=True)
    poster = models.ImageField(upload_to='event_posters/', null=True, blank=True)

    def __str__(self):
        return self.name

class Registration(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)  # Fixed user reference
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'event')  # Prevent duplicate registrations
