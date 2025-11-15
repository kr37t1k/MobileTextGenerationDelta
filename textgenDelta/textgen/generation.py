import llama_cpp
from llama_cpp import ChatCompletionRequestUserMessage, ChatCompletionRequestAssistantMessage, ChatCompletionRequestSystemMessage
from textgen.models import TextGenerationSettings

def generate_text(prompt: str, role: str = 'user', temperature: float = 0.7, max_tokens: int = 100, top_p: float = 1.0,top_k: int = 50,model_path=”.gguf”):
    model = llama_cpp.Llama(
        model_path=model_path,
        chat_format="qwen",
        n_gpu_layers=-1,
        n_batch=512,
        n_threads=4,
        seed=1337,
        n_ctx=4096,
        verbose=True,
    )
    settings = TextGenerationSettings.objects.filter(role=role).first()  # Получаем настройки из базы данных
    #
    if settings:
        temperature = settings.temperature
        max_tokens = settings.max_tokens
        top_p = settings.top_p
        top_k = settings.top_k

    # result = model.create_chat_completion(
    #     messages=[
    #         {"role":"system", "content":"You're an AI. Name is Eden"},
    #         {"role":"user", "content":prompt
    #     ],
    #     temperature=temperature,
    #     max_tokens=max_tokens,
    #     top_p=top_p,
    #     top_k=top_k
    # )

    result = model(
        prompt=prompt,
        temperature=temperature,
        max_tokens=max_tokens,
        top_p=top_p,
        top_k=top_k,
        stop=["Q:",],
        echo=False,
          )

    print(result)
    return str(result["choices"][0]["text"])
