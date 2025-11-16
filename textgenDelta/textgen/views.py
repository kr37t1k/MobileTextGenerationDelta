# textgen/views.py
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .generation import generate_text # Import your updated generation function

@require_http_methods(["GET"])
def chat_view(request):
    """Renders the chat interface."""
    return render(request, 'textgen/chat.html')

@csrf_exempt # Ensure proper CSRF handling
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

        return JsonResponse({'response': response_text})
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        # Log the error for debugging
        import logging
        logging.exception("Error generating text")
        return JsonResponse({'error': 'Internal server error'}, status=500)