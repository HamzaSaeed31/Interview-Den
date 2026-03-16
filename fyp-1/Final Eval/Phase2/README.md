# Job Test Generator

A simple system to generate technical quiz questions for job interviews based on structured job data.

## 🧠 Overview

The Job Test Generator takes structured job information (in JSON format), generates relevant multiple-choice questions using an LLM, and saves them as JSON quiz files. It includes a separate quiz runner for taking the generated quizzes via the command line.

---

## ✨ Features

- **Structured Job Input**: Reads job information from a JSON file, including title, skills, responsibilities, and experience level  
- **Quiz Generation**: Creates multiple-choice questions (MCQs) relevant to job requirements using an LLM  
- **Quiz Storage**: Saves quizzes as JSON files in a `QuizData` directory  
- **Quiz Runner**: CLI tool to run the quizzes and score candidate answers  

---

## 📁 Files

- `config.py`: Configuration settings including API keys, model info, and file paths  
- `test_generator.py`: Generates and saves quizzes based on structured job JSON data  
- `quiz.py`: Runs the quizzes and shows results to candidates  
- `utils.py`: Helper functions for environment variables or file handling  
- `parser.py`: *(Optional)* Can be used if you wish to parse free-text job descriptions into structured JSON  

---

## 📦 Requirements

- Python 3.6+  
- Required packages listed in `requirements.txt`  
- Groq API key (set in `config.py`)  

---

## 🚀 Usage

### 🔧 Generating a Quiz

Use `test_generator.py` to generate a quiz from structured job data:

```bash
python test_generator.py --json ./data/latest_job.json --questions 10
```

This will:

1. Read the job data from the specified JSON file  
2. Generate multiple-choice questions using the LLM  
3. Save the quiz to a JSON file in the `QuizData` directory  

---

### 🧪 Running a Quiz

Use `quiz.py` to list available quizzes or run a specific quiz:

```bash
# List all available quizzes
python quiz.py list

# Run a specific quiz (replace QUIZ_ID with an actual quiz ID)
python quiz.py run QUIZ_ID
```

---

## ⚙️ Configuration

You can customize the following settings in `config.py`:

- `QUIZ_DATA_DIR`: Directory to store quiz JSON files  
- `GROQ_API_KEY`: Your Groq API key for LLM calls  
- `MODEL_NAME`: LLM model to use (e.g., `mixtral-8x7b-32768`)  
- `TEMPERATURE`: Temperature setting for LLM (e.g., 0.7)  
- `DEFAULT_NUM_QUESTIONS`: Default number of questions per quiz  

---

## 🧾 Example

1. Create a structured job JSON file like `data/latest_job.json` with fields like:
    - `job_title`
    - `skills_required`
    - `job_responsibilities`
    - `experience_required`
2. Run:

```bash
python test_generator.py --json ./data/latest_job.json
```

3. Run:

```bash
python quiz.py list
```

4. Run:

```bash
python quiz.py run QUIZ_ID
```

---

## 🔍 How it Works

1. The system reads job data from a structured JSON file  
2. It sends the data to the Groq LLM API to generate relevant questions  
3. The LLM returns formatted MCQs  
4. The questions are parsed and saved in JSON format  
5. The quiz runner loads the JSON and presents it to the candidate  
6. After completion, it scores the answers and shows results  

---
