<h1 align="center">🎤 Interview Den</h1>

<p align="center">
  <strong>AI-powered mock interview platform with resume screening, adaptive quizzes and avatar-led video interviews</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white"/>
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
</p>

---

## 📖 About

Interview Den is a Final Year Project built at FAST-NUCES that simulates real job interviews using AI. Candidates upload their resume, get matched to jobs, attempt auto-generated technical quizzes, and conduct avatar-led video interviews — all in one platform.

## ✨ Features

- 📄 **Resume Screening** — AI parses and matches resumes to job descriptions
- 🧠 **Adaptive Quizzes** — Groq-powered MCQ generation tailored to the role
- 🎥 **Video Interview Simulation** — Avatar-led interviews with real-time feedback
- 🏢 **Company Portal** — Post jobs, view applicants, manage hiring pipeline
- 👤 **Candidate Dashboard** — Track applications and interview performance
- 🔐 **Auth & Storage** — Supabase handles authentication and data persistence

## 🗂️ Structure

```
fyp-1/   ← proposal, mid-eval and defense materials
fyp-2/   ← full implementation
  ├── FYP_AI_Components-master/   AI/ML backend (Groq, resume matching)
  ├── InterviewDen-main/          Next.js + Supabase web application
  ├── Final-eval/                 Final evaluation submission
  └── Mid-eval/                   Mid-evaluation submission
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend / Auth | Supabase (PostgreSQL + Storage + Auth) |
| AI / LLM | Groq API (LLaMA 3) |
| ML Components | Python, scikit-learn, spaCy |
| Video | WebRTC, AI Avatar |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+, Python 3.10+
- Supabase project and Groq API key

### Web App

```bash
cd fyp-2/InterviewDen-main
npm install
cp .env.example .env.local   # fill in Supabase + Groq keys
npm run dev
```

### AI Components

```bash
cd fyp-2/FYP_AI_Components-master
pip install -r requirements.txt
python main.py
```

> **Note:** API keys have been redacted. Set `GROQ_API_KEY` as an environment variable.
