import fitz  # PyMuPDF
import json
import os
import requests
import time
import random
import hashlib
from typing import Dict, Any, List, Tuple, Optional
from collections import OrderedDict
import config  # Import the config file

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from a PDF file using PyMuPDF
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        Extracted text as a string
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found at: {pdf_path}")
    
    text = ""
    try:
        # Open the PDF
        with fitz.open(pdf_path) as doc:
            # Iterate through pages
            for page in doc:
                # Extract text from the page
                text += page.get_text()
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")
    
    return text

def check_resume_fraud(resume_data: Dict[str, Any]) -> Tuple[bool, Optional[str], List[str]]:
    """
    Check if a resume appears fraudulent or unrealistic
    
    Args:
        resume_data: Structured resume data
        
    Returns:
        Tuple containing (is_fraudulent, fraud_type, red_flags)
    """
    red_flags = []
    is_fraudulent = False
    fraud_type = None
    
    # Extract relevant data
    skills = resume_data.get('Skills', [])
    experiences = resume_data.get('Experience', {}).get('Experiences', [])
    education = resume_data.get('Education', [])
    projects = resume_data.get('Projects', [])
    total_years = resume_data.get('Experience', {}).get('Total Years', 0)
    
    # Check 1: Unrealistic number of skills
    if len(skills) > 40:  # Lowered from 30 to be more sensitive
        red_flags.append(f"Unrealistic number of skills ({len(skills)})")
    
    # Check 2: Inconsistency between experience and skills (junior claiming expert skills)
    expert_skill_keywords = ["expert", "specialist", "master", "advanced", "senior", "lead"]
    junior_experience = total_years < 3
    
    if junior_experience:
        # Check for expert claims in experiences
        for exp in experiences:
            description = exp.get('Description', '').lower()
            for keyword in expert_skill_keywords:
                if keyword in description:
                    red_flags.append(f"Junior candidate ({total_years} years) claiming {keyword} level expertise")
                    break
    
    # Check 3: Education inconsistencies
    has_education = len(education) > 0
    if not has_education and total_years < 10:  # Most professionals have some education unless very experienced
        red_flags.append("No education listed for a junior/mid-level candidate")
    
    # Check 4: Vague or generic project descriptions
    vague_count = 0
    vague_terms = ["various", "multiple", "several", "many", "diverse", "different", "numerous"]
    for project in projects:
        description = project.get('Description', '').lower()
        
        # Check for vague descriptions
        if len(description) < 20:  # Very short descriptions
            vague_count += 1
        
        # Check for vague quantifiers
        for term in vague_terms:
            if term in description:
                vague_count += 1
                break
    
    if vague_count >= len(projects) * 0.5 and len(projects) > 1:  # Lowered from 0.7 to 0.5 to be more sensitive
        red_flags.append("Vague or generic project descriptions")
    
    # Check 5: Buzzword density
    buzzwords = [
        "blockchain", "ai", "machine learning", "deep learning", "neural network", 
        "big data", "cloud", "devops", "agile", "scrum", "lean", 
        "microservices", "serverless", "quantum", "iot", "internet of things",
        "digital transformation", "disruption", "innovation", "synergy",
        "artificial intelligence", "data science", "nlp", "computer vision",
        "cryptocurrency", "augmented reality", "virtual reality", "ar/vr"
    ]
    
    buzzword_count = 0
    for skill in skills:
        skill_lower = skill.lower()
        for buzzword in buzzwords:
            if buzzword in skill_lower:
                buzzword_count += 1
                break
    
    # Calculate buzzword density (as percentage of skills)
    if skills:
        buzzword_density = (buzzword_count / len(skills)) * 100
        if buzzword_density > 40:  # Lowered from 60% to 40% to be more sensitive
            red_flags.append(f"High buzzword density ({buzzword_density:.1f}%)")
    
    # Check 6: Excessive experience claims
    if total_years > 10 and len(experiences) < 3:
        red_flags.append(f"Claims {total_years} years of experience but lists few specific roles")
    
    # Check 7: Exaggerated accomplishments
    exaggeration_terms = ["revolutionized", "transformed", "pioneered", "invented", "first ever", "groundbreaking"]
    exaggeration_count = 0
    
    for exp in experiences:
        description = exp.get('Description', '').lower()
        for term in exaggeration_terms:
            if term in description:
                exaggeration_count += 1
    
    if exaggeration_count >= 2:
        red_flags.append("Contains multiple exaggerated accomplishment claims")
    
    # Make the final determination
    if len(red_flags) >= 2:  # Lowered from 3 to 2 to be more sensitive
        is_fraudulent = True
        fraud_type = "Potentially fraudulent resume"
    elif len(red_flags) >= 1:  # Lowered from 2 to 1 to be more sensitive
        is_fraudulent = True
        fraud_type = "Suspicious resume with inconsistencies"
    
    return is_fraudulent, fraud_type, red_flags

def process_resume_with_llm(resume_text: str, job_description: str = None) -> Dict[str, Any]:
    """
    Process resume text with Groq's Llama3-70b to structure it into JSON format
    
    Args:
        resume_text: Plain text extracted from resume
        job_description: Optional job description text for context
        
    Returns:
        Structured resume data as a dictionary
    """
    # Check cache first - create hash of input text and job description for cache key
    cache_key_content = resume_text
    if job_description:
        cache_key_content += job_description
    
    cache_key = hashlib.md5(cache_key_content.encode()).hexdigest()
    cache_dir = os.path.join("temp", "cache")
    os.makedirs(cache_dir, exist_ok=True)
    cache_file = os.path.join(cache_dir, f"resume_{cache_key}.json")
    
    # If cache exists, return cached result
    if os.path.exists(cache_file):
        print("Using cached resume result...")
        with open(cache_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    # Get API key from config file
    api_key = config.GROQ_API_KEY
    
    if not api_key:
        raise ValueError("Groq API key is not set. Please update the GROQ_API_KEY in config.py")
    
    # System message to define the task for the LLM
    system_message = """
    You are a resume parsing assistant. Extract and structure information from the resume text into the following JSON format:
    
    {
      "Name": "",
      "Contact": {
        "Email": "",
        "Number": ""
      },
      "Experience": {
        "Total Years": 0,
        "Experiences": []
      },
      "Education": [],
      "Skills": [],
      "Languages": [],
      "Projects": [],
      "Certifications": [],
      "Awards": []
    }
    
    Important instructions:
    1. For Skills, include all technical skills, programming languages, frameworks, tools, and methodologies.
    2. For Languages, include ONLY spoken/natural languages like English, Spanish, etc. DO NOT put programming languages here - they belong in Skills.
    3. Infer additional relevant skills from the resume content that are implied but not explicitly mentioned.
    4. Only include inferred skills if they are reasonably suggested by the resume's experiences, projects, or overall focus.
    5. Do not hallucinate or add completely unrelated skills.
    6. Calculate the "Total Years" in Experience by summing up all work experience durations.
    7. Provide your response as a valid JSON object only, with no additional text.
    """
    
    # Add job description context if provided
    if job_description:
        system_message += f"""
        
        Use the following job description to guide your skill inference. Identify skills from the resume that are particularly relevant to this job description:
        
        JOB DESCRIPTION:
        {job_description}
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
            {"role": "user", "content": resume_text}
        ],
        "model": config.MODEL_NAME,
        "temperature": config.TEMPERATURE
    }
    
    # Make the API request with retry logic
    max_retries = 5
    base_delay = 2  # base delay in seconds
    
    for attempt in range(max_retries):
        try:
            print(f"Processing resume (attempt {attempt + 1}/{max_retries})...")
            
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
            parsed_resume = json.loads(content)
            
            # Check for fraudulent content
            is_fraudulent, fraud_type, red_flags = check_resume_fraud(parsed_resume)
            
            # Create an OrderedDict to ensure fraud_detection appears at the bottom
            ordered_resume = OrderedDict()
            
            # Add all resume fields first
            for key in parsed_resume:
                if key != "fraud_detection":  # Skip if already exists
                    ordered_resume[key] = parsed_resume[key]
            
            # Add fraud detection at the end
            if is_fraudulent:
                ordered_resume["is_fraudulent"] = True
                ordered_resume["fraud_type"] = fraud_type
                ordered_resume["red_flags"] = red_flags
            else:
                ordered_resume["is_fraudulent"] = False
            
            # Cache the result
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(ordered_resume, f, indent=2, ensure_ascii=False)
                
            return ordered_resume
        except json.JSONDecodeError:
            # If the response is not valid JSON, attempt to extract just the JSON part
            import re
            json_match = re.search(r'({.*})', content, re.DOTALL)
            if json_match:
                try:
                    parsed_resume = json.loads(json_match.group(1))
                    
                    # Check for fraudulent content
                    is_fraudulent, fraud_type, red_flags = check_resume_fraud(parsed_resume)
                    
                    # Create an OrderedDict to ensure fraud_detection appears at the bottom
                    ordered_resume = OrderedDict()
                    
                    # Add all resume fields first
                    for key in parsed_resume:
                        if key != "fraud_detection":  # Skip if already exists
                            ordered_resume[key] = parsed_resume[key]
                    
                    # Add fraud detection at the end
                    if is_fraudulent:
                        ordered_resume["is_fraudulent"] = True
                        ordered_resume["fraud_type"] = fraud_type
                        ordered_resume["red_flags"] = red_flags
                    else:
                        ordered_resume["is_fraudulent"] = False
                    
                    # Cache the result
                    with open(cache_file, 'w', encoding='utf-8') as f:
                        json.dump(ordered_resume, f, indent=2, ensure_ascii=False)
                        
                    return ordered_resume
                except json.JSONDecodeError:
                    raise ValueError("Could not parse the LLM response as JSON")
            else:
                raise ValueError("Could not extract JSON from the LLM response")
    except Exception as e:
        raise Exception(f"Error in LLM processing: {str(e)}")

def process_resume(pdf_path: str, job_description_path: str = None, output_json_path: str = None) -> Dict[str, Any]:
    """
    Process a resume from PDF to structured JSON
    
    Args:
        pdf_path: Path to the PDF resume
        job_description_path: Optional path to a job description text file
        output_json_path: Optional path to save the JSON output
        
    Returns:
        Structured resume data as a dictionary
    """
    # Extract text from PDF
    resume_text = extract_text_from_pdf(pdf_path)
    
    # Get job description if provided
    job_description = None
    if job_description_path and os.path.exists(job_description_path):
        with open(job_description_path, 'r', encoding='utf-8') as f:
            job_description = f.read()
    
    # Process with LLM
    structured_resume = process_resume_with_llm(resume_text, job_description)
    
    # Save to file if output path is provided
    if output_json_path:
        with open(output_json_path, 'w', encoding='utf-8') as f:
            json.dump(structured_resume, f, indent=2, ensure_ascii=False)
    
    return structured_resume 