# textgen/views.py
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib import messages # Optional: for user feedback
from .generation import generate_text # Import your updated generation function
from .models import Chat # Import the Chat model
import json # For AJAX requests

@require_http_methods(["GET", "POST"])
def index(request):
    """
    Handles the main chat page: displays chat history and handles new prompts.
    """
    # Fetch all chats, ordered by newest first
    chats = Chat.objects.all()

    if request.method == 'POST':
        prompt = request.POST.get('prompt', '').strip()
        if prompt:
            try:
                # Generate response using your function (which saves the chat)
                response_text = generate_text(prompt=prompt)
                if response_text: # Check if generation was successful
                    # Optionally, add a success message
                    # messages.success(request, 'Message sent and response received.')
                    pass
                else:
                    # Optionally, add an error message if generation failed
                    messages.error(request, 'Failed to generate response.')
            except Exception as e:
                # Log the error and optionally add a message
                import logging
                logging.exception("Error generating text in view")
                messages.error(request, 'An error occurred during generation.')

            # Redirect back to the index page to show the updated list and clear the form
            return redirect('textgen:index') # Use app namespace if defined

    # For GET requests, render the page with history
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
