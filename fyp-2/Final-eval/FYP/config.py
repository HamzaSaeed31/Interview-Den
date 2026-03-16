GROQ_API_KEYS = [
    "YOUR_GROQ_API_KEY_HERE",
    "YOUR_GROQ_API_KEY_HERE",
    "YOUR_GROQ_API_KEY_HERE"  # Optional: add multiple keys
]

MODEL_NAME = "llama-3.3-70b-versatile"
TEMPERATURE = 0.1

_current_key_index = 0

def get_current_api_key():
    return GROQ_API_KEYS[_current_key_index]

def cycle_api_key():
    global _current_key_index
    _current_key_index = (_current_key_index + 1) % len(GROQ_API_KEYS)
    return get_current_api_key()