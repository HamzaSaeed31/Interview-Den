import gradio as gr
from llama_cpp import Llama
from huggingface_hub import hf_hub_download
import os

# ====================================
# CONFIGURATION - UPDATE THESE VALUES
# ====================================
REPO_ID = "Waleed1672/ResumeFYPFineTune-Qwen2.5-3B"  # e.g., "Waleed1672/resume-evaluator-gguf"
GGUF_FILENAME = "Qwen2.5-3B-Instruct.Q4_K_M.gguf"  # e.g., "resume-llama-q4_k_m.gguf"

# Model parameters
N_CTX = 2048  # Context window size
N_THREADS = 4  # Number of CPU threads
N_GPU_LAYERS = 0  # Set to -1 for full GPU support (requires GPU hardware)

# Global variable for model
llm = None

def load_model():
    """Download and load the GGUF model from Hugging Face Hub"""
    global llm
    
    print("=" * 50)
    print("Starting model download and initialization...")
    print(f"Repository: {REPO_ID}")
    print(f"GGUF File: {GGUF_FILENAME}")
    print("=" * 50)
    
    try:
        # Download model from HF Hub
        print("\n[1/2] Downloading GGUF model from Hugging Face Hub...")
        model_path = hf_hub_download(
            repo_id=REPO_ID,
            filename=GGUF_FILENAME,
            local_dir="./models",
            local_dir_use_symlinks=False
        )
        
        print(f"✓ Model downloaded to: {model_path}")
        
        # Load model with llama.cpp
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
        print("Ready to evaluate resumes!")
        print("=" * 50)
        
        return llm
        
    except Exception as e:
        print(f"✗ Error loading model: {str(e)}")
        raise e

def evaluate_resume(resume_text, max_tokens, temperature, top_p):
    """Evaluate resume using the GGUF model"""
    
    if not resume_text or resume_text.strip() == "":
        return "⚠️ Please enter resume text to evaluate."
    
    if llm is None:
        return "❌ Error: Model not loaded. Please refresh the page and try again."
    
    try:
        # Create evaluation prompt
        # Customize this prompt based on how your model was fine-tuned
        prompt = f"""Evaluate the following resume and provide detailed feedback:

Resume:
{resume_text}

Evaluation:"""
        
        # Generate response using llama.cpp
        output = llm(
            prompt,
            max_tokens=int(max_tokens),
            temperature=float(temperature),
            top_p=float(top_p),
            echo=False,  # Don't repeat the prompt in output
            stop=["</s>", "\nResume:", "Human:", "User:"],  # Stop sequences
        )
        
        # Extract the generated text
        response = output['choices'][0]['text'].strip()
        
        # If response is empty, provide feedback
        if not response:
            return "⚠️ Model generated empty response. Try adjusting the temperature or prompt."
        
        return response
    
    except Exception as e:
        return f"❌ Error during evaluation: {str(e)}\n\nPlease try again or adjust the parameters."

def clear_inputs():
    """Clear all inputs and outputs"""
    return "", ""

# Load model on startup
print("\n🚀 Initializing Resume Evaluator...")
load_model()

# ====================================
# GRADIO INTERFACE
# ====================================

# Custom CSS for better styling
custom_css = """
.gradio-container {
    font-family: 'Arial', sans-serif;
}
.output-text {
    font-size: 14px;
    line-height: 1.6;
}
"""

# Create Gradio interface
with gr.Blocks(title="AI Resume Evaluator", theme=gr.themes.Soft(), css=custom_css) as demo:
    
    # Header
    gr.Markdown(
        """
        # 📝 AI Resume Evaluator
        
        Get instant, AI-powered feedback on your resume using our fine-tuned language model.
        Simply paste your resume text below and click "Evaluate Resume" to receive detailed analysis.
        
        ---
        """
    )
    
    # Main interface
    with gr.Row():
        # Left column - Input
        with gr.Column(scale=1):
            gr.Markdown("### 📄 Input Resume")
            
            resume_input = gr.Textbox(
                label="Resume Text",
                placeholder="Paste your complete resume here...\n\nInclude:\n• Contact Information\n• Work Experience\n• Education\n• Skills\n• Projects",
                lines=18,
                max_lines=25
            )
            
            # Advanced settings
            with gr.Accordion("⚙️ Advanced Settings", open=False):
                gr.Markdown("*Adjust these parameters to control the AI's response style*")
                
                max_tokens = gr.Slider(
                    minimum=50,
                    maximum=1024,
                    value=512,
                    step=50,
                    label="Max Tokens (Output Length)",
                    info="Higher = longer response"
                )
                
                temperature = gr.Slider(
                    minimum=0.1,
                    maximum=1.0,
                    value=0.7,
                    step=0.1,
                    label="Temperature (Creativity)",
                    info="Lower = more focused, Higher = more creative"
                )
                
                top_p = gr.Slider(
                    minimum=0.1,
                    maximum=1.0,
                    value=0.9,
                    step=0.05,
                    label="Top P (Diversity)",
                    info="Controls response diversity"
                )
            
            # Action buttons
            with gr.Row():
                submit_btn = gr.Button("🚀 Evaluate Resume", variant="primary", size="lg")
                clear_btn = gr.Button("🗑️ Clear", variant="secondary", size="lg")
        
        # Right column - Output
        with gr.Column(scale=1):
            gr.Markdown("### ✨ AI Evaluation")
            
            output = gr.Textbox(
                label="Evaluation Result",
                placeholder="Your resume evaluation will appear here...",
                lines=18,
                max_lines=25,
                elem_classes="output-text"
            )
            
            gr.Markdown(
                """
                **💡 Tips for best results:**
                - Include all relevant sections of your resume
                - Use clear formatting and bullet points
                - Adjust temperature for different feedback styles
                """
            )
    
    # Examples section
    gr.Markdown("---")
    gr.Markdown("## 📋 Example Resumes")
    gr.Markdown("*Click an example to try it out*")
    
    gr.Examples(
        examples=[
            [
                """John Doe
Email: john.doe@email.com | Phone: (555) 123-4567 | LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Results-driven Software Engineer with 3+ years of experience in full-stack development, specializing in Python and JavaScript. Proven track record of building scalable applications and leading cross-functional teams.

EXPERIENCE

Senior Python Developer | Tech Corp | Jan 2021 - Present
• Architected and deployed REST APIs serving 1M+ daily requests using FastAPI
• Led team of 5 developers on cloud migration project, reducing infrastructure costs by 35%
• Implemented CI/CD pipelines reducing deployment time from 2 hours to 15 minutes
• Mentored junior developers and conducted code reviews

Junior Developer | StartupXYZ | Jun 2019 - Dec 2020
• Developed microservices using Django and PostgreSQL
• Built real-time data processing pipeline handling 10K events/second
• Collaborated with product team to deliver features for 50K+ users

TECHNICAL SKILLS
• Languages: Python, JavaScript, SQL, TypeScript
• Frameworks: FastAPI, Django, React, Node.js
• Cloud & Tools: AWS (EC2, S3, Lambda), Docker, Kubernetes, Git
• Databases: PostgreSQL, MongoDB, Redis
• Other: REST APIs, GraphQL, Microservices, Agile/Scrum

EDUCATION
Bachelor of Science in Computer Science
Massachusetts Institute of Technology (MIT) | 2015 - 2019
GPA: 3.8/4.0

PROJECTS
Real-time Chat Application
• Built scalable chat application using WebSockets serving 10K+ concurrent users
• Implemented end-to-end encryption and message persistence
• Tech Stack: Node.js, Socket.io, Redis, MongoDB

ML-Powered Recommendation Engine
• Developed recommendation system increasing user engagement by 40%
• Processed 1M+ data points using Python and scikit-learn
• Deployed using Docker and AWS ECS

CERTIFICATIONS
• AWS Certified Solutions Architect - Associate (2022)
• Professional Scrum Master I (PSM I) (2021)""",
                512,
                0.7,
                0.9
            ],
            [
                """Sarah Johnson
sarah.j@email.com | (555) 987-6543 | Portfolio: sarahjohnson.dev

SUMMARY
Creative Frontend Developer with 2 years of experience building responsive web applications. Passionate about user experience and modern web technologies.

WORK EXPERIENCE

Frontend Developer | WebDesign Co. | Mar 2022 - Present
• Developed responsive websites using React and Tailwind CSS
• Improved page load times by 50% through optimization
• Collaborated with designers to implement pixel-perfect UIs

Intern Developer | Digital Agency | Jun 2021 - Feb 2022
• Assisted in building client websites using HTML, CSS, JavaScript
• Fixed bugs and improved website accessibility

SKILLS
• Frontend: React, Vue.js, HTML5, CSS3, JavaScript
• Styling: Tailwind CSS, Sass, Bootstrap
• Tools: Git, Figma, VS Code
• Basic: Node.js, Express, MongoDB

EDUCATION
B.S. Computer Science | State University | 2017-2021
GPA: 3.5/4.0

PROJECTS
• Portfolio Website: Personal site showcasing projects (React, Next.js)
• E-commerce Store: Full-stack shopping site (MERN stack)""",
                512,
                0.7,
                0.9
            ]
        ],
        inputs=[resume_input, max_tokens, temperature, top_p],
        label="Try these examples"
    )
    
    # Footer
    gr.Markdown(
        """
        ---
        
        ### 📚 About This Tool
        This AI Resume Evaluator uses a fine-tuned language model in GGUF format for efficient inference.
        The model analyzes your resume and provides constructive feedback on content, structure, and presentation.
        
        **🎓 Final Year Project** | Built with ❤️ using Gradio and llama.cpp
        
        *Note: This tool provides AI-generated suggestions. Always review with human judgment.*
        """
    )
    
    # Event handlers
    submit_btn.click(
        fn=evaluate_resume,
        inputs=[resume_input, max_tokens, temperature, top_p],
        outputs=output,
        api_name="evaluate"
    )
    
    clear_btn.click(
        fn=clear_inputs,
        inputs=None,
        outputs=[resume_input, output]
    )

# Launch the app
if __name__ == "__main__":
    demo.launch(
        share=False,
        show_error=True
    )