# TextGenerationDelta

**TextGenerationDelta** is a Django-based local web application designed to run AI language models directly on your powerful smartphone. This project allows you to leverage the computational power of your device to generate text using locally hosted models, providing privacy and portability.

## Features

*   **Local AI Execution:** Runs AI models directly on your smartphone.
*   **Django Web Interface:** Provides a web-based UI accessible via your phone's browser or other devices on the same network.
*   **Powered by `llama-cpp-python`:** Utilizes efficient C++ implementations for running models.
*   **Model Flexibility:** Can be configured to work with various compatible local models (e.g., Qwen2.5-1.5B).

## Requirements

*   A relatively powerful **Android smartphone**.
*   **Termux:** An Android terminal emulator and Linux environment app (available on F-Droid or GitHub).
*   A compatible AI language model file (e.g., `Qwen2.5-1.5B` in GGUF format from Hugging Face).

## Installation

1.  **Install Termux:** Download and install Termux from F-Droid or its official GitHub repository.
2.  **Download the AI Model:** Obtain the desired AI model file (e.g., `qwen2.5-1.5b-instruct-q4_k_m.gguf`) from a source like Hugging Face. Place the model file in a known location within your Termux environment (e.g., `~/models/`).
3.  **Clone the Repository:**
    *   Open Termux.
    *   Clone this repository to your phone:
        ```bash
        git clone https://github.com/kr37t1k/MobileTextGenerationDelta
        cd MobileTextGenerationDelta
        ```
4.  **Install Dependencies in Termux:**
    *   Update the package list:
        ```bash
        pkg update && pkg upgrade
        ```
    *   Install Python and essential build tools:
        ```bash
        pkg install python clang
        ```
    *   **Install Python packages using pip:**
        *   You can install them individually as before:
            ```bash
            pip install Django llama-cpp-python
            ```
        *   **Or, preferably, use the provided `requirements.txt` file:**
            ```bash
            pip install -r requirements.txt
            ```
            *(Note: Installing `llama-cpp-python` might take a significant amount of time in Termux as it compiles native code)*
    *   You might also need other standard development tools if not already included:
        ```bash
        pkg install build-essential python-dev
        ```

## Configuration (Important!)

*   **Model Path:** You will need to configure your Django application (likely within `views.py`, `settings.py`, or wherever `generate_text` is called) to point to the exact path of your downloaded `.gguf` model file on your phone (e.g., `/home/benjamin/models/qwen2.5-1.5b-instruct-q4_k_m.gguf`). The default path in `generation.py` is `".gguf"` which needs to be updated.
*   **Django Settings:** Ensure your Django `settings.py` is configured correctly (database, allowed hosts if accessing externally, etc.). You might need to run Django migrations if you have models defined beyond `TextGenerationSettings`:
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

## Usage

1.  **Navigate to Project Directory:** In Termux, go to the directory where you cloned the repository:
    ```bash
    cd /path/to/your/TextGenerationDelta
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

## Notes

*   **Performance:** Performance depends heavily on your smartphone's CPU and available RAM. Larger models will require more resources and might run slowly or not at all on less powerful devices.
*   **Power Consumption:** Running AI models locally can be demanding and may drain your battery quickly.
*   **Initial Setup:** The initial setup, especially installing `llama-cpp-python`, might take some time.
*   **Model Path:** Ensure the `model_path` variable in your code (e.g., in `generation.py` or wherever it's used) points to the correct location of your downloaded `.gguf` file.

---

*All power in phone.* - sorry♥