"""
MobileTextGenerationDelta - Generation Module

This module handles the core text generation logic using llama-cpp-python.
It loads a specified model and generates text based on a prompt, applying
settings that can be overridden by database entries.
"""

import logging
from typing import Optional, Dict, Any
import llama_cpp
from textgen.models import TextGenerationSettings # Assuming Django model

# Configure logging for this module
logger = logging.getLogger(__name__)

# --- Default Configuration ---
# These are fallback values if no database settings are found for a role
# or if the model path is not explicitly provided.
DEFAULT_MODEL_PATH = "models/qwen2.5-1.5b-instruct-q4_k_m.gguf" # Updated default path example
DEFAULT_CHAT_FORMAT = "qwen"
DEFAULT_GPU_LAYERS = -1 # Attempt to offload all layers to GPU if available
DEFAULT_BATCH_SIZE = 512
DEFAULT_THREADS = 4
DEFAULT_SEED = -1
DEFAULT_CONTEXT_LENGTH = 4096
DEFAULT_VERBOSE = True

# --- Generation Parameter Defaults ---
# Used if no database settings are found for the specified role
DEFAULT_TEMPERATURE = 0.7
DEFAULT_MAX_TOKENS = 200  # Increased default from 100
DEFAULT_TOP_P = 1.0
DEFAULT_TOP_K = 50

# --- Generation Defaults ---
DEFAULT_ROLE = 'user'
DEFAULT_STOP_TOKENS = ["Q:", "\n\n"] # Added newline as a potential stop token

def generate_text(
    prompt: str,
    role: str = DEFAULT_ROLE,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    top_p: Optional[float] = None,
    top_k: Optional[int] = None,
    model_path: Optional[str] = None,
    stop_sequences: Optional[list[str]] = None,
    # Additional parameters can be added here if needed by llama_cpp.Llama.__call__
) -> str:
    """
    Generates text based on the provided prompt using a specified language model.

    Args:
        prompt (str): The input text prompt for the model.
        role (str, optional): The user role used to fetch specific generation settings
                              from the database (TextGenerationSettings). Defaults to 'user'.
        temperature (float, optional): Controls randomness. Defaults to the value found
                                       in the database for the role, or DEFAULT_TEMPERATURE.
        max_tokens (int, optional): Maximum number of tokens to generate.
                                    Defaults to the database value or DEFAULT_MAX_TOKENS.
        top_p (float, optional): Nucleus sampling parameter. Defaults to the database
                                 value or DEFAULT_TOP_P.
        top_k (int, optional): Top-k sampling parameter. Defaults to the database
                               value or DEFAULT_TOP_K.
        model_path (str, optional): Path to the GGUF model file. Defaults to
                                    the value in DEFAULT_MODEL_PATH.
        stop_sequences (list[str], optional): List of strings upon which the generation
                                              should stop. Defaults to DEFAULT_STOP_TOKENS.

    Returns:
        str: The generated text, or an empty string if an error occurs during generation.
             Logs errors using the standard logging module.
    """
    # Determine the final values for generation parameters
    # Use provided values, fall back to database settings, then to defaults
    try:
        settings = TextGenerationSettings.objects.filter(role=role).first()
        logger.debug(f"Fetched settings for role '{role}': {settings}")
    except Exception as e:
        logger.error(f"Error fetching settings for role '{role}' from database: {e}")
        settings = None # Fallback to defaults if database query fails

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
            chat_format=DEFAULT_CHAT_FORMAT, # Consider making this configurable too
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
            echo=False,  # Do not include the prompt in the output
        )

        logger.debug(f"Raw model result: {result}")
        generated_text = result["choices"][0]["text"]
        logger.info(f"Successfully generated text of length: {len(generated_text)}")
        return generated_text

    except FileNotFoundError:
        logger.error(f"Model file not found at path: {final_model_path}")
        return ""
    except llama_cpp.LlamaGrammarException as e:
        logger.error(f"Llama grammar error during generation: {e}")
        return ""
    except llama_cpp.LlamaContextException as e:
        logger.error(f"Llama context error during generation (e.g., context length exceeded): {e}")
        return ""
    except Exception as e:
        logger.error(f"An unexpected error occurred during text generation: {e}")
        return ""

# Example usage (uncomment if running this file directly for testing)
# if __name__ == "__main__":
#     # Example prompt
#     test_prompt = "Explain the concept of gravity in simple terms."
#     # Example call using defaults and database settings for 'user' role
#     generated = generate_text(prompt=test_prompt, role='user')
#     print("--- Generated Text ---")
#     print(generated)
#     print("--- End of Generated Text ---")
