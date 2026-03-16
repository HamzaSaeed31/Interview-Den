import gradio as gr
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import json
import os
import tempfile

# Import your resume matching logic
# Assuming your code structure, we'll integrate the matching functions
from llama_cpp import Llama
from huggingface_hub import hf_hub_download

# ====================================
# CONFIGURATION
# ====================================
REPO_ID = "Waleed1672/ResumeFYPFineTune-Qwen2.5-3B"  # e.g., "Waleed1672/resume-evaluator-gguf"
GGUF_FILENAME = "Qwen2.5-3B-Instruct.Q4_K_M.gguf"

# Model parameters
N_CTX = 2048
N_THREADS = 4
N_GPU_LAYERS = 0

# Global variable for model
llm = None

# ====================================
# FASTAPI SETUP
# ====================================
app = FastAPI(
    title="Resume Matcher & Evaluator API",
    description="AI-powered resume evaluation and job matching system",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ====================================
# PYDANTIC MODELS
# ====================================
class ResumeEvalRequest(BaseModel):
    resume_text: str
    max_tokens: Optional[int] = 512
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.9

class ResumeMatchRequest(BaseModel):
    resume_data: Dict[str, Any]
    job_data: Dict[str, Any]
    overall_threshold: Optional[int] = 70
    skill_threshold: Optional[int] = 65
    experience_threshold: Optional[int] = 60

class ResumeEvalResponse(BaseModel):
    evaluation: str
    success: bool
    message: str

class ResumeMatchResponse(BaseModel):
    match_score: int
    skill_match_score: int
    experience_match_score: int
    comments: List[str]
    missing_skills: List[str]
    overqualified_in: List[str]
    pass_fail: Dict[str, Any]
    success: bool

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_name: str
    available_endpoints: List[str]

# ====================================
# RESUME MATCHING LOGIC (From your agent)
# ====================================
def compare_resume_with_job_llm(resume_data: Dict[str, Any], job_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compare resume with job using the local GGUF model
    """
    if llm is None:
        raise Exception("Model not loaded")
    
    system_prompt = """You are a fair and intelligent resume evaluation assistant. Your task is to compare a candidate's resume against a job description and provide a structured evaluation of the match.

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
- Focus on commonly known and understood technologies

Generate the following scores:
- match_score (0-100): Overall alignment between the resume and job description
- skill_match_score (0-100): Based on overlap between technical skills required and those in the resume
- experience_match_score (0-100): Based on both job experience and relevant projects

Your response MUST be a valid JSON object with this exact structure:
{
  "match_score": (number between 0-100),
  "skill_match_score": (number between 0-100),
  "experience_match_score": (number between 0-100),
  "comments": ["Comment 1", "Comment 2", "Comment 3"],
  "missing_skills": ["Skill 1", "Skill 2"],
  "overqualified_in": ["Area 1", "Area 2"]
}"""

    user_prompt = f"""RESUME DATA:
{json.dumps(resume_data, indent=2)}

JOB DESCRIPTION DATA:
{json.dumps(job_data, indent=2)}

Please evaluate the match between this resume and job description. Provide your response as a valid JSON object only."""

    full_prompt = f"{system_prompt}\n\n{user_prompt}\n\nJSON Response:"
    
    try:
        output = llm(
            full_prompt,
            max_tokens=1024,
            temperature=0.3,
            top_p=0.9,
            echo=False,
            stop=["</s>", "\n\n\n"],
        )
        
        response_text = output['choices'][0]['text'].strip()
        
        # Try to extract JSON from the response
        import re
        
        # First try direct JSON parsing
        try:
            result = json.loads(response_text)
            return result
        except json.JSONDecodeError:
            # Try to find JSON in markdown code blocks
            json_match = re.search(r'```(?:json)?\s*({.*?})\s*```', response_text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group(1))
                return result
            
            # Try to find JSON pattern in the text
            json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response_text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group(0))
                return result
            
            # If all else fails, return a default structure
            return {
                "match_score": 50,
                "skill_match_score": 50,
                "experience_match_score": 50,
                "comments": ["Unable to parse full evaluation. Please try again."],
                "missing_skills": [],
                "overqualified_in": []
            }
    
    except Exception as e:
        raise Exception(f"Error during evaluation: {str(e)}")

def determine_pass_fail(evaluation: Dict[str, Any], 
                       overall_threshold: int = 70, 
                       skill_threshold: int = 65, 
                       experience_threshold: int = 60,
                       resume_data: Dict[str, Any] = None) -> Dict[str, Any]:
    """Determine if a candidate passes or fails based on evaluation scores"""
    
    # Check for fraudulent resume
    is_fraudulent = False
    fraud_type = None
    red_flags = []
    
    if resume_data:
        is_fraudulent = resume_data.get("is_fraudulent", False)
        if is_fraudulent:
            fraud_type = resume_data.get("fraud_type", None)
            red_flags = resume_data.get("red_flags", [])
    
    overall_score = evaluation.get('match_score', 0)
    skill_score = evaluation.get('skill_match_score', 0)
    experience_score = evaluation.get('experience_match_score', 0)
    
    missing_skills = evaluation.get('missing_skills', [])
    
    failed_criteria = []
    
    if is_fraudulent:
        failed_criteria.append(f"Fraudulent resume detected: {fraud_type}")
        for flag in red_flags:
            failed_criteria.append(f"Red flag: {flag}")
        evaluation['match_score'] = 0
        evaluation['skill_match_score'] = 0
        evaluation['experience_match_score'] = 0
    else:
        if overall_score < overall_threshold:
            failed_criteria.append(f"Overall match score ({overall_score}) below threshold ({overall_threshold})")
        if skill_score < skill_threshold:
            failed_criteria.append(f"Skill match score ({skill_score}) below threshold ({skill_threshold})")
        if experience_score < experience_threshold:
            failed_criteria.append(f"Experience match score ({experience_score}) below threshold ({experience_threshold})")
    
    is_pass = not failed_criteria and not is_fraudulent
    
    # Generate feedback message
    if is_fraudulent:
        message = "Thank you for your application. Our evaluation system has flagged potential inconsistencies in your resume. "
        if red_flags:
            message += "Specifically: " + "; ".join(red_flags[:3]) + ". "
        message += "Please ensure all information is accurate and properly reflects your actual experience."
    elif is_pass:
        message = "Congratulations! Your profile aligns well with the position requirements. "
        if missing_skills:
            message += f"To strengthen your candidacy further, consider developing: {', '.join(missing_skills[:3])}."
    else:
        message = "Thank you for your interest. We've identified areas for improvement: "
        if missing_skills:
            message += f"Key skills to develop: {', '.join(missing_skills[:5])}. "
        message += "We encourage you to continue developing these skills."
    
    pass_fail = {
        "status": "PASS" if is_pass else "FAIL",
        "failed_criteria": failed_criteria,
        "feedback_message": message
    }
    
    evaluation["pass_fail"] = pass_fail
    return evaluation

# ====================================
# MODEL LOADING
# ====================================
def load_model():
    """Download and load the GGUF model"""
    global llm
    
    print("=" * 50)
    print("🚀 Initializing Resume Matcher System...")
    print(f"Repository: {REPO_ID}")
    print(f"GGUF File: {GGUF_FILENAME}")
    print("=" * 50)
    
    try:
        print("\n[1/2] Downloading GGUF model...")
        model_path = hf_hub_download(
            repo_id=REPO_ID,
            filename=GGUF_FILENAME,
            local_dir="./models",
            local_dir_use_symlinks=False
        )
        
        print(f"✓ Model downloaded to: {model_path}")
        
        print("\n[2/2] Loading model into memory...")
        llm = Llama(
            model_path=model_path,
            n_ctx=N_CTX,
            n_threads=N_THREADS,
            n_gpu_layers=N_GPU_LAYERS,
            verbose=False
        )
        
        print("✓ Model loaded successfully!")
        print("=" * 50)
        print("✅ Resume Matcher System Ready!")
        print("=" * 50)
        
        return llm
        
    except Exception as e:
        print(f"✗ Error loading model: {str(e)}")
        raise e

# ====================================
# API ENDPOINTS
# ====================================
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Resume Matcher & Evaluator API",
        "version": "2.0.0",
        "endpoints": {
            "health": "/api/health",
            "evaluate": "/api/evaluate",
            "match": "/api/match",
            "docs": "/api/docs"
        }
    }

@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Check API health"""
    return HealthResponse(
        status="healthy" if llm is not None else "model_not_loaded",
        model_loaded=llm is not None,
        model_name=GGUF_FILENAME,
        available_endpoints=["/api/evaluate", "/api/match", "/api/health"]
    )

@app.post("/api/evaluate", response_model=ResumeEvalResponse, tags=["Evaluation"])
async def evaluate_resume_api(request: ResumeEvalRequest):
    """
    Evaluate a resume text and provide general feedback
    
    **Parameters:**
    - **resume_text**: The full text of the resume
    - **max_tokens**: Maximum length of response
    - **temperature**: Creativity level (0.1-1.0)
    - **top_p**: Diversity of response
    """
    if llm is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if not request.resume_text or request.resume_text.strip() == "":
        raise HTTPException(status_code=400, detail="resume_text cannot be empty")
    
    try:
        prompt = f"""Evaluate the following resume and provide detailed feedback:

Resume:
{request.resume_text}

Evaluation:"""
        
        output = llm(
            prompt,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            top_p=request.top_p,
            echo=False,
            stop=["</s>", "\nResume:", "Human:", "User:"],
        )
        
        evaluation = output['choices'][0]['text'].strip()
        
        if not evaluation:
            return ResumeEvalResponse(
                evaluation="",
                success=False,
                message="Model generated empty response"
            )
        
        return ResumeEvalResponse(
            evaluation=evaluation,
            success=True,
            message="Evaluation completed successfully"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/api/match", response_model=ResumeMatchResponse, tags=["Matching"])
async def match_resume_with_job(request: ResumeMatchRequest):
    """
    Match a structured resume with a job description
    
    **Parameters:**
    - **resume_data**: Structured resume data (JSON)
    - **job_data**: Structured job description data (JSON)
    - **overall_threshold**: Minimum overall match score (default: 70)
    - **skill_threshold**: Minimum skill match score (default: 65)
    - **experience_threshold**: Minimum experience match score (default: 60)
    
    **Returns:**
    - Match scores, comments, missing skills, and pass/fail status
    """
    if llm is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Compare resume with job
        evaluation = compare_resume_with_job_llm(request.resume_data, request.job_data)
        
        # Determine pass/fail
        evaluation = determine_pass_fail(
            evaluation,
            request.overall_threshold,
            request.skill_threshold,
            request.experience_threshold,
            request.resume_data
        )
        
        return ResumeMatchResponse(
            match_score=evaluation.get('match_score', 0),
            skill_match_score=evaluation.get('skill_match_score', 0),
            experience_match_score=evaluation.get('experience_match_score', 0),
            comments=evaluation.get('comments', []),
            missing_skills=evaluation.get('missing_skills', []),
            overqualified_in=evaluation.get('overqualified_in', []),
            pass_fail=evaluation.get('pass_fail', {}),
            success=True
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# ====================================
# GRADIO INTERFACE FUNCTIONS
# ====================================
def evaluate_resume_gradio(resume_text, max_tokens, temperature, top_p):
    """Evaluate resume - Gradio function"""
    if not resume_text or resume_text.strip() == "":
        return "⚠️ Please enter resume text."
    
    if llm is None:
        return "❌ Model not loaded. Please refresh."
    
    try:
        prompt = f"""Evaluate the following resume and provide detailed feedback:

Resume:
{resume_text}

Evaluation:"""
        
        output = llm(
            prompt,
            max_tokens=int(max_tokens),
            temperature=float(temperature),
            top_p=float(top_p),
            echo=False,
            stop=["</s>", "\nResume:", "Human:", "User:"],
        )
        
        response = output['choices'][0]['text'].strip()
        return response if response else "⚠️ Empty response. Try adjusting parameters."
    
    except Exception as e:
        return f"❌ Error: {str(e)}"

def match_resume_job_gradio(resume_json, job_json, overall_threshold, skill_threshold, experience_threshold):
    """Match resume with job - Gradio function"""
    if not resume_json or not job_json:
        return "⚠️ Please provide both resume and job description JSON."
    
    if llm is None:
        return "❌ Model not loaded. Please refresh."
    
    try:
        # Parse JSON inputs
        resume_data = json.loads(resume_json)
        job_data = json.loads(job_json)
        
        # Compare resume with job
        evaluation = compare_resume_with_job_llm(resume_data, job_data)
        
        # Determine pass/fail
        evaluation = determine_pass_fail(
            evaluation,
            int(overall_threshold),
            int(skill_threshold),
            int(experience_threshold),
            resume_data
        )
        
        # Format output
        output = f"""
🎯 MATCH EVALUATION RESULTS
{'='*50}

📊 SCORES:
  • Overall Match: {evaluation['match_score']}/100
  • Skill Match: {evaluation['skill_match_score']}/100
  • Experience Match: {evaluation['experience_match_score']}/100

{'='*50}

{'✅ RESULT: ' + evaluation['pass_fail']['status']}

💬 COMMENTS:
"""
        for comment in evaluation.get('comments', []):
            output += f"  • {comment}\n"
        
        output += "\n❌ MISSING SKILLS:\n"
        for skill in evaluation.get('missing_skills', []):
            output += f"  • {skill}\n"
        
        if evaluation.get('overqualified_in'):
            output += "\n⭐ OVERQUALIFIED IN:\n"
            for area in evaluation['overqualified_in']:
                output += f"  • {area}\n"
        
        output += f"\n📝 FEEDBACK:\n{evaluation['pass_fail']['feedback_message']}"
        
        if evaluation['pass_fail']['failed_criteria']:
            output += "\n\n⚠️ FAILED CRITERIA:\n"
            for criterion in evaluation['pass_fail']['failed_criteria']:
                output += f"  • {criterion}\n"
        
        return output
    
    except json.JSONDecodeError as e:
        return f"❌ Invalid JSON format: {str(e)}"
    except Exception as e:
        return f"❌ Error: {str(e)}"

# Load model on startup
print("\n🚀 Starting Resume Matcher System...")
load_model()

# ====================================
# GRADIO INTERFACE
# ====================================
custom_css = """
.gradio-container { font-family: 'Arial', sans-serif; }
.output-text { font-size: 14px; line-height: 1.6; }
"""

with gr.Blocks(title="Resume Matcher & Evaluator", theme=gr.themes.Soft(), css=custom_css) as demo:
    
    gr.Markdown("""
    # 🎯 AI Resume Matcher & Evaluator
    
    Advanced resume evaluation and job matching system powered by fine-tuned AI.
    
    **🔗 API Access:** [View API Docs](/api/docs) | **📊 Health Check:** [/api/health](/api/health)
    
    ---
    """)
    
    with gr.Tabs():
        # Tab 1: Simple Resume Evaluation
        with gr.Tab("📝 Resume Evaluation"):
            gr.Markdown("### Get instant AI-powered feedback on your resume")
            
            with gr.Row():
                with gr.Column(scale=1):
                    resume_input = gr.Textbox(
                        label="Resume Text",
                        placeholder="Paste your resume here...",
                        lines=15
                    )
                    
                    with gr.Accordion("⚙️ Settings", open=False):
                        eval_max_tokens = gr.Slider(50, 1024, 512, step=50, label="Max Tokens")
                        eval_temperature = gr.Slider(0.1, 1.0, 0.7, step=0.1, label="Temperature")
                        eval_top_p = gr.Slider(0.1, 1.0, 0.9, step=0.05, label="Top P")
                    
                    eval_btn = gr.Button("🚀 Evaluate Resume", variant="primary")
                
                with gr.Column(scale=1):
                    eval_output = gr.Textbox(
                        label="Evaluation Result",
                        lines=15,
                        elem_classes="output-text"
                    )
        
        # Tab 2: Resume-Job Matching
        with gr.Tab("🎯 Resume-Job Matching"):
            gr.Markdown("### Match structured resume data with job requirements")
            
            with gr.Row():
                with gr.Column():
                    resume_json_input = gr.Textbox(
                        label="Resume Data (JSON)",
                        placeholder='{"name": "John Doe", "skills": [...], ...}',
                        lines=12
                    )
                    job_json_input = gr.Textbox(
                        label="Job Description (JSON)",
                        placeholder='{"title": "Software Engineer", "requirements": [...], ...}',
                        lines=12
                    )
                    
                    with gr.Row():
                        match_overall = gr.Slider(0, 100, 70, step=5, label="Overall Threshold")
                        match_skill = gr.Slider(0, 100, 65, step=5, label="Skill Threshold")
                        match_exp = gr.Slider(0, 100, 60, step=5, label="Experience Threshold")
                    
                    match_btn = gr.Button("🎯 Match Resume with Job", variant="primary")
                
                with gr.Column():
                    match_output = gr.Textbox(
                        label="Matching Results",
                        lines=25,
                        elem_classes="output-text"
                    )
    
    gr.Markdown("""
    ---
    ### 📚 API Documentation
    
    **Endpoints:**
    - `POST /api/evaluate` - Evaluate resume text
    - `POST /api/match` - Match resume with job description
    - `GET /api/health` - Check system status
    
    **Example cURL for Matching:**
    ```bash
    curl -X POST "https://YOUR-SPACE-URL/api/match" \\
      -H "Content-Type: application/json" \\
      -d '{
        "resume_data": {...},
        "job_data": {...},
        "overall_threshold": 70
      }'
    ```
    
    **🎓 Final Year Project** | Built with ❤️ using Gradio, FastAPI, and llama.cpp
    """)
    
    # Event handlers
    eval_btn.click(
        fn=evaluate_resume_gradio,
        inputs=[resume_input, eval_max_tokens, eval_temperature, eval_top_p],
        outputs=eval_output
    )
    
    match_btn.click(
        fn=match_resume_job_gradio,
        inputs=[resume_json_input, job_json_input, match_overall, match_skill, match_exp],
        outputs=match_output
    )

# Mount Gradio to FastAPI
app = gr.mount_gradio_app(app, demo, path="/")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)