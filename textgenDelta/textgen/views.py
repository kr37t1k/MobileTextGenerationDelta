# textgen/views.py
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .generation import generate_text # Import your updated generation function
from .models import Chat # Import the Chat model

@require_http_methods(["GET", "POST"])
def index(request):
    """
    Handles the main page: displays chat history and handles new prompts.
    """
    chats = Chat.objects.all() # Gets all chats, ordered by newest first due to Meta.ordering

    if request.method == 'POST':
        prompt = request.POST.get('prompt', '').strip()
        if prompt:
            # Generate response using your function
            response_text = generate_text(prompt=prompt) # Use your updated function
            # The generation function now saves the chat automatically
            # Redirect back to the index page to show the updated list
            # Or, if using AJAX, return JsonResponse below
            return redirect('textgen:index') # Redirect to the index view after POST

    # For GET requests, or after handling POST, render the page with history
    return render(request, 'textgen/index.html', {'chats': chats})

@csrf_exempt
@require_http_methods(["POST"])
def generate_ajax(request):
    """Handles the AJAX request for text generation."""
    try:
        data = json.loads(request.body)
        prompt = data.get('prompt', '')
        if not prompt:
            return JsonResponse({'error': 'Prompt is required'}, status=400)

        # Call your generation function
        response_text = generate_text(prompt=prompt) # Use your updated function

        # Optionally return the new chat ID or just the response
        # If returning the full chat list, you might need to refetch it
        # Or handle updating the list on the frontend side
        return JsonResponse({'response': response_text})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        import logging
        logging.exception("Error generating text")
        return JsonResponse({'error': 'Internal server error'}, status=500)
