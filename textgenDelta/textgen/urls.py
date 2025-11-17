from django.urls import path
from . import views

urlpatterns = [
    path('', views.generate_ajax, name='generate_text'),
]
