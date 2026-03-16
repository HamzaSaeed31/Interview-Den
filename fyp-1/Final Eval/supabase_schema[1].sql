CREATE TABLE application_evaluations (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    resume_match JSONB,
    quiz JSONB,
    coding JSONB,
    interview JSONB,
    final_score FLOAT,
    evaluation_status VARCHAR(50),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    resume_id INTEGER REFERENCES resumes(id),
    applied_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    parsed_json JSONB,
    weightage JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    quiz_data JSONB,
    question_count INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    original_file_url TEXT,
    parsed_json JSONB,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) CHECK (role IN ('candidate', 'company')),
    full_name TEXT,
    company_name TEXT,
    profile_metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
