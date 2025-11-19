# TextGenerationDelta README v0.2.4

**TextGenerationDelta** is a Django-based local web application designed to run AI language models directly on your powerful smartphone. This project allows you to leverage the computational power of your device to generate text using locally hosted models, providing privacy and portability. It features a modern chat interface accessible via your phone's browser or other devices on the same network.

## Features

*   **Local AI Execution:** Runs AI models directly on your smartphone using `llama-cpp-python`.
*   **Django Web Interface:** Provides a responsive, modern web-based UI accessible via your phone's browser or other devices on the same network.
*   **Powered by `llama-cpp-python`:** Utilizes efficient C++ implementations for running models.
*   **Model Flexibility:** Can be configured to work with various compatible local models (e.g., Qwen2.5-1.5B).
*   **Chat History:** Stores and displays conversation history in a sidebar, sorted by date/time.
*   **Advanced Settings:** Configure generation parameters (role, seed, temperature, max tokens, top_p, top_k, model path) via an in-app settings modal.
*   **SQLite3 Database:** Uses SQLite3 for persistent storage of chat history and settings.
*   **Responsive Design:** Adapts to different screen sizes (mobile and desktop).
*   **Smooth Animations:** Includes subtle fade-in animations for new messages.

## Requirements

*   A relatively powerful **Android smartphone**.
*   **Termux:** An Android terminal emulator and Linux environment app (available on F-Droid or GitHub).

## Installation (Termux)

1.  **Install Termux:** Download and install Termux from F-Droid or its official GitHub repository.
2.  **Download the AI Model:** Obtain the desired AI model file (e.g., `qwen2.5-1.5b-instruct-q4_k_m.gguf`) from a source like Hugging Face. Place the model file in a known location within your Termux environment (e.g., `~/MobileTextGenerationDelta/models/`). Create the `models` directory if need, be careful with setting it up on web!:
    ```bash
    mkdir -p ~/MobileTextGenerationDelta/models
    ```
3.  **Clone the Repository:**
    *   Open Termux.
    *   Clone this repository to your phone:
        ```bash
        git clone <URL_OF_YOUR_REPOSITORY> # Replace with the actual URL
        cd <REPOSITORY_NAME> # Replace with the name of your cloned folder
        ```
4.  **Install Dependencies in Termux:**
    *   Update the package list:
        ```bash
        pkg update && pkg upgrade
        ```
    *   Install essential build tools and libraries (including Vulkan for potential GPU support):
        ```bash
        pkg install python clang build-essential vulkan-headers libvulkan
        ```
    *   Install `ninja` using `pkg` (often more reliable than pip in Termux):
        ```bash
        pkg install ninja
        ```
    *   Install Python packages using pip. You might need to install `numpy` first if it's a dependency for `llama-cpp-python`:
        ```bash
        pip install numpy
        pip install -r requirements.txt # Install other requirements from the file
        # Or install them individually:
        # pip install Django llama-cpp-python
        ```
        *(Note: Installing `llama-cpp-python` might take a significant amount of time in Termux as it compiles native code. Ensure `ninja` is installed system-wide via `pkg` first.)*

5.  **Configure Model Path:**
    *   You need to specify the path to your downloaded `.gguf` model file. This can be done in two ways:
        *   **Option A (Recommended):** Use the Settings Modal in the web interface after starting the server.
        *   **Option B (Code Edit):** Edit the `DEFAULT_MODEL_PATH` variable in your `textgen/generation.py` file to point to the full path of your model file (e.g., `/home/benjamin/TextGenerationDelta/models/qwen2.5-1.5b-instruct-q4_k_m.gguf`).

6.  **Run Django Migrations:**
    *   Navigate to your project directory (if not already there) ('~' in termux is their home dir, like "/data/data/termux.../home/):
        ```bash
        cd ~/TextGenerationDelta
        ```
    *   Run Django migrations to set up the SQLite3 database:
        ```bash
        python manage.py makemigrations
        python manage.py migrate
        ```

## Usage

1.  **Navigate to Project Directory:** In Termux, go to the directory where you cloned the repository:
    ```bash
    cd /path/to/MobileTextGenerationDelta
    ```
2.  **Run the Django Server:**
    *   Execute the Django development server. To make it accessible from other devices on your network (recommended for easier access), specify the host and port:
        ```bash
        python manage.py runserver --host 0.0.0.0 --port 8000
        ```
    *   Note down the IP address of your phone on your local network (usually found in your phone's WiFi settings). Let's assume it's `192.168.2.27`.
3.  **Access the Application:**
    *   Open a web browser on your phone or any other device connected to the same WiFi network.
    *   Navigate to `http://<YOUR_PHONE_IP>:8000`. For example: `http://192.168.2.27:8000`.
4.  **Use the Application:**
    *   Type your prompt in the text area at the bottom of the main chat area.
    *   Press Enter (without Shift) or click the Send button to submit.
    *   View the chat history in the left sidebar.
    *   Click the "Settings" button in the bottom left corner to adjust AI parameters.

## Notes

*   **Performance:** Performance depends heavily on your smartphone's CPU and available RAM. Larger models will require more resources and might run slowly. GPU offloading (`n_gpu_layers=-1` is set in the code) *may* be possible if `llama-cpp-python` was compiled with Vulkan support, but this requires a complex setup in Termux.
*   **Power Consumption:** Running AI models locally can be demanding and may drain your battery quickly.
*   **Initial Setup:** The initial setup, especially installing `llama-cpp-python`, might take some time.
*   **Model Path:** Ensure the model path is correctly configured either in the code or via the settings modal.
*   **SQLite3:** The application uses SQLite3 for local data storage, which is handled automatically by Django's ORM.

---

*All power in phone.* - sorry♥