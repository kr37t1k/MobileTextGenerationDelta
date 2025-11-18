document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('chatForm');
    const promptInput = document.getElementById('promptInput');
    const chatHistoryDiv = document.getElementById('chatHistory');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const sendButton = document.getElementById('sendButton');

    // Auto-resize textarea
    promptInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 150) + 'px'; // Cap at 150px
    });

    // Handle Enter key (without Shift) for submission
    promptInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent default Enter (new line)
            form.dispatchEvent(new Event('submit')); // Trigger form submit
        }
    });

    // Form Submission Handler
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const prompt = promptInput.value.trim();
        console.log(prompt, promptInput.value);
        if (!prompt) return;

        // Disable input and show loading
        promptInput.disabled = true;
        sendButton.disabled = true;
        loadingIndicator.classList.remove('d-none');

        // Add user message to display immediately (optimistic update)
        const messageContainer = document.createElement('div');
        messageContainer.className = 'message-container mb-3';
        messageContainer.innerHTML = `<div class="message-user d-flex justify-content-end mb-1"><div class="message-bubble bg-primary text-white p-3 rounded"><div class="message-content">${prompt}</div></div></div><div class="message-ai d-flex justify-content-start mb-1"><div class="message-bubble bg-light border p-3 rounded"><div class="message-content">...</div></div></div>`;
        chatHistoryDiv.appendChild(messageContainer);
        chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight; // Scroll to bottom

        try {
            // Send as JSON
            const response = await fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value, // Include CSRF token for JSON
                },
                body: JSON.stringify({ prompt: prompt }), // Send as JSON
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json(); // Expect JSON response from Django
            if (data.success) {
                // Update the placeholder with the actual response
                const aiBubble = messageContainer.querySelector('.message-ai .message-content');
                if (aiBubble) {
                    aiBubble.textContent = data.response;
                }
                // Optionally, add the timestamp or other data if needed in the UI
            } else {
                throw new Error(data.error || 'Unknown error from server');
            }

            // Clear the input field after successful submission
            promptInput.value = '';
            promptInput.style.height = '40px'; // Reset height

        } catch (error) {
            console.error('Error submitting prompt:', error);
            // Update the placeholder response with error
            const aiBubble = messageContainer.querySelector('.message-ai .message-content');
            if (aiBubble) {
                aiBubble.textContent = `Error: ${error.message}`;
            }
        } finally {
            // Re-enable input and hide loading
            promptInput.disabled = false;
            sendButton.disabled = false;
            loadingIndicator.classList.add('d-none');
        }
    });
});