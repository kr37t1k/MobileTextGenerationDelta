# textgen/views.py
from django.http import JsonResponse, HttpResponse, HttpRequest
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib import messages
from .generation import generate_text
from .models import Chat, TextGenerationSettings
import json


@require_http_methods(["GET", "POST"])
def index(request: HttpRequest) -> HttpResponse:
    # Fetch all chats, ordered by newest first (as defined in Chat.Meta.ordering)
    chats = Chat.objects.all()

    # Fetch default settings from the database (assuming one 'default' entry)
    # Use get_or_create to ensure the default settings exist
    default_settings, created = TextGenerationSettings.objects.get_or_create(
        identifier='default',
        defaults={
            'role': 'user',
            'temperature': 0.7,
            'model_path': '/sdcard/fuji/Saiga-7B_LLAMA-model-q2_K.gguf',
            'max_tokens': 200,
            'top_p': 1.0,
            'top_k': 50,
            'seed': -1
        }
    )

    if request.method == 'POST':
        if request.content_type == 'application/x-www-form-urlencoded':
            # Handle standard form submission (e.g., if JavaScript is disabled)
            prompt = request.POST.get('prompt', '').strip()
            data = request.POST
            if prompt:
                try:
                    response_text = generate_text(prompt=prompt, model_path=data.get('model_path', None), role=data.get('role', None), temperature=data.get('temperature', None), max_tokens=data.get('max_tokens', None), top_p=data.get('top_p', None), top_k=data.get('top_k', None))
                    if response_text:
                        pass  # Chat is saved automatically in generate_text
                    else:
                        messages.error(request, 'Failed to generate response.')
                except Exception as e:
                    import logging
                    logging.exception("Error generating text in view")
                    messages.error(request, 'An error occurred during generation.')
            return redirect('textgen:index')  # Redirect for standard form submission

        elif request.content_type.startswith('application/json'):
            # Handle AJAX/JSON request from JavaScript fetch
            import json
            try:
                data = json.loads(request.body)
                prompt = data.get('prompt', '').strip()
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON'}, status=400)

            if prompt:
                try:
                    response_text = generate_text(prompt=prompt, model_path=data.get('model_path', None), role=data.get('role', None), temperature=data.get('temperature', None), max_tokens=data.get('max_tokens', None), top_p=data.get('top_p', None), top_k=data.get('top_k', None))
                    if response_text:
                        # Fetch the newly created chat object to return its details
                        latest_chat = Chat.objects.latest('id')  # Or filter by prompt/response if not latest
                        return JsonResponse({
                            'success': True,
                            'prompt': latest_chat.prompt,
                            'response': latest_chat.response,
                            'timestamp': latest_chat.timestamp.isoformat()  # Format timestamp for JS
                        })
                    else:
                        return JsonResponse({'error': 'Failed to generate response.'}, status=500)
                except Exception as e:
                    import logging
                    logging.exception("Error generating text in view for AJAX")
                    return JsonResponse({'error': 'An error occurred during generation.'}, status=500)
            else:
                return JsonResponse({'error': 'Prompt is required'}, status=400)

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
        response_text = generate_text(prompt=prompt)  # Use your updated function

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
