---
title: Resume Evaluator
emoji: 📝
colorFrom: blue
colorTo: green
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
license: mit
---

# 📝 AI Resume Evaluator

An intelligent resume evaluation tool powered by a fine-tuned language model in GGUF format. Get instant, detailed feedback on your resume to improve your job applications.

## 🚀 Features

- **Instant Analysis**: Get immediate AI-powered feedback on your resume
- **Detailed Evaluation**: Comprehensive analysis of content, structure, and presentation
- **Efficient Inference**: Uses quantized GGUF model for fast CPU-based inference
- **User-Friendly Interface**: Clean, intuitive Gradio interface
- **Customizable Parameters**: Adjust temperature and output length for different feedback styles

## 🎯 How to Use

1. **Paste Your Resume**: Copy and paste your resume text into the input box
2. **Adjust Settings** (Optional): Modify advanced parameters for customized feedback
   - **Max Tokens**: Control the length of the evaluation (50-1024)
   - **Temperature**: Adjust creativity (0.1 = focused, 1.0 = creative)
   - **Top P**: Control response diversity (0.1-1.0)
3. **Click "Evaluate Resume"**: Get instant AI-generated feedback
4. **Review Results**: Read the detailed analysis and suggestions

## ⚙️ Technical Details

### Model Information
- **Base Model**: Llama 3.2 1B
- **Format**: GGUF (Quantized for efficiency)
- **Quantization**: Q4_K_M (optimal balance of size and quality)
- **Fine-tuned For**: Resume evaluation and professional feedback

### Technology Stack
- **Model Serving**: llama-cpp-python
- **Interface**: Gradio 4.44.0
- **Model Source**: Hugging Face Hub
- **Deployment**: Hugging Face Spaces

## 📊 Model Parameters

| Parameter | Default | Range | Description |
|-----------|---------|-------|-------------|
| Max Tokens | 512 | 50-1024 | Maximum length of generated response |
| Temperature | 0.7 | 0.1-1.0 | Controls randomness (lower = more focused) |
| Top P | 0.9 | 0.1-1.0 | Nucleus sampling threshold |

## 🎓 Use Cases

- **Job Seekers**: Get feedback before applying to positions
- **Career Counselors**: Help clients improve their resumes
- **Students**: Learn what makes a strong resume
- **Recruiters**: Quickly assess resume quality

## 📖 What the AI Evaluates

The model analyzes multiple aspects of your resume:

- ✅ **Content Quality**: Relevance and strength of experience descriptions
- ✅ **Structure**: Organization and formatting
- ✅ **Skills Presentation**: Technical and soft skills coverage
- ✅ **Achievement Metrics**: Quantifiable accomplishments
- ✅ **Clarity**: Clear communication of qualifications
- ✅ **Keyword Usage**: Industry-relevant terminology

## 🔧 Setup for Development

If you want to run this locally or modify it:

```bash
# Clone the repository
git clone https://huggingface.co/spaces/YOUR-USERNAME/resume-evaluator

# Install dependencies
pip install -r requirements.txt

# Update app.py with your model details
# REPO_ID = "your-username/your-model-repo"
# GGUF_FILENAME = "your-model.gguf"

# Run the app
python app.py
```

## 📝 Configuration

Before deploying, update these values in `app.py`:

```python
REPO_ID = "YOUR-USERNAME/YOUR-REPO-NAME"  # Your HuggingFace model repo
GGUF_FILENAME = "your-model.gguf"  # Your GGUF file name
```

## 🎯 Final Year Project

This tool was developed as part of our Final Year Project (FYP) to demonstrate:
- Fine-tuning large language models for specific tasks
- Efficient model deployment using quantization (GGUF format)
- Building user-friendly AI applications with Gradio
- Cloud deployment on Hugging Face Spaces

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Improve the evaluation prompts
- Enhance the UI/UX

## ⚠️ Disclaimer

This tool provides AI-generated suggestions based on patterns learned during training. While helpful, the feedback should be:
- Reviewed with human judgment
- Combined with professional career advice
- Used as one of multiple resources in your job search

AI suggestions may not always be accurate or applicable to your specific situation.

## 📄 License

MIT License - Feel free to use and modify for your needs.

## 🔗 Links

- **Model Repository**: [Link to your model on HF]
- **Project Documentation**: [Link to your project docs]
- **Report Issues**: [Link to issues page]

## 👥 Team

Developed by [Your Names] as part of [University Name] FYP

---

**Made with ❤️ using Gradio and llama.cpp**