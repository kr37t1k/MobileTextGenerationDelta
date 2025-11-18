from django.urls import path
from . import views

app_name = 'textgen'
urlpatterns = [
    path('', views.index, name='index'),  # Maps main URL / to the index view
    # path('chat/', views.chat_page, name='chat'),
    path('generate/', views.generate_ajax, name='generate'),  # Keep using AJAX
]
