// Interview API Integration
// Connects to your Python backend for AI interviews

const API_BASE_URL = process.env.NEXT_PUBLIC_INTERVIEW_API_URL || 'http://127.0.0.1:8000';

/**
 * Interview Session Response
 */
export interface InterviewStartResponse {
  session_id: string;
  message: string;
  is_finished: false;
  final_context: null;
}

export interface InterviewChatResponse {
  session_id: string;
  message: string;
  is_finished: boolean;
  final_context: FinalContext | null;
}

export interface FinalContext {
  timestamp: number;
  job_level: string;
  candidate_name: string;
  job_description: string; // JSON-encoded
  resume_content: string; // JSON-encoded
  transcript: TranscriptEntry[];
}

export interface TranscriptEntry {
  type: 'ai' | 'human' | 'PROTOCOL';
  content: string;
}

/**
 * Interview Evaluation Response
 */
export interface InterviewEvaluation {
  status: string;
  evaluation: {
    overall_score: number;
    strengths: string[];
    weaknesses: string[];
    hiring_recommendation: string;
  };
}

/**
 * Start a new interview session
 * @param jobDescriptionJSON - Parsed job description from /parse/job
 * @param resumeJSON - Parsed resume from /parse/resume
 */
export async function startInterview(
  jobDescriptionJSON: any,
  resumeJSON: any
): Promise<InterviewStartResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/interview/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_description_json: JSON.stringify(jobDescriptionJSON),
        resume_json: JSON.stringify(resumeJSON),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Failed to start interview: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error starting interview:', error);
    throw new Error(error.message || 'Failed to start interview session');
  }
}

/**
 * Send candidate's reply and get next question
 * @param sessionId - Interview session ID
 * @param candidateReply - Candidate's answer to the previous question
 */
export async function sendInterviewChat(
  sessionId: string,
  candidateReply: string
): Promise<InterviewChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/interview/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        candidate_reply: candidateReply,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 404) {
        throw new Error('Interview session not found or has expired');
      }
      throw new Error(errorData.detail || `Failed to process chat: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error in interview chat:', error);
    throw new Error(error.message || 'Failed to send message');
  }
}

/**
 * Grade the completed interview transcript
 * @param finalContext - The final context from interview/chat when is_finished is true
 */
export async function gradeInterview(
  finalContext: FinalContext
): Promise<InterviewEvaluation> {
  try {
    const response = await fetch(`${API_BASE_URL}/grade/transcript`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript_context: finalContext,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 501) {
        throw new Error('Grading feature is not available on the server');
      }
      throw new Error(errorData.detail || `Failed to grade interview: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Error grading interview:', error);
    throw new Error(error.message || 'Failed to grade interview');
  }
}

/**
 * Complete interview workflow helper
 * Starts interview, handles chat loop, and returns grading
 */
export class InterviewSession {
  private sessionId: string | null = null;
  private transcript: TranscriptEntry[] = [];
  private finalContext: FinalContext | null = null;

  async start(jobDescriptionJSON: any, resumeJSON: any): Promise<string> {
    const response = await startInterview(jobDescriptionJSON, resumeJSON);
    this.sessionId = response.session_id;
    this.transcript.push({ type: 'ai', content: response.message });
    return response.message;
  }

  async sendMessage(candidateReply: string): Promise<{ message: string; isFinished: boolean }> {
    if (!this.sessionId) {
      throw new Error('Interview session not started');
    }

    const response = await sendInterviewChat(this.sessionId, candidateReply);
    this.transcript.push({ type: 'human', content: candidateReply });
    this.transcript.push({ type: 'ai', content: response.message });

    if (response.is_finished && response.final_context) {
      this.finalContext = response.final_context;
    }

    return {
      message: response.message,
      isFinished: response.is_finished,
    };
  }

  async getGrading(): Promise<InterviewEvaluation> {
    if (!this.finalContext) {
      throw new Error('Interview not finished yet');
    }
    return await gradeInterview(this.finalContext);
  }

  getTranscript(): TranscriptEntry[] {
    return this.transcript;
  }

  getFinalContext(): FinalContext | null {
    return this.finalContext;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }
}

