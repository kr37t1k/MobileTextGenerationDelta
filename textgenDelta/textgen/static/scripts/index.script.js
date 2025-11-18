document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('chatForm');
    const promptInput = document.getElementById('promptInput');
    const chatHistoryDiv = document.getElementById('chatHistory');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const sendButton = document.getElementById('sendButton');

    // Settings Modal Elements
    const settingsModal = document.getElementById('settingsModal');
    const openSettingsBtn = document.getElementById('openSettingsBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const settingsForm = document.getElementById('settingsForm');

    // Open Settings Modal
    openSettingsBtn.addEventListener('click', function() {
        settingsModal.style.display = 'block';
    });

    // Close Settings Modal (X button, Cancel button, or clicking outside)
    function closeModal() {
        settingsModal.style.display = 'none';
    }

    closeSettingsBtn.addEventListener('click', closeModal);
    cancelSettingsBtn.addEventListener('click', closeModal);

    // Close modal if clicked outside the content
    window.addEventListener('click', function(event) {
        if (event.target === settingsModal) {
            closeModal();
        }
    });

    // Save Settings (Placeholder - you'll need to implement saving to backend)
    saveSettingsBtn.addEventListener('click', function() {
        // Get values from the form
        const role = document.getElementById('roleInput').value;
        const seed = document.getElementById('seedInput').value;
        const temperature = document.getElementById('temperatureInput').value;
        const modelPath = document.getElementById('modelPathInput').value;
        const maxTokens = document.getElementById('maxTokensInput').value;
        const topP = document.getElementById('topPInput').value;
        const topK = document.getElementById('topKInput').value;

        // Example: Log the settings (replace with actual saving logic)
        console.log('Saving settings:', { role, seed, temperature, modelPath, maxTokens, topP, topK });

        // You could store these in localStorage temporarily
        localStorage.setItem('aiSettings', JSON.stringify({
            role: role,
            seed: parseInt(seed),
            temperature: parseFloat(temperature),
            modelPath: modelPath,
            maxTokens: parseInt(maxTokens),
            topP: parseFloat(topP),
            topK: parseInt(topK)
        }));

        // Close the modal after saving
        closeModal();

        // Optionally, show a confirmation message
        alert('Settings saved locally!');
    });

    // Load Settings from localStorage on page load (if available)
    window.addEventListener('load', function() {
        const savedSettings = localStorage.getItem('aiSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                document.getElementById('roleInput').value = settings.role || 'user';
                document.getElementById('seedInput').value = settings.seed || -1;
                document.getElementById('modelPathInput').value = settings.modelPath || './qwen2.5b.gguf';
                document.getElementById('temperatureInput').value = settings.temperature || 0.7;
                document.getElementById('maxTokensInput').value = settings.maxTokens || 200;
                document.getElementById('topPInput').value = settings.topP || 1.0;
                document.getElementById('topKInput').value = settings.topK || 50;
            } catch (e) {
                console.error('Error loading settings from localStorage:', e);
            }
        }
    });

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
        const role = roleInput.value.trim();
        const temp = temperatureInput.value.trim();
        const maxtokens = maxTokensInput.value.trim();
        const topp = topPInput.value.trim();
        const topk = topKInput.value.trim();
        const modelpath = modelPathInput.value.trim();
        console.log(prompt, promptInput.value); // Log for debugging
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
            console.log("Sending prompt to server..."); // Log for debugging
            const response = await fetch('', {
                method: 'POST',
                body: new URLSearchParams({ prompt: prompt, role: role, temperature: temp, maxTokens: maxtokens, topP: topp, topK: topk, model_path: modelpath }), // Send as form data
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value, // Include CSRF token for form data
                },
            });

            if (response.redirected) {
                // If Django sent a redirect, manually reload the page
                console.log("Redirect received, reloading page...");
                window.location.href = response.url;
            } else if (!response.ok) {
                // Handle other non-OK responses (like 400, 500 errors)
                const errorText = await response.text(); // Or .json() if server returns JSON errors
                throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
            } else {
                 // If response was OK but not redirected, it might be the full HTML page
                 // This is less common with redirects, but if it happens, you could replace the body
                 // const html = await response.text();
                 // document.open();
                 // document.write(html);
                 // document.close();
                 // However, the redirect check above should handle it.
                 console.warn("Received OK response but not redirected - this might indicate an issue with the server logic.");
                 // Reload the page anyway to ensure consistency
                 console.log("No redirect, reloading page...");
                 window.location.reload();
            }

        } catch (error) {
            console.error('Error submitting prompt:', error);
            // Update the placeholder response with error
            const aiBubble = messageContainer.querySelector('.message-ai .message-content');
            if (aiBubble) {
                aiBubble.textContent = `Error: ${error.message}`;
            }
        } finally {
            // Re-enable input and hide loading *only* if there was an error
            // If successful, the page should reload anyway, resetting the state
            // So, we only re-enable here if an error occurred *before* the potential reload.
            // The reload itself will reset the form and loading indicator.
            if (promptInput.disabled && !loadingIndicator.classList.contains('d-none')) {
                 // If inputs are still disabled and loading is still shown,
                 // it means the try block finished without a reload (e.g., due to an error caught by catch)
                 promptInput.disabled = false;
                 sendButton.disabled = false;
                 loadingIndicator.classList.add('d-none');
            }
        }
    });

    // Optional: Add functionality to click on sidebar items (requires backend changes for context loading)
    // document.querySelectorAll('.chat-history-list li').forEach(item => {
    //     item.addEventListener('click', function() {
    //         // Logic to load chat context (requires backend changes)
    //         document.querySelectorAll('.chat-history-list li').forEach(i => i.classList.remove('active'));
    //         this.classList.add('active');
    //     });
    // });
});