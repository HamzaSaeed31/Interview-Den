# Configuration settings for the resume parser and quiz generator

# Groq API keys (stored in an array to cycle through if one runs out of credits)
GROQ_API_KEYS = [
    "YOUR_GROQ_API_KEY_HERE",
    "YOUR_GROQ_API_KEY_HERE",
    "YOUR_GROQ_API_KEY_HERE",
    "YOUR_GROQ_API_KEY_HERE"
]

# Current API key index (starts at 0)
CURRENT_API_KEY_INDEX = 0

# Function to get the current API key
def get_current_api_key():
    return GROQ_API_KEYS[CURRENT_API_KEY_INDEX]

# Function to cycle to the next API key
def cycle_api_key():
    global CURRENT_API_KEY_INDEX
    CURRENT_API_KEY_INDEX = (CURRENT_API_KEY_INDEX + 1) % len(GROQ_API_KEYS)
    return get_current_api_key()

# Model settings
MODEL_NAME = "moonshotai/kimi-k2-instruct-0905"
TEMPERATURE = 0.2

#--------------------------------------Part 2 Constants-------------------------------------
# Quiz data directory
QUIZ_DATA_DIR = "Part2/QuizData"

# Default number of questions per quiz
DEFAULT_NUM_QUESTIONS = 10