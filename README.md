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
*   A compatible AI language model file (e.g., `Qwen2.5-1.5B` from Hugging Face).

## Installation

1.  **Install Termux:** Download and install Termux from F-Droid or its official GitHub repository.
2.  **Download the AI Model:** Obtain the desired AI model file (e.g., `qwen2.5-1.5b.gguf`) from a source like Hugging Face. Place the model file in a known location within your Termux environment (e.g., `~/models/`).
3.  **Clone the Repository:**
    *   Open Termux.
    *   Clone this repository to your phone:
        ```bash
<<<<<<< Updated upstream
        git clone https://github.com/kr37t1k/MobileTextGenerationDelta
        cd MobileTextGenerationDelta
=======
        git clone <URL_OF_YOUR_REPOSITORY> # Replace with the actual URL
        cd <REPOSITORY_NAME> # Replace with the name of your cloned folder
>>>>>>> Stashed changes
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
    *   Install Python packages using pip:
        ```bash
<<<<<<< Updated upstream
        pip install fastapi flask django llama-cpp-python
=======
        pip install fastapi flask django llama-cpp-python # Add other specific requirements if listed in a requirements.txt file
>>>>>>> Stashed changes
        ```
    *   You might also need other standard development tools:
        ```bash
        pkg install build-essential python-dev
        ```

## Configuration (Important!)

*   **Model Path:** You will likely need to modify the Django application's settings or a configuration file within the project to point to the exact path of your downloaded `.gguf` model file on your phone (e.g., `~/models/qwen2.5-1.5b.gguf`). Check the project's source code (e.g., `settings.py`, `views.py`, or a dedicated config file) for where the model path is defined and update it accordingly.
*   **Model Parameters:** Depending on the model size and your phone's capabilities, you might need to adjust parameters like context length (`n_ctx`) or threads (`n_threads`) within the application code for optimal performance.

## Usage

1.  **Navigate to Project Directory:** In Termux, go to the directory where you cloned the repository:
    ```bash
<<<<<<< Updated upstream
    cd /path/to/your/MobileTextGenerationDelta
=======
    cd /path/to/your/TextGenerationDelta
>>>>>>> Stashed changes
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
*   **Initial Setup:** The initial setup, especially compiling `llama-cpp-python` or installing large dependencies, might take some time.
*   **Documentation:** This is the initial documentation. More details might be added later regarding specific features, configuration options, or troubleshooting.

## Disclaimer

This project is a work-in-progress ("pet project"). Functionality and stability may vary. Use at your own risk and discretion.

---

*All power in phone.* - sorry♥