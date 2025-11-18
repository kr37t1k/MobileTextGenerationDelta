# textgen/views.py
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib import messages
from .generation import generate_text
from .models import Chat, TextGenerationSettings
import json

@require_http_methods(["GET", "POST"])
def index(request):
    # Fetch all chats, ordered by newest first (as defined in Chat.Meta.ordering)
    chats = Chat.objects.all()

    # Fetch default settings from the database (assuming one 'default' entry)
    # Use get_or_create to ensure the default settings exist
    default_settings, created = TextGenerationSettings.objects.get_or_create(
        identifier='default',
        defaults={
            'role': 'user',
            'temperature': 0.7,
            'model_path': './qwen2.5b.gguf',
            'max_tokens': 200,
            'top_p': 1.0,
            'top_k': 50,
            'seed': 1337
        }
    )

    if request.method == 'POST':
        prompt = request.POST.get('prompt', '').strip()
        if prompt:
            try:
                # Pass settings from the database to generate_text
                # This requires modifying generate_text to accept these parameters or fetch them internally
                # For now, generate_text might still use its internal logic or localStorage values if passed via JS
                # Example: response_text = generate_text(prompt=prompt, temperature=default_settings.temperature, ...)
                response_text = generate_text(prompt=prompt) # Assuming generate_text handles settings internally or via JS
                if response_text:
                    pass # Chat is saved automatically in generate_text
                else:
                    messages.error(request, 'Failed to generate response.')
            except Exception as e:
                import logging
                logging.exception("Error generating text in view")
                messages.error(request, 'An error occurred during generation.')
            return redirect('textgen:index')

    # Pass the default settings to the template context if needed for initial JS values
    context = {
        'chats': chats,
        'default_settings': default_settings
    }
    return render(request, 'textgen/index.html', context)

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
