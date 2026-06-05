from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('analyst', 'Analyst'),
        ('viewer', 'Viewer'),
    ]

    email      = models.EmailField(unique=True)
    full_name  = models.CharField(max_length=150, blank=True)
    role       = models.CharField(max_length=20, choices=ROLE_CHOICES, default='analyst')
    avatar     = models.CharField(max_length=4, default='BG')  # Initials
    is_active  = models.BooleanField(default=True)
    is_staff   = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'

    def __str__(self):
        return self.email

    @property
    def initials(self):
        parts = self.full_name.split()
        if len(parts) >= 2:
            return (parts[0][0] + parts[1][0]).upper()
        return self.full_name[:2].upper() if self.full_name else 'BG'
