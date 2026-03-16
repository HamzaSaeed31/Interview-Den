import json
import os
import requests
import time
import random
from typing import Dict, Any
import config

def read_job_description(file_path: str) -> str:
    """
    Read job description from a text file
    
    Args:
        file_path: Path to the job description text file
        
    Returns:
        Job description text as a string
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Job description file not found at: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    return text

def process_job_description_with_llm(job_description_text: str) -> Dict[str, Any]:
    """
    Process job description text with Groq's Llama3-70b to structure it into JSON format
    
    Args:
        job_description_text: Plain text job description
        
    Returns:
        Structured job description data as a dictionary
    """
    # Check cache first - create hash of input text for cache key
    import hashlib
    cache_key = hashlib.md5(job_description_text.encode()).hexdigest()
    cache_dir = os.path.join("temp", "cache")
    os.makedirs(cache_dir, exist_ok=True)
    cache_file = os.path.join(cache_dir, f"job_{cache_key}.json")
    
    # If cache exists, return cached result
    if os.path.exists(cache_file):
        print("Using cached job description result...")
        with open(cache_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    # Get API key from config file
    api_key = config.GROQ_API_KEY
    
    if not api_key:
        raise ValueError("Groq API key is not set. Please update the GROQ_API_KEY in config.py")
    
    # System message to define the task for the LLM
    system_message = """
    You are a job description parsing assistant. Your task is to extract and structure information from a job description into a clean, structured JSON format.
    
    Important: Do NOT add any inferences or additional content. Only extract information that is explicitly present in the job description.
    
    Use the following JSON format:
    
    {
      "job_title": "The title of the job (e.g., Data Scientist, Software Developer)",
      "role_description": "Summary of tasks and responsibilities expected for the role",
      "experience_required": {
        "years_of_experience": "Number of years of experience required"
      },
      "skills_required": {
        "technical_skills": [
          "List of programming languages, tools, or frameworks required"
        ],
        "soft_skills": [
          "List of soft skills required"
        ]
      },
      "preferred_skills": [
        "List of optional skills that can enhance your chances"
      ],
      "job_responsibilities": [
        "Task 1",
        "Task 2",
        "Task 3"
      ]
    }
    
    Instructions:
    1. Only include information that is explicitly mentioned in the job description.
    2. If specific information for a field is not provided, use "Not specified" for text fields or [] for arrays.
    3. For "years_of_experience", extract the number if mentioned, otherwise put "Not specified".
    4. Separate technical skills (programming languages, tools, frameworks) from soft skills (communication, teamwork).
    5. Differentiate between required skills and preferred/desired skills.
    6. Break down responsibilities into individual items in the list.
    7. Provide your response as a valid JSON object only, with no additional text.
    """
    
    # Prepare the request
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Prepare the request payload
    payload = {
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": job_description_text}
        ],
        "model": config.MODEL_NAME,
        "temperature": config.TEMPERATURE
    }
    
    # Make the API request with retry logic
    max_retries = 5
    base_delay = 2  # base delay in seconds
    
    for attempt in range(max_retries):
        try:
            print(f"Processing job description (attempt {attempt + 1}/{max_retries})...")
            
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload
            )
            
            # If successful, no need to retry
            if response.status_code == 200:
                break
                
            # If rate limited, wait and retry
            if response.status_code == 429:
                # Calculate delay with exponential backoff and jitter
                delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
                print(f"Rate limited. Retrying in {delay:.2f} seconds...")
                time.sleep(delay)
                continue
                
            # For other errors, raise exception
            response.raise_for_status()
            
        except requests.exceptions.RequestException as e:
            # If last attempt, raise the exception
            if attempt == max_retries - 1:
                raise Exception(f"Error in Groq API request after {max_retries} attempts: {str(e)}")
            
            # Otherwise, wait and retry
            delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
            print(f"Request failed. Retrying in {delay:.2f} seconds...")
            time.sleep(delay)
    
    # Process the response
    try:
        result = response.json()
        
        # Extract content from the response
        content = result["choices"][0]["message"]["content"]
        
        # Extract JSON from the content
        try:
            # Try to parse the response as JSON directly
            parsed_job = json.loads(content)
            
            # Cache the result
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(parsed_job, f, indent=2, ensure_ascii=False)
                
            return parsed_job
        except json.JSONDecodeError:
            # If the response is not valid JSON, attempt to extract just the JSON part
            import re
            json_match = re.search(r'({.*})', content, re.DOTALL)
            if json_match:
                try:
                    parsed_job = json.loads(json_match.group(1))
                    
                    # Cache the result
                    with open(cache_file, 'w', encoding='utf-8') as f:
                        json.dump(parsed_job, f, indent=2, ensure_ascii=False)
                        
                    return parsed_job
                except json.JSONDecodeError:
                    raise ValueError("Could not parse the LLM response as JSON")
            else:
                raise ValueError("Could not extract JSON from the LLM response")
    except Exception as e:
        raise Exception(f"Error in LLM processing: {str(e)}")

def process_job_description(job_file_path: str, output_json_path: str = None) -> Dict[str, Any]:
    """
    Process a job description from text file to structured JSON
    
    Args:
        job_file_path: Path to the job description text file
        output_json_path: Optional path to save the JSON output
        
    Returns:
        Structured job description data as a dictionary
    """
    # Read job description
    job_description_text = read_job_description(job_file_path)
    
    # Process with LLM
    structured_job = process_job_description_with_llm(job_description_text)
    
    # Save to file if output path is provided
    if output_json_path:
        os.makedirs(os.path.dirname(output_json_path) or '.', exist_ok=True)
        with open(output_json_path, 'w', encoding='utf-8') as f:
            json.dump(structured_job, f, indent=2, ensure_ascii=False)
    
    return structured_job 