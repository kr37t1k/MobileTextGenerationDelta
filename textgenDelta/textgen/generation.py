import logging
from typing import Optional
import llama_cpp
from .models import TextGenerationSettings, Chat # Import the Chat model

# Configure logging for this module
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

# --- Default Configuration ---
DEFAULT_MODEL_PATH = "/sdcard/fuji/qwen2.5-1.5b-instruct-q4_k_m.gguf"
DEFAULT_CHAT_FORMAT = "qwen"
DEFAULT_GPU_LAYERS = -1
DEFAULT_BATCH_SIZE = 512
DEFAULT_THREADS = 4
DEFAULT_SEED = -1
DEFAULT_CONTEXT_LENGTH = 4096
DEFAULT_VERBOSE = True

# --- Generation Parameter Defaults ---
DEFAULT_TEMPERATURE = 0.7
DEFAULT_MAX_TOKENS = 200
DEFAULT_TOP_P = 1.0
DEFAULT_TOP_K = 50

# --- Generation Defaults ---
DEFAULT_ROLE = 'user'
DEFAULT_STOP_TOKENS = ["Q:", "\n\n"]

def generate_text(
    prompt: str,
    role: str = DEFAULT_ROLE,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    top_p: Optional[float] = None,
    top_k: Optional[int] = None,
    model_path: Optional[str] = None,
    stop_sequences: Optional[list[str]] = None,
) -> str:
    # Determine the final values for generation parameters
    try:
        settings = TextGenerationSettings.objects.filter(role=role).first()
        logger.debug(f"Fetched settings for role '{role}': {settings}")
    except Exception as e:
        logger.error(f"Error fetching settings for role '{role}' from database: {e}")
        settings = None

    final_temperature = temperature if temperature is not None else \
                       (settings.temperature if settings and settings.temperature is not None else DEFAULT_TEMPERATURE)
    final_max_tokens = max_tokens if max_tokens is not None else \
                      (settings.max_tokens if settings and settings.max_tokens is not None else DEFAULT_MAX_TOKENS)
    final_top_p = top_p if top_p is not None else \
                 (settings.top_p if settings and settings.top_p is not None else DEFAULT_TOP_P)
    final_top_k = top_k if top_k is not None else \
                 (settings.top_k if settings and settings.top_k is not None else DEFAULT_TOP_K)

    final_model_path = model_path or DEFAULT_MODEL_PATH
    final_stop_sequences = stop_sequences or DEFAULT_STOP_TOKENS

    logger.info(f"Generating text with model: {final_model_path}, role: {role}")

    # Attempt to load the model and generate text
    try:
        logger.debug(f"Initializing Llama model with path: {final_model_path}")
        model = llama_cpp.Llama(
            model_path=final_model_path,
            chat_format=DEFAULT_CHAT_FORMAT,
            n_gpu_layers=DEFAULT_GPU_LAYERS,
            n_batch=DEFAULT_BATCH_SIZE,
            n_threads=DEFAULT_THREADS,
            seed=DEFAULT_SEED,
            n_ctx=DEFAULT_CONTEXT_LENGTH,
            verbose=DEFAULT_VERBOSE,
        )

        logger.debug(f"Calling model with prompt: '{prompt[:50]}...', params: temp={final_temperature}, max_tokens={final_max_tokens}, top_p={final_top_p}, top_k={final_top_k}")
        result = model(
            prompt=prompt,
            temperature=final_temperature,
            max_tokens=final_max_tokens,
            top_p=final_top_p,
            top_k=final_top_k,
            stop=final_stop_sequences,
            echo=False,
        )

        logger.debug(f"Raw model result: {result}")
        generated_text = result["choices"][0]["text"]
        logger.info(f"Successfully generated text of length: {len(generated_text)}")

        # --- Save Chat to Database ---
        try:
            Chat.objects.create(prompt=prompt, response=generated_text)
            logger.debug(f"Saved chat to database: Prompt ID {Chat.objects.latest('id').id}")
        except Exception as e:
            logger.error(f"Error saving chat to database: {e}")
        # ---

        return generated_text

    except FileNotFoundError:
        logger.error(f"Model file not found at path: {final_model_path}")
        return ""
    except Exception as e:
        logger.error(f"An unexpected error occurred during text generation: {e}")
        return ""

# Example usage (uncomment if running this file directly for testing)
# if __name__ == "__main__":
#     test_prompt = "Explain the concept of gravity in simple terms."
#     generated = generate_text(prompt=test_prompt, role='user')
#     print("--- Generated Text ---")
#     print(generated)
#     print("--- End of Generated Text ---")
