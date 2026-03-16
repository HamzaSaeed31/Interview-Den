import json
import os
from pathlib import Path
import sys
import requests
import time
import random
import re
from typing import Dict, Any

# ============================================================
# CONFIGURATION - ADD YOUR GROQ API KEYS HERE
# ============================================================
GROQ_API_KEYS = [
    "YOUR_GROQ_API_KEY_HERE", #4
    "YOUR_GROQ_API_KEY_HERE", #5
    "YOUR_GROQ_API_KEY_HERE", #6
    "YOUR_GROQ_API_KEY_HERE", #7
    "YOUR_GROQ_API_KEY_HERE", #8
    "YOUR_GROQ_API_KEY_HERE", #9
    "YOUR_GROQ_API_KEY_HERE"  #10
]

MODEL_NAME = "llama-3.3-70b-versatile"
TEMPERATURE = 0.1

# Global variable to track current API key
_current_key_index = 0

def get_current_api_key():
    """Get the current API key"""
    if not GROQ_API_KEYS or GROQ_API_KEYS[0] == "your-groq-api-key-1":
        raise ValueError("Please set your Groq API keys in the GROQ_API_KEYS list at the top of this file")
    return GROQ_API_KEYS[_current_key_index]

def cycle_api_key():
    """Switch to the next API key"""
    global _current_key_index
    _current_key_index = (_current_key_index + 1) % len(GROQ_API_KEYS)
    return get_current_api_key()

# ============================================================
# RESUME MATCHING LOGIC (from resume_match.py)
# ============================================================

def compare_resume_with_job(resume_data: Dict[str, Any], job_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compare a resume with a job description using Groq LLM
    
    Args:
        resume_data: Structured resume data
        job_data: Structured job description data
        
    Returns:
        Matching evaluation as a dictionary
    """
    # Get API key
    try:
        api_key = get_current_api_key()
    except ValueError as e:
        raise ValueError(str(e))
    
    # System message
    system_message = """
    You are a fair and intelligent resume evaluation assistant. Your task is to compare a candidate's resume against a job description and provide a structured evaluation of the match.
    
    Compare the provided structured resume and job description data with the following priorities:
    - Technical Skills: High weight (look for exact matches and similar technologies)
    - Experience & Projects: High weight (must closely align with job responsibilities)
    - Soft Skills: Low weight (acknowledge them, but do not inflate the score)
    
    Be FAIR and INTELLIGENT in your evaluation:
    - Recognize that similar technologies (e.g., React experience can be relevant for Angular positions) should be considered
    - Consider the job level when evaluating experience (be more lenient for junior positions, stricter for senior positions)
    - Look for transferable skills and related experience
    - Consider the candidate's potential to learn rather than just current skills
    - Only count skills that are explicitly mentioned in the resume, not inferred ones
    - Require concrete evidence of experience with technologies mentioned in job description
    - Be skeptical of vague or generic project descriptions
    - Don't give benefit of the doubt for missing information
    - Penalize significantly for missing core technical skills
    - Focus on commonly known and understood technologies (avoid obscure tools like Gulp, Grunt, etc.)
    
    Generate the following scores:
    - match_score (0-100): Overall alignment between the resume and job description
    - skill_match_score (0-100): Based on overlap between technical skills required and those in the resume
    - experience_match_score (0-100): Based on both job experience and relevant projects
    
    Provide:
    - A few recruiter-style comments (short, relevant, and evidence-based)
    - A list of required skills that are missing or not strongly evident in the resume
    - A list of areas where the candidate is clearly overqualified for the job
    
    Your response should be a JSON object with the following structure:
    {
      "match_score": (number between 0-100),
      "skill_match_score": (number between 0-100),
      "experience_match_score": (number between 0-100),
      "comments": [
        "Comment 1",
        "Comment 2",
        "Comment 3"
      ],
      "missing_skills": ["Skill 1", "Skill 2"],
      "overqualified_in": ["Area 1", "Area 2"]
    }
    
    Notes:
    1. Consider Experience and Projects together when evaluating experience relevance and depth.
    2. Be specific and factual in your comments and evaluations.
    3. Base your evaluation only on the information provided in the resume and job description.
    4. Be honest but fair in your assessment - this is for screening candidates.
    5. Focus on commonly known and understood technologies (e.g., JavaScript, Python, React, Node.js, etc.)
    6. Avoid obscure tools like Gulp, Grunt, etc. unless explicitly mentioned.
    7. Provide your response as a valid JSON object only, with no additional text.
    """
    
    # User message
    user_message = f"""
    RESUME DATA:
    {json.dumps(resume_data, indent=2)}
    
    JOB DESCRIPTION DATA:
    {json.dumps(job_data, indent=2)}
    
    Please evaluate the match between this resume and job description.
    
    Consider the following when evaluating:
    1. Job Level: {job_data.get('experience_required', {}).get('level', 'not specified')}
    2. For similar technologies (e.g., React vs Angular, Python vs Java), give partial credit
    3. For junior positions, be more lenient with experience requirements
    4. For senior positions, be stricter with technical depth requirements
    5. Look for transferable skills and related experience that could compensate for direct skill gaps
    6. Focus on commonly known and understood technologies (e.g., JavaScript, Python, React, Node.js, etc.)
    7. Avoid obscure tools like Gulp, Grunt, etc. unless explicitly mentioned.
    """
    
    # Prepare request
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message}
        ],
        "model": MODEL_NAME,
        "temperature": TEMPERATURE
    }
    
    # Make API request with retry logic
    max_retries = 5
    base_delay = 2
    
    for attempt in range(max_retries):
        try:
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                break
                
            if response.status_code == 429 or "quota" in response.text.lower():
                print(f"  API key quota exceeded. Trying next API key...")
                api_key = cycle_api_key()
                headers["Authorization"] = f"Bearer {api_key}"
                continue
                
            response.raise_for_status()
            
        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:
                raise Exception(f"Error in Groq API request after {max_retries} attempts: {str(e)}")
            
            delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
            print(f"  Request failed. Retrying in {delay:.2f} seconds...")
            time.sleep(delay)
    
    # Parse response
    try:
        result = response.json()
        content = result["choices"][0]["message"]["content"]
        
        try:
            match_result = json.loads(content)
            return match_result
        except json.JSONDecodeError:
            json_match = re.search(r'```(?:json)?\s*({.*?})\s*```', content, re.DOTALL)
            if json_match:
                match_result = json.loads(json_match.group(1))
                return match_result
            else:
                raise Exception(f"Could not parse JSON from LLM response. Content: {content[:500]}...")
        
    except Exception as e:
        print(f"  Error processing LLM response: {str(e)}")
        raise

def match_resume_to_job(resume_data: Dict[str, Any], job_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main function to match resume to job description
    
    Args:
        resume_data: Structured resume data
        job_data: Structured job description data
        
    Returns:
        Matching evaluation result
    """
    return compare_resume_with_job(resume_data, job_data)

# ============================================================
# BATCH PROCESSING LOGIC
# ============================================================

def load_json_files(folder_path):
    """Load all JSON files from a folder"""
    json_files = []
    folder = Path(folder_path)
    
    if not folder.exists():
        print(f"Error: Folder '{folder_path}' does not exist")
        return []
    
    for file_path in folder.glob("*.json"):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                json_files.append({
                    'filename': file_path.name,
                    'path': str(file_path),
                    'data': data
                })
        except Exception as e:
            print(f"Error loading {file_path.name}: {e}")
    
    return json_files

def create_training_block(block_number, resume_data, job_data, result_data):
    """Create a single training block in the required format"""
    
    instruction = "Evaluate how well the resume matches the job description and generate a scoring JSON with match score, skill match score, experience match score, comments, missing skills, and overqualified in."
    
    # IMPORTANT: data_block MUST be the first field
    training_block = {
        "data_block": block_number,  # Block number: 1, 2, 3, etc.
        "instruction": instruction,
        "input": {
            "resume": resume_data,
            "job_description": job_data
        },
        "output": result_data
    }
    
    print(f"  Created block {block_number}")  # Debug: confirm block number is added
    
    return training_block

def batch_match_resumes_to_jobs(resume_folder, job_folder, output_file="training_dataset.json", limit_resumes=None, limit_jobs=None):
    """
    Match all resumes to all job descriptions and create training dataset
    
    Args:
        resume_folder: Folder containing resume JSON files
        job_folder: Folder containing job description JSON files
        output_file: Output file for the training dataset
        limit_resumes: Limit number of resumes to process
        limit_jobs: Limit number of jobs to process
    """
    
    print("="*60)
    print("Batch Resume-Job Matching")
    print("="*60)
    
    # Load all resumes
    print(f"\nLoading resumes from: {resume_folder}")
    resumes = load_json_files(resume_folder)
    
    # Apply limit if specified
    if limit_resumes:
        resumes = resumes[:limit_resumes]
        print(f"Limited to {len(resumes)} resumes")
    else:
        print(f"Loaded {len(resumes)} resumes")
    
    # Load all job descriptions
    print(f"\nLoading job descriptions from: {job_folder}")
    jobs = load_json_files(job_folder)
    
    # Apply limit if specified
    if limit_jobs:
        jobs = jobs[:limit_jobs]
        print(f"Limited to {len(jobs)} job descriptions")
    else:
        print(f"Loaded {len(jobs)} job descriptions")
    
    if len(resumes) == 0 or len(jobs) == 0:
        print("\nError: No resumes or job descriptions found!")
        return
    
    # Calculate total combinations
    total_combinations = len(resumes) * len(jobs)
    print(f"\nTotal combinations to process: {total_combinations}")
    print(f"({len(resumes)} resumes × {len(jobs)} jobs)\n")
    
    # Create training dataset
    training_data = []
    block_number = 1
    processed = 0
    
    for resume_idx, resume_file in enumerate(resumes):
        resume_data = resume_file['data']
        resume_name = resume_file['filename']
        
        for job_idx, job_file in enumerate(jobs):
            job_data = job_file['data']
            job_name = job_file['filename']
            
            processed += 1
            print(f"Processing {processed}/{total_combinations}: {resume_name} × {job_name}")
            
            try:
                # Use Groq LLM for matching
                result = match_resume_to_job(resume_data, job_data)
                
                # Create training block
                training_block = create_training_block(
                    block_number=block_number,
                    resume_data=resume_data,
                    job_data=job_data,
                    result_data=result
                )
                
                training_data.append(training_block)
                block_number += 1
                
                # Save periodically (every 100 blocks)
                if block_number % 100 == 0:
                    print(f"  Saving checkpoint at block {block_number}...")
                    save_training_data(training_data, f"checkpoint_{output_file}")
                
                # Small delay to avoid rate limiting
                time.sleep(0.5)
                
            except Exception as e:
                print(f"  Error processing combination: {e}")
                continue
    
    # Save final dataset
    print(f"\n{'='*60}")
    print(f"Saving final training dataset...")
    save_training_data(training_data, output_file)
    
    print(f"\n✓ Complete!")
    print(f"  Total training blocks: {len(training_data)}")
    print(f"  Output file: {output_file}")
    print(f"{'='*60}")

def save_training_data(training_data, output_file):
    """Save training data to JSON file as an array of blocks"""
    try:
        # Ensure training_data is a list
        if not isinstance(training_data, list):
            training_data = [training_data]
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(training_data, f, indent=2, ensure_ascii=False)
        print(f"  ✓ Saved {len(training_data)} blocks to {output_file}")
    except Exception as e:
        print(f"  Error saving file: {e}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Batch match resumes to job descriptions")
    parser.add_argument("--resumes", 
                       default="cv_dataset_json",
                       help="Folder containing resume JSON files")
    parser.add_argument("--jobs",
                       default="job_descriptions_json",
                       help="Folder containing job description JSON files")
    parser.add_argument("-o", "--output",
                       default="training_dataset.json",
                       help="Output training dataset file")
    parser.add_argument("--limit-resumes",
                       type=int,
                       help="Limit number of resumes to process (for testing)")
    parser.add_argument("--limit-jobs",
                       type=int,
                       help="Limit number of jobs to process (for testing)")
    
    args = parser.parse_args()
    
    # Check if API keys are set
    try:
        get_current_api_key()
    except ValueError as e:
        print(f"Error: {e}")
        print("\nPlease edit this file and add your Groq API keys at the top:")
        print("GROQ_API_KEYS = ['your-api-key-here']")
        return
    
    # Check if folders exist
    if not os.path.exists(args.resumes):
        print(f"Error: Resume folder '{args.resumes}' not found!")
        print("Please specify the correct folder using --resumes")
        return
    
    if not os.path.exists(args.jobs):
        print(f"Error: Job folder '{args.jobs}' not found!")
        print("Please specify the correct folder using --jobs")
        return
    
    # Run batch matching
    batch_match_resumes_to_jobs(args.resumes, args.jobs, args.output, args.limit_resumes, args.limit_jobs)

if __name__ == "__main__":
    main()