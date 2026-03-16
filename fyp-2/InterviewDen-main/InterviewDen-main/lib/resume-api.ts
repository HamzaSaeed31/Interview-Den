// Resume Screening API Utility Functions
// API Base URL - Update this to your production URL when deploying
const API_BASE_URL = process.env.NEXT_PUBLIC_RESUME_API_URL || 'http://127.0.0.1:8000';

export interface ParsedResume {
  Name: string;
  Contact: {
    Email: string;
    Phone: string;
    LinkedIn?: string;
    GitHub?: string;
    Location?: string;
  };
  Summary?: string;
  Experience: {
    "Total Years": number;
    Positions: Array<{
      Title: string;
      Company: string;
      Location?: string;
      Duration: string;
      Description?: string;
    }>;
  };
  Education: Array<{
    Degree: string;
    Institution: string;
    Location?: string;
    "Graduation Year"?: string;
    GPA?: string;
  }>;
  Skills: string[];
  Projects?: Array<{
    Name: string;
    Description: string;
    Duration?: string;
  }>;
  Certifications?: string[];
  is_fraudulent: boolean;
  fraud_type?: string;
  red_flags?: string[];
}

export interface ParsedJob {
  job_title: string;
  role_description: string;
  experience_required: {
    years_of_experience: string;
    level: string;
  };
  skills_required: {
    technical_skills: string[];
    soft_skills: string[];
  };
  preferred_skills?: string[];
  job_responsibilities: string[];
}

export interface MatchResult {
  match_score: number;
  skill_match_score: number;
  experience_match_score: number;
  comments: string[];
  missing_skills: string[];
  overqualified_in: string[];
  pass_fail: {
    status: "PASS" | "FAIL";
    failed_criteria: string[];
    feedback_message: string;
  };
}

/**
 * Parse a resume PDF file
 * @param resumeFile - PDF file from file input
 * @param jobFile - Optional TXT file with job description
 * @returns Parsed resume data
 */
export async function parseResume(
  resumeFile: File,
  jobFile?: File | null
): Promise<ParsedResume> {
  const formData = new FormData();
  formData.append('file', resumeFile);
  
  if (jobFile) {
    formData.append('job_file', jobFile);
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/parse/resume`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
}

/**
 * Parse a job description text file
 * @param jobFile - TXT file with job description
 * @returns Parsed job data
 */
export async function parseJobFile(jobFile: File): Promise<ParsedJob> {
  const formData = new FormData();
  formData.append('file', jobFile);
  
  try {
    const response = await fetch(`${API_BASE_URL}/parse/job`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error parsing job:', error);
    throw error;
  }
}

/**
 * Parse a job description from text string
 * Creates a temporary text file and sends to API
 * @param jobText - Job description as string
 * @returns Parsed job data
 */
export async function parseJobText(jobText: string): Promise<ParsedJob> {
  // Create a text file blob from the string
  const blob = new Blob([jobText], { type: 'text/plain' });
  const file = new File([blob], 'job_description.txt', { type: 'text/plain' });
  
  return parseJobFile(file);
}

/**
 * Match a parsed resume with a parsed job description
 * @param resumeData - Parsed resume object from parseResume
 * @param jobData - Parsed job object from parseJobFile
 * @returns Match result with scores and analysis
 */
export async function matchResumeWithJob(
  resumeData: ParsedResume,
  jobData: ParsedJob
): Promise<MatchResult> {
  const formData = new FormData();
  
  // Convert JSON objects to Blob files
  const resumeBlob = new Blob([JSON.stringify(resumeData)], {
    type: 'application/json',
  });
  const jobBlob = new Blob([JSON.stringify(jobData)], {
    type: 'application/json',
  });
  
  formData.append('resume_json', resumeBlob, 'resume.json');
  formData.append('job_json', jobBlob, 'job.json');
  
  try {
    const response = await fetch(`${API_BASE_URL}/match`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error matching resume with job:', error);
    throw error;
  }
}

/**
 * Complete workflow: Parse resume, parse job, and match them
 * @param resumeFile - PDF resume file
 * @param jobText - Job description text
 * @returns Match result
 */
export async function completeResumeScreening(
  resumeFile: File,
  jobText: string
): Promise<{
  resumeData: ParsedResume;
  jobData: ParsedJob;
  matchResult: MatchResult;
}> {
  try {
    // Step 1: Parse resume
    const resumeData = await parseResume(resumeFile);
    
    // Step 2: Parse job description
    const jobData = await parseJobText(jobText);
    
    // Step 3: Match resume with job
    const matchResult = await matchResumeWithJob(resumeData, jobData);
    
    return { resumeData, jobData, matchResult };
  } catch (error) {
    console.error('Error in complete resume screening:', error);
    throw error;
  }
}

/**
 * Helper function to convert job database fields to a text description
 * for parsing by the API
 * @param job - Job object from database
 * @returns Formatted job description text
 */
export function formatJobForParsing(job: {
  title?: string;
  description?: string;
  requirements?: string[];
  type?: string;
  experience?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  benefits?: string[];
  custom_fields?: any;
}): string {
  const parts: string[] = [];
  
  if (job.title) {
    parts.push(`Job Title: ${job.title}\n`);
  }
  
  if (job.description) {
    parts.push(`Description:\n${job.description}\n`);
  }
  
  if (job.requirements && job.requirements.length > 0) {
    parts.push(`\nRequirements:\n${job.requirements.map(r => `- ${r}`).join('\n')}`);
  }
  
  if (job.type) {
    parts.push(`\nJob Type: ${job.type}`);
  }
  
  if (job.experience) {
    parts.push(`Experience Level: ${job.experience}`);
  }
  
  if (job.location) {
    parts.push(`Location: ${job.location}`);
  }
  
  if (job.salary_min && job.salary_max) {
    const currency = job.currency || 'USD';
    parts.push(`Salary Range: ${currency} ${job.salary_min} - ${job.salary_max}`);
  }
  
  if (job.benefits && job.benefits.length > 0) {
    parts.push(`\nBenefits:\n${job.benefits.map(b => `- ${b}`).join('\n')}`);
  }
  
  return parts.join('\n');
}

