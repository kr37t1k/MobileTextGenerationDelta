// Enhanced chat functionality with additional animations and features

// Global configuration
const CHAT_CONFIG = {
    maxRetries: 3,
    retryDelay: 1000,
    typingSpeed: 20,
    maxMessageLength: 2000
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize enhanced features
    initEnhancedChat();
    initTypingAnimation();
    initFloatingEffects();
    initScrollAnimations();
    initParticleSystem();
    initThemeSwitcher();
});

function initEnhancedChat() {
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
        // Add animation class
        setTimeout(() => {
            settingsModal.querySelector('.settings-modal-content').classList.add('show');
        }, 10);
    });

    // Close Settings Modal (X button, Cancel button, or clicking outside)
    function closeModal() {
        const modalContent = settingsModal.querySelector('.settings-modal-content');
        modalContent.classList.remove('show');
        setTimeout(() => {
            settingsModal.style.display = 'none';
        }, 300);
    }

    closeSettingsBtn.addEventListener('click', closeModal);
    cancelSettingsBtn.addEventListener('click', closeModal);

    // Close modal if clicked outside the content
    window.addEventListener('click', function(event) {
        if (event.target === settingsModal) {
            closeModal();
        }
    });

    // Save Settings
    saveSettingsBtn.addEventListener('click', function() {
        // Get values from the form
        const role = document.getElementById('roleInput').value;
        const seed = document.getElementById('seedInput').value;
        const temperature = document.getElementById('temperatureInput').value;
        const modelPath = document.getElementById('modelPathInput').value;
        const maxTokens = document.getElementById('maxTokensInput').value;
        const topP = document.getElementById('topPInput').value;
        const topK = document.getElementById('topKInput').value;

        // Store in localStorage
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

        // Show success feedback
        showNotification('Settings saved successfully!', 'success');
    });

    // Load Settings from localStorage on page load
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
        this.style.height = Math.min(this.scrollHeight, 200) + 'px'; // Cap at 200px
    });

    // Handle Enter key (without Shift) for submission
    promptInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    });

    // Form Submission Handler
    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        const prompt = promptInput.value.trim();
        const role = document.getElementById('roleInput').value.trim();
        const temp = document.getElementById('temperatureInput').value.trim();
        const maxtokens = document.getElementById('maxTokensInput').value.trim();
        const topp = document.getElementById('topPInput').value.trim();
        const topk = document.getElementById('topKInput').value.trim();
        const modelpath = document.getElementById('modelPathInput').value.trim();

        if (!prompt) return;
        if (prompt.length > CHAT_CONFIG.maxMessageLength) {
            showNotification(`Message too long! Maximum ${CHAT_CONFIG.maxMessageLength} characters.`, 'error');
            return;
        }

        // Disable input and show loading
        promptInput.disabled = true;
        sendButton.disabled = true;
        loadingIndicator.classList.remove('d-none');

        // Add user message to display immediately (optimistic update)
        const messageContainer = document.createElement('div');
        messageContainer.className = 'message-container mb-3';
        messageContainer.innerHTML = `
            <div class="message-user d-flex justify-content-end mb-1">
                <div class="message-bubble bg-primary text-white p-3 rounded">
                    <div class="message-content">${escapeHtml(prompt)}</div>
                </div>
            </div>
            <div class="message-ai d-flex justify-content-start mb-1">
                <div class="message-bubble bg-light border p-3 rounded">
                    <div class="message-content typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        chatHistoryDiv.appendChild(messageContainer);
        chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight; // Scroll to bottom

        try {
            const response = await fetch('', {
                method: 'POST',
                body: new URLSearchParams({ 
                    prompt: prompt, 
                    role: role, 
                    temperature: temp, 
                    maxTokens: maxtokens, 
                    topP: topp, 
                    topK: topk, 
                    model_path: modelpath 
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                },
            });

            if (response.redirected) {
                window.location.href = response.url;
            } else if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
            } else {
                window.location.reload();
            }

        } catch (error) {
            console.error('Error submitting prompt:', error);
            const aiBubble = messageContainer.querySelector('.message-ai .message-content');
            if (aiBubble) {
                aiBubble.innerHTML = `<span class="text-danger">Error: ${error.message}</span>`;
            }
        } finally {
            if (promptInput.disabled && !loadingIndicator.classList.contains('d-none')) {
                promptInput.disabled = false;
                sendButton.disabled = false;
                loadingIndicator.classList.add('d-none');
            }
        }
    });

    // Add click functionality to chat history items
    document.querySelectorAll('.chat-history-list li').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.chat-history-list li').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Add ripple effect on click
            createRippleEffect(this);
        });
    });
}

function initTypingAnimation() {
    // Add typing animation to AI messages
    const style = document.createElement('style');
    style.textContent = `
        .typing-indicator {
            display: flex;
            justify-content: center;
            gap: 4px;
        }
        
        .typing-indicator span {
            width: 8px;
            height: 8px;
            background-color: #6c757d;
            border-radius: 50%;
            display: inline-block;
            animation: typing 1.4s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(1) {
            animation-delay: -0.32s;
        }
        
        .typing-indicator span:nth-child(2) {
            animation-delay: -0.16s;
        }
        
        @keyframes typing {
            0%, 80%, 100% {
                transform: scale(0.8);
                opacity: 0.6;
            }
            40% {
                transform: scale(1.2);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

function initFloatingEffects() {
    // Add floating animation to various elements
    const style = document.createElement('style');
    style.textContent = `
        .floating {
            animation: floating 3s ease-in-out infinite;
        }
        
        .floating-1 {
            animation-delay: 0s;
        }
        
        .floating-2 {
            animation-delay: 0.5s;
        }
        
        .floating-3 {
            animation-delay: 1s;
        }
        
        @keyframes floating {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
    `;
    document.head.appendChild(style);
    
    // Apply floating effect to sidebar items
    document.querySelectorAll('.chat-history-list li, .settings-btn').forEach((item, index) => {
        item.classList.add('floating', 'hover-grow', `floating-${index % 3 + 1}`);
    });
}

function initScrollAnimations() {
    // Add scroll-triggered animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, observerOptions);
    
    // Observe message containers
    document.querySelectorAll('.message-container').forEach(container => {
        observer.observe(container);
    });
}

function initParticleSystem() {
    // Create a subtle particle background effect
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.3';
    
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 30;
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.color = `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 255)}, ${Math.random() * 0.5})`;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
            if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

function initThemeSwitcher() {
    // Add theme switching functionality
    const themeToggle = document.createElement('div');
    themeToggle.innerHTML = `
        <button id="theme-toggle" class="theme-toggle-btn">
            <i class="bi bi-moon"></i>
        </button>
    `;
    
    themeToggle.id = 'theme-toggle-container';
    themeToggle.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
    `;
    
    themeToggle.querySelector('.theme-toggle-btn').style.cssText = `
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4e54c8, #8f94fb);
        border: none;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
        font-size: 1.2rem;
    `;
    
    document.body.appendChild(themeToggle);
    
    document.getElementById('theme-toggle').addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        const icon = this.querySelector('i');
        if (document.body.classList.contains('dark-theme')) {
            icon.className = 'bi bi-sun';
            showNotification('Dark theme activated', 'info');
        } else {
            icon.className = 'bi bi-moon';
            showNotification('Light theme activated', 'info');
        }
    });
}

function createRippleEffect(element) {
    // Create ripple effect on click
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = (event.clientX - rect.left) - size / 2;
    const y = (event.clientY - rect.top) - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-text">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles for notification
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                padding: 15px 20px;
                border-radius: 10px;
                color: white;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                transform: translateX(120%);
                transition: transform 0.3s ease;
                max-width: 300px;
                backdrop-filter: blur(10px);
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-success {
                background: linear-gradient(135deg, #28a745, #20c997);
            }
            
            .notification-error {
                background: linear-gradient(135deg, #dc3545, #fd7e14);
            }
            
            .notification-info {
                background: linear-gradient(135deg, #17a2b8, #6f42c1);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 25px;
                height: 25px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }
            
            .notification-close:hover {
                background: rgba(255,255,255,0.2);
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Add close functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Add smooth scrolling for chat history
document.addEventListener('DOMContentLoaded', function() {
    const chatHistory = document.getElementById('chatHistory');
    if (chatHistory) {
        // Smooth scroll to bottom when new messages are added
        const originalScrollTo = chatHistory.scrollTo;
        chatHistory.scrollTo = function(...args) {
            if (args.length === 0 || (args[0] && typeof args[0] === 'object' && args[0].behavior === undefined)) {
                args[0] = args[0] || {};
                args[0].behavior = 'smooth';
            }
            originalScrollTo.apply(this, args);
        };
    }
});

// Add typing effect for welcome message
function initWelcomeTypingEffect() {
    const welcomeMessage = document.querySelector('.welcome-message h2');
    if (welcomeMessage) {
        const originalText = welcomeMessage.textContent;
        welcomeMessage.textContent = '';
        
        let i = 0;
        const typingTimer = setInterval(() => {
            if (i < originalText.length) {
                welcomeMessage.textContent += originalText.charAt(i);
                i++;
            } else {
                clearInterval(typingTimer);
            }
        }, 100);
    }
}

// Initialize welcome typing effect after DOM is loaded
if (document.querySelector('.welcome-message')) {
    setTimeout(initWelcomeTypingEffect, 500);
}