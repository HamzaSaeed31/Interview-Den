import pandas as pd
import json
import os
import datetime
import re

def determine_job_level(text):
    """Determine job level from text"""
    text_lower = text.lower()
    
    if any(word in text_lower for word in ['intern', 'internship']):
        return "Internship"
    if any(word in text_lower for word in ['fresher', 'entry', '0-1', '0-2']):
        return "Junior"
    if any(word in text_lower for word in ['junior', 'jr', '1-2', '1-3', '2-3']):
        return "Junior"
    if any(word in text_lower for word in ['mid', 'intermediate', '3-5', '4-6']):
        return "Mid-level"
    if any(word in text_lower for word in ['senior', 'sr', 'lead', '5+', '6+', '7+']):
        return "Senior"
    if any(word in text_lower for word in ['expert', 'principal', 'architect', '10+']):
        return "Expert"
    
    return "Not specified"

def split_skills(skill_text):
    """Split skills that are separated by semicolons or commas"""
    if not skill_text or pd.isna(skill_text) or str(skill_text).strip() == '':
        return []
    
    skill_text = str(skill_text)
    
    # Split by semicolon first
    if ';' in skill_text:
        skills = [s.strip() for s in skill_text.split(';')]
    # Then try comma
    elif ',' in skill_text:
        skills = [s.strip() for s in skill_text.split(',')]
    # Otherwise return as single skill
    else:
        skills = [skill_text.strip()]
    
    return [s for s in skills if s]

def split_responsibilities(resp_text):
    """Split responsibilities into a list"""
    if not resp_text or pd.isna(resp_text) or str(resp_text).strip() == '':
        return []
    
    resp_text = str(resp_text)
    
    # Try splitting by common delimiters
    if '|' in resp_text:
        responsibilities = [r.strip() for r in resp_text.split('|')]
    elif ';' in resp_text:
        responsibilities = [r.strip() for r in resp_text.split(';')]
    elif '\n' in resp_text:
        responsibilities = [r.strip() for r in resp_text.split('\n')]
    # If it's a long text, try to split by sentences
    elif len(resp_text) > 100:
        responsibilities = [s.strip() for s in resp_text.split('.') if s.strip()]
    else:
        responsibilities = [resp_text.strip()]
    
    return [r for r in responsibilities if r and len(r) > 5]

def split_keywords(keywords_text):
    """Split keywords into a list"""
    if not keywords_text or pd.isna(keywords_text) or str(keywords_text).strip() == '':
        return []
    
    keywords_text = str(keywords_text)
    
    # Split by common delimiters
    if ',' in keywords_text:
        keywords = [k.strip() for k in keywords_text.split(',')]
    elif ';' in keywords_text:
        keywords = [k.strip() for k in keywords_text.split(';')]
    elif '|' in keywords_text:
        keywords = [k.strip() for k in keywords_text.split('|')]
    else:
        keywords = [keywords_text.strip()]
    
    return [k for k in keywords if k]

def categorize_skills(skills_list):
    """Categorize skills into technical and soft skills"""
    technical_keywords = [
        'python', 'java', 'javascript', 'c#', 'c++', 'ruby', 'php', 'swift', 'kotlin',
        'html', 'css', 'sql', 'react', 'angular', 'vue', 'node', 'django', 'flask',
        'spring', 'asp.net', '.net', 'framework', 'api', 'rest', 'graphql',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'jenkins',
        'mongodb', 'postgresql', 'mysql', 'redis', 'firebase',
        'tensorflow', 'pytorch', 'scikit', 'pandas', 'numpy',
        'android', 'ios', 'mobile', 'web', 'database', 'server',
        'typescript', 'redux', 'express', 'bootstrap', 'tailwind'
    ]
    
    soft_keywords = [
        'communication', 'teamwork', 'leadership', 'problem solving',
        'analytical', 'critical thinking', 'time management', 'collaboration',
        'adaptability', 'creativity', 'interpersonal'
    ]
    
    technical_skills = []
    soft_skills = []
    
    for skill in skills_list:
        skill_lower = skill.lower()
        
        is_soft = any(keyword in skill_lower for keyword in soft_keywords)
        is_technical = any(keyword in skill_lower for keyword in technical_keywords)
        
        if is_soft:
            soft_skills.append(skill)
        elif is_technical or not is_soft:
            technical_skills.append(skill)
    
    return technical_skills, soft_skills

def parse_complete_row(row_values, column_mapping):
    """
    Parse a complete row with all columns including responsibilities and keywords
    
    Args:
        row_values: Array of values from the row
        column_mapping: Dictionary mapping column indices to their names
    """
    result = {
        "job_title": "Not specified",
        "role_description": "Not specified",
        "experience_required": {
            "years_of_experience": "Not specified",
            "level": "Not specified"
        },
        "skills_required": {
            "technical_skills": [],
            "soft_skills": []
        },
        "preferred_skills": [],
        "job_responsibilities": [],
        "keywords": []
    }
    
    # Extract data based on column mapping
    for idx, value in enumerate(row_values):
        if pd.isna(value) or str(value).strip() == '':
            continue
        
        col_name = column_mapping.get(idx, f"unknown_{idx}").lower()
        value_str = str(value).strip()
        
        # Job Title
        if 'job title' in col_name or idx == 0:
            result["job_title"] = value_str
            result["role_description"] = f"{value_str} position"
        
        # Experience Level
        elif 'experience level' in col_name or 'level' in col_name:
            result["experience_required"]["level"] = value_str
        
        # Years of Experience
        elif 'years' in col_name or 'experience' in col_name:
            result["experience_required"]["years_of_experience"] = value_str
        
        # Skills
        elif 'skill' in col_name:
            all_skills = split_skills(value_str)
            technical, soft = categorize_skills(all_skills)
            result["skills_required"]["technical_skills"] = technical
            result["skills_required"]["soft_skills"] = soft
        
        # Responsibilities
        elif 'responsibilit' in col_name or 'duties' in col_name or 'role' in col_name:
            responsibilities = split_responsibilities(value_str)
            result["job_responsibilities"] = responsibilities
        
        # Keywords
        elif 'keyword' in col_name or 'tag' in col_name:
            keywords = split_keywords(value_str)
            result["keywords"] = keywords
    
    # Auto-detect level if not specified
    if result["experience_required"]["level"] == "Not specified":
        combined_text = " ".join([str(v) for v in row_values if pd.notna(v)])
        result["experience_required"]["level"] = determine_job_level(combined_text)
    
    # Create better role description
    if result["skills_required"]["technical_skills"]:
        top_skills = ", ".join(result["skills_required"]["technical_skills"][:3])
        result["role_description"] = f"{result['job_title']} position requiring expertise in {top_skills}"
    
    return result

def detect_column_structure(df):
    """Detect what each column represents"""
    print("\nDetecting column structure...")
    print("="*60)
    
    column_mapping = {}
    
    # Show first row to help identify columns
    print("First row sample:")
    for idx, val in enumerate(df.iloc[0].tolist()):
        val_str = str(val)[:60]
        print(f"  Column {idx}: {val_str}")
    
    print("\n" + "="*60)
    print("Auto-detecting column names based on content...")
    
    # Common patterns to detect column types
    for idx in range(len(df.columns)):
        sample_values = df[idx].dropna().head(5).tolist()
        sample_text = " ".join([str(v).lower() for v in sample_values])
        
        # Detect based on content patterns
        if idx == 0:
            column_mapping[idx] = "Job Title"
        elif idx == 1:
            # Check if it looks like experience level
            if any(term in sample_text for term in ['junior', 'senior', 'fresher', 'mid', 'intern']):
                column_mapping[idx] = "Experience Level"
            else:
                column_mapping[idx] = "Column_1"
        elif idx == 2:
            # Check if it looks like years
            if any(char.isdigit() for char in sample_text) and ('-' in sample_text or '+' in sample_text):
                column_mapping[idx] = "Years"
            else:
                column_mapping[idx] = "Column_2"
        elif idx == 3:
            # Usually skills
            if ';' in sample_text or ',' in sample_text:
                column_mapping[idx] = "Skills"
            else:
                column_mapping[idx] = "Column_3"
        elif idx == 4:
            column_mapping[idx] = "Responsibilities"
        elif idx == 5:
            column_mapping[idx] = "Keywords"
        else:
            column_mapping[idx] = f"Extra_Column_{idx}"
    
    print("\nDetected column structure:")
    for idx, name in column_mapping.items():
        print(f"  Column {idx}: {name}")
    
    print("\n" + "="*60)
    user_input = input("Is this correct? (y/n, or press Enter to accept): ").strip().lower()
    
    if user_input == 'n':
        print("\nPlease specify column names manually:")
        print("Common columns: Job Title, Experience Level, Years, Skills, Responsibilities, Keywords")
        
        for idx in range(len(df.columns)):
            current = column_mapping.get(idx, f"Column_{idx}")
            new_name = input(f"  Column {idx} (current: {current}): ").strip()
            if new_name:
                column_mapping[idx] = new_name
    
    return column_mapping

def process_excel_to_json(excel_file, output_folder="job_descriptions_json", auto_detect=True):
    """Process Excel file and convert each job description to JSON"""
    
    os.makedirs(output_folder, exist_ok=True)
    
    print(f"Reading Excel file: {excel_file}")
    df = pd.read_excel(excel_file, header=None)
    
    print(f"Found {len(df)} rows")
    print(f"Columns: {len(df.columns)}")
    
    # Detect column structure
    if auto_detect:
        column_mapping = detect_column_structure(df)
    else:
        # Default mapping
        column_mapping = {
            0: "Job Title",
            1: "Experience Level",
            2: "Years",
            3: "Skills",
            4: "Responsibilities",
            5: "Keywords"
        }
    
    print(f"\nProcessing {len(df)} job descriptions...\n")
    
    successful = 0
    failed = 0
    
    for idx, row in df.iterrows():
        try:
            print(f"Processing job {idx + 1}/{len(df)}")
            
            # Parse the complete row with all columns
            structured_job = parse_complete_row(row.values, column_mapping)
            
            # Generate filename
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            job_title = structured_job.get('job_title', 'Unknown')
            job_title_safe = re.sub(r'[^\w\s-]', '', job_title).strip().replace(' ', '_')
            
            if len(job_title_safe) > 50:
                job_title_safe = job_title_safe[:50]
            
            filename = f"{job_title_safe}_{idx}.json"
            filepath = os.path.join(output_folder, filename)
            
            # Save JSON
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(structured_job, f, indent=2, ensure_ascii=False)
            
            print(f"  ✓ Saved: {filename}")
            print(f"  Title: {structured_job.get('job_title', 'N/A')}")
            print(f"  Level: {structured_job.get('experience_required', {}).get('level', 'N/A')}")
            print(f"  Skills: {len(structured_job.get('skills_required', {}).get('technical_skills', []))}")
            print(f"  Responsibilities: {len(structured_job.get('job_responsibilities', []))}")
            print(f"  Keywords: {len(structured_job.get('keywords', []))}")
            print()
            
            successful += 1
            
        except Exception as e:
            print(f"  ✗ Failed: {str(e)}\n")
            failed += 1
    
    print(f"{'='*60}")
    print(f"Processing complete!")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    print(f"Output folder: {output_folder}")
    print(f"{'='*60}")

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Convert Complete Job Description Excel to JSON (No API)")
    parser.add_argument("-i", "--input", 
                       default="Complete_Job_Dataset.xlsx",
                       help="Input Excel file path")
    parser.add_argument("-o", "--output",
                       default="job_descriptions_json",
                       help="Output folder for JSON files")
    parser.add_argument("--no-auto-detect",
                       action="store_true",
                       help="Skip auto-detection and use default column mapping")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.input):
        print(f"Error: File '{args.input}' not found!")
        return
    
    process_excel_to_json(args.input, args.output, auto_detect=not args.no_auto_detect)

if __name__ == "__main__":
    main()