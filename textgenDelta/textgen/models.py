from django.db import models

class TextGenerationSettings(models.Model):
    role_choices = [
        ('user', 'User'),
        ('assistant', 'AI'),
        ('system', 'System'),
    ]

    role = models.CharField(max_length=20, choices=role_choices, default='user')
    temperature = models.FloatField(default=0.7)
    max_tokens = models.IntegerField(default=2048)
    model_path = models.CharField(default="./qwen2.5b_q4k.gguf", max_length=120)
    top_p = models.FloatField(default=1.0)
    top_k = models.IntegerField(default=50)

    def __str__(self):
        return f"{self.role} - Temp: {self.temperature}, Max Tokens: {self.max_tokens}"

class Chat(models.Model):
    prompt = models.TextField()
    response = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)# Automatically set when created

    def __str__(self):
        # Simple representation for admin or debugging
        return f"Chat: {self.prompt[:50]}..."# Show first 50 chars of prompt

    class Meta:
        ordering = ['-timestamp']# Ordering by newest first by default
