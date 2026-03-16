import pandas as pd
import json
import os
import datetime
import re

def extract_email(text):
    """Extract email from text"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(email_pattern, text)
    return match.group(0) if match else "not_specified@example.com"

def extract_phone(text):
    """Extract phone number from text"""
    phone_patterns = [
        r'\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}',
        r'\d{10,}',
        r'\(\d{3}\)\s*\d{3}[-.\s]?\d{4}'
    ]
    for pattern in phone_patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0)
    return "Not specified"

def extract_name(text):
    """Extract name from first few lines"""
    lines = text.split('\n')
    for line in lines[:5]:
        line = line.strip()
        # Name is usually 2-4 words, capitalized, at the beginning
        if line and 2 <= len(line.split()) <= 4 and not '@' in line and not any(char.isdigit() for char in line):
            return line
    return "Not Specified"

def extract_skills(resume_text, category):
    """Extract skills from resume based on category"""
    skills_map = {
        'Frontend Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Vue.js', 'Angular', 'TypeScript', 'Sass', 'LESS', 'Redux', 'Vuex', 'Bootstrap', 'Tailwind'],
        'Backend Developer': ['Python', 'Java', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'MongoDB', 'PostgreSQL', 'MySQL', 'REST API', 'GraphQL'],
        'Python Developer': ['Python', 'Django', 'Flask', 'FastAPI', 'NumPy', 'Pandas', 'Scikit-learn', 'TensorFlow', 'Keras', 'MongoDB', 'PostgreSQL', 'SQLAlchemy'],
        'Data Scientist': ['Python', 'R', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'SQL'],
        'Full Stack Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express.js', 'Django', 'Flask', 'MongoDB', 'PostgreSQL', 'MySQL', 'Git'],
        'Mobile App Developer (iOS/Android)': ['Swift', 'Objective-C', 'Kotlin', 'Java', 'React Native', 'Flutter', 'UIKit', 'Android SDK', 'Firebase', 'Xcode'],
        'Machine Learning Engineer': ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras', 'Machine Learning', 'Deep Learning', 'Neural Networks', 'Computer Vision', 'NLP'],
        'Cloud Engineer': ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'CloudFormation', 'Jenkins', 'CI/CD', 'Linux']
    }
    
    skills = []
    category_skills = skills_map.get(category, [])
    
    for skill in category_skills:
        if skill.lower() in resume_text.lower():
            skills.append(skill)
    
    return skills if skills else ["General IT Skills"]

def extract_years_of_experience(text):
    """Extract years of experience"""
    patterns = [
        r'(\d+)\+?\s*years?\s*of\s*experience',
        r'experience\s*of\s*(\d+)\+?\s*years?',
        r'over\s*(\d+)\s*years?',
        r'(\d+)\+\s*years?'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1))
    
    return 2  # Default

def extract_education(text):
    """Extract education information"""
    degrees = ['Bachelor', 'Master', 'PhD', 'B.Tech', 'M.Tech', 'B.S', 'M.S', 'MBA', 'B.E', 'M.E']
    education = []
    
    for degree in degrees:
        if degree.lower() in text.lower():
            education.append({
                "Degree": degree,
                "Institution": "Not Specified",
                "Year": "Not Specified"
            })
            break
    
    if not education:
        education.append({
            "Degree": "Not Specified",
            "Institution": "Not Specified",
            "Year": "Not Specified"
        })
    
    return education

def convert_resume_to_json(resume_text, category):
    """Convert resume text to structured JSON"""
    
    # Extract information
    name = extract_name(resume_text)
    email = extract_email(resume_text)
    phone = extract_phone(resume_text)
    skills = extract_skills(resume_text, category)
    years = extract_years_of_experience(resume_text)
    education = extract_education(resume_text)
    
    # Get summary (first 200 characters)
    summary = resume_text[:200].strip() + "..." if len(resume_text) > 200 else resume_text.strip()
    
    # Create structured data
    structured_data = {
        "Name": name,
        "Contact": {
            "Email": email,
            "Phone": phone,
            "Location": "Not specified"
        },
        "Summary": summary,
        "Experience": {
            "Total Years": years,
            "Details": [
                {
                    "Role": category,
                    "Company": "Various",
                    "Duration": f"{years}+ years",
                    "Responsibilities": ["Extracted from resume"]
                }
            ]
        },
        "Skills": skills,
        "Education": education,
        "Projects": [],
        "Certifications": [],
        "is_fraudulent": False,
        "fraud_type": None,
        "red_flags": []
    }
    
    return structured_data

def process_excel_to_json(excel_file, output_folder="cv_dataset_json"):
    """Process Excel file and convert each resume to JSON"""
    
    # Create output folder
    os.makedirs(output_folder, exist_ok=True)
    
    # Read Excel file
    print(f"Reading Excel file: {excel_file}")
    df = pd.read_excel(excel_file)
    
    # Verify columns
    if 'Category' not in df.columns or 'Resume' not in df.columns:
        print("Error: Excel file must have 'Category' and 'Resume' columns")
        return
    
    print(f"Found {len(df)} resumes to process\n")
    
    # Process each resume
    successful = 0
    failed = 0
    
    for idx, row in df.iterrows():
        try:
            category = row['Category']
            resume_text = str(row['Resume'])
            
            print(f"Processing resume {idx + 1}/{len(df)} - Category: {category}")
            
            # Convert resume to JSON
            structured_data = convert_resume_to_json(resume_text, category)
            
            # Generate filename
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            category_safe = category.replace('/', '_').replace(' ', '_')
            filename = f"{category_safe}_{idx}_{timestamp}.json"
            filepath = os.path.join(output_folder, filename)
            
            # Save JSON
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(structured_data, f, indent=2, ensure_ascii=False)
            
            print(f"  ✓ Saved: {filename}\n")
            successful += 1
            
        except Exception as e:
            print(f"  ✗ Failed to process resume {idx + 1}: {str(e)}\n")
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
    
    parser = argparse.ArgumentParser(description="Convert CV Dataset Excel to JSON files (No API Required)")
    parser.add_argument("-i", "--input", 
                       default="CV Dataset.xlsx",
                       help="Input Excel file path (default: CV Dataset.xlsx)")
    parser.add_argument("-o", "--output",
                       default="cv_dataset_json",
                       help="Output folder for JSON files (default: cv_dataset_json)")
    
    args = parser.parse_args()
    
    # Process Excel file
    process_excel_to_json(args.input, args.output)

if __name__ == "__main__":
    main()