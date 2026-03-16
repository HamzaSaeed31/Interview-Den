#!/usr/bin/env python3
import os
import json
import uuid
import requests
import re
from typing import Dict, List, Any
from config import GROQ_API_KEY, MODEL_NAME, TEMPERATURE, QUIZ_DATA_DIR, DEFAULT_NUM_QUESTIONS

class JobTestGenerator:
    def __init__(self):
        if not os.path.exists(QUIZ_DATA_DIR):
            os.makedirs(QUIZ_DATA_DIR)

    def generate_batch_questions(self, job_title: str, skills_list: List[str], responsibilities: List[str], experience_level: str, num_questions: int) -> List[Dict[str, Any]]:
        skills_str = ", ".join(skills_list)
        responsibilities_str = "; ".join(responsibilities)

        prompt = f"""
Job Title: {job_title}
Required Skills: {skills_str}
Responsibilities: {responsibilities_str}
Experience Level: {experience_level}

Generate {num_questions} unique multiple-choice questions (MCQs) for a technical screening quiz.

Each question must:
- Be based on the provided skills or responsibilities
- Have four options: A, B, C, D
- Clearly indicate the correct answer
- Be formatted like this:

Q: <question text>
A. <option A>
B. <option B>
C. <option C>
D. <option D>
Answer: <A/B/C/D>

Repeat this format for all {num_questions} questions. Do not include any explanations.
""".strip()

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {GROQ_API_KEY}"
        }
        data = {
            "model": MODEL_NAME,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": TEMPERATURE,
            "max_tokens": 4096  # Enough for 10 full questions
        }

        try:
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                data=json.dumps(data)
            )
            response.raise_for_status()
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            print("\n==== RAW BATCH RESPONSE ====")
            print(content[:1000] + "\n...[truncated]...\n")
            print("==== END ====")
            return self._parse_batch_questions(content)
        except Exception as e:
            print(f"❌ Error generating questions: {e}")
            return []

    def _parse_batch_questions(self, content: str) -> List[Dict[str, Any]]:
        pattern = re.compile(
            r"Q:\s*(.*?)\nA\.\s*(.*?)\nB\.\s*(.*?)\nC\.\s*(.*?)\nD\.\s*(.*?)\nAnswer:\s*([A-D])",
            re.DOTALL
        )
        matches = pattern.findall(content)

        if not matches:
            print("❌ No questions could be parsed. Saving raw response for debugging.")
            debug_path = os.path.join(QUIZ_DATA_DIR, "debug_raw_llm_output.txt")
            with open(debug_path, "w", encoding="utf-8") as f:
                f.write(content)
            return []

        seen = set()
        parsed_questions = []
        for match in matches:
            q_text, a, b, c, d, correct = match
            if q_text.strip() in seen:
                continue
            seen.add(q_text.strip())
            parsed_questions.append({
                "question": q_text.strip(),
                "options": [
                    {"letter": "A", "text": a.strip()},
                    {"letter": "B", "text": b.strip()},
                    {"letter": "C", "text": c.strip()},
                    {"letter": "D", "text": d.strip()},
                ],
                "correct_answer": correct.strip()
            })

        return parsed_questions

    def generate_quiz_from_json(self, job_data: Dict[str, Any], num_questions: int = DEFAULT_NUM_QUESTIONS) -> str:
        job_title = job_data.get("job_title", "Unknown Title")
        experience_level = job_data.get("experience_required", {}).get("years_of_experience", "Not specified")
        skills = job_data.get("skills_required", {}).get("technical_skills", [])
        responsibilities = job_data.get("job_responsibilities", [])

        questions = self.generate_batch_questions(job_title, skills, responsibilities, experience_level, num_questions)

        if not questions:
            raise RuntimeError("No questions generated. Please check the job data or LLM response.")

        if len(questions) < num_questions:
            print(f"⚠️ Only {len(questions)} unique questions could be parsed out of {num_questions}.")

        return self._save_quiz(job_data, questions)

    def _save_quiz(self, job_info: Dict[str, Any], questions: List[Dict[str, Any]]) -> str:
        job_title = job_info.get('job_title', 'Unknown Job')
        slug = job_title.lower().replace(' ', '_').replace('-', '_')
        slug = ''.join(c for c in slug if c.isalnum() or c == '_')
        unique_id = str(uuid.uuid4())[:8]
        quiz_id = f"quiz_{slug}_{unique_id}"

        quiz_data = {
            'quiz_id': quiz_id,
            'job_info': job_info,
            'questions': questions,
            'metadata': {
                'question_count': len(questions)
            }
        }

        file_path = os.path.join(QUIZ_DATA_DIR, f"{quiz_id}.json")
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(quiz_data, f, indent=2, ensure_ascii=False)
        return quiz_id


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Generate technical quiz from job data")
    parser.add_argument('--json', type=str, required=True, help='Path to job JSON data file')
    parser.add_argument('--questions', type=int, default=DEFAULT_NUM_QUESTIONS, help='Number of questions to generate')
    args = parser.parse_args()

    print("📥 Loading job data...")
    with open(args.json, 'r', encoding='utf-8') as f:
        job_data = json.load(f)

    print("⚙️  Generating quiz...")
    generator = JobTestGenerator()
    try:
        quiz_id = generator.generate_quiz_from_json(job_data, args.questions)
        print(f"✅ Quiz generated with ID: {quiz_id}")
    except Exception as e:
        print(f"❌ Failed to generate quiz: {e}")


if __name__ == "__main__":
    main()
