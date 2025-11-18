# textgen/models.py
from django.db import models

class TextGenerationSettings(models.Model):
    # Add a unique identifier for the default settings instance
    # Using a CharField with a fixed value is one way to ensure only one default set exists
    identifier = models.CharField(max_length=10, default='default', unique=True)

    role = models.CharField(max_length=100, default='user')
    temperature = models.FloatField(default=0.7)
    model_path = models.CharField(max_length=200, default='"/sdcard/fuji/qwen2.5-1.5b-instruct-q4_k_m.gguf" or "/sdcard/fuji/Saiga-7B_LLAMA-model-q2_K.gguf"')
    max_tokens = models.IntegerField(default=200)
    top_p = models.FloatField(default=1.0)
    top_k = models.IntegerField(default=50)
    seed = models.IntegerField(default=-1)

    def __str__(self):
        return f"Settings ({self.identifier})"

    class Meta:
        # constraints = [
        #     models.UniqueConstraint(fields=['identifier'], condition=models.Q(identifier='default'), name='unique_default_settings')
        # ]
        pass

class Chat(models.Model):
    prompt = models.TextField()
    response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat: {self.prompt[:50]}..."

    class Meta:
        ordering = ['-timestamp'] # Orders by newest first by default