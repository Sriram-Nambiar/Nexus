import { config } from '../config/env';
import {
  AIAskRequest,
  AIAskResponse,
  AIStudyPlanRequest,
  AIStudyPlanResponse,
} from '../types';
import { AppError, ServiceUnavailableError } from '../middleware/error.middleware';

export interface AIHealthResponse {
  status: string;
  service: string;
  version?: string;
  timestamp: string;
}

export class AIServiceClient {
  private baseUrl: string;
  private timeoutMs: number;
  private apiKey: string;
  private mockFallback: boolean;

  constructor() {
    this.baseUrl = config.AI_SERVICE_URL.replace(/\/$/, '');
    this.timeoutMs = config.AI_SERVICE_TIMEOUT_MS;
    this.apiKey = config.AI_SERVICE_API_KEY;
    this.mockFallback = config.AI_MOCK_FALLBACK;
  }

  /**
   * Health check with Python AI service
   */
  public async checkHealth(): Promise<AIHealthResponse> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/health`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new AppError(`AI service health returned HTTP ${response.status}`, 502);
      }

      const data = (await response.json()) as Partial<AIHealthResponse>;
      return {
        status: data.status || 'ok',
        service: data.service || 'nexus-ai-python',
        version: data.version || '1.0.0',
        timestamp: new Date().toISOString(),
      };
    } catch (err: unknown) {
      if (this.mockFallback) {
        return {
          status: 'ok (mock)',
          service: 'nexus-ai-python (mock mode)',
          version: '1.0.0',
          timestamp: new Date().toISOString(),
        };
      }
      this.handleNetworkError(err);
    }
  }

  /**
   * Forward QA ask requests to Python AI service
   */
  public async ask(payload: AIAskRequest): Promise<AIAskResponse> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/ask`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new AppError(
          `AI service responded with status ${response.status}: ${errorText || response.statusText}`,
          502
        );
      }

      const data = await response.json();
      return this.validateAskResponse(data);
    } catch (err: unknown) {
      if (this.mockFallback) {
        return this.generateMockAskResponse(payload);
      }
      this.handleNetworkError(err);
    }
  }

  /**
   * Forward study plan generation requests to Python AI service
   */
  public async generateStudyPlan(payload: AIStudyPlanRequest): Promise<AIStudyPlanResponse> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/study-plan`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new AppError(
          `AI service responded with status ${response.status}: ${errorText || response.statusText}`,
          502
        );
      }

      const data = await response.json();
      return this.validateStudyPlanResponse(data, payload);
    } catch (err: unknown) {
      if (this.mockFallback) {
        return this.generateMockStudyPlanResponse(payload);
      }
      this.handleNetworkError(err);
    }
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new AppError(`AI service request timed out after ${this.timeoutMs / 1000} seconds`, 504);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  private handleNetworkError(err: unknown): never {
    if (err instanceof AppError) {
      throw err;
    }

    const message = err instanceof Error ? err.message : String(err);

    // Provide friendly non-leaking user messages
    if (message.includes('ECONNREFUSED') || message.includes('Failed to fetch') || message.includes('fetch failed')) {
      throw new ServiceUnavailableError(
        'The NEXUS AI service is currently unreachable. Please check if the Python AI service is running.'
      );
    }

    throw new ServiceUnavailableError('Unable to connect to the AI service at this time.');
  }

  private validateAskResponse(data: unknown): AIAskResponse {
    if (typeof data !== 'object' || data === null || !('answer' in data)) {
      throw new AppError('Invalid response structure received from AI service', 502);
    }
    const res = data as AIAskResponse;
    const sources = Array.isArray(res.sources) ? res.sources : [];
    return {
      answer: String(res.answer),
      sources,
      grounded: res.grounded !== undefined ? Boolean(res.grounded) : sources.length > 0,
      confidence_score: res.confidence_score !== undefined ? Number(res.confidence_score) : (sources.length > 0 ? 0.92 : 0.0),
      suggested_questions: Array.isArray(res.suggested_questions) ? res.suggested_questions : [],
      metadata: typeof res.metadata === 'object' && res.metadata !== null ? res.metadata : {},
    };
  }

  private validateStudyPlanResponse(data: unknown, originalReq: AIStudyPlanRequest): AIStudyPlanResponse {
    if (typeof data !== 'object' || data === null) {
      throw new AppError('Invalid response structure received from AI service', 502);
    }
    const res = data as Partial<AIStudyPlanResponse>;
    const goal = res.goal || originalReq.goal;
    const title = res.title || originalReq.title || `Study Plan for ${goal}`;
    const plan = typeof res.plan === 'object' && res.plan !== null ? res.plan : { schedule: [] };
    const days = Array.isArray(res.days) ? res.days : (Array.isArray((plan as any).days) ? (plan as any).days : []);

    return {
      id: res.id,
      title,
      goal,
      course_ids: res.course_ids || originalReq.course_ids || (originalReq.course_id ? [originalReq.course_id] : []),
      course_names: res.course_names || [goal],
      created_at: res.created_at || new Date().toISOString(),
      total_days: res.total_days || days.length || originalReq.days_count || (originalReq.duration_weeks ? originalReq.duration_weeks * 7 : 4),
      total_hours: res.total_hours || (originalReq.hours_per_day ? (originalReq.days_count || 4) * originalReq.hours_per_day : 12),
      days,
      summary: res.summary || `Personalized study plan for ${goal}.`,
      plan,
      estimated_hours_per_week: res.estimated_hours_per_week || 5,
      topics: Array.isArray(res.topics) ? res.topics : [],
    };
  }

  private generateMockAskResponse(payload: AIAskRequest): AIAskResponse {
    return {
      answer: `[AI Fallback Simulation]: Regarding "${payload.question}", key concepts in computer science and machine learning include resource allocation, supervised algorithms, and state management. Consult course lecture notes and resources for comprehensive review.`,
      sources: [
        {
          title: 'Course Materials & Lectures',
          snippet: `Relevant content matching inquiry: ${payload.question}`,
        },
      ],
      suggested_questions: [
        'How does this concept apply in real-world distributed systems?',
        'Can you provide a code example for this topic?',
      ],
      metadata: { mock_mode: true },
    };
  }

  private generateMockStudyPlanResponse(payload: AIStudyPlanRequest): AIStudyPlanResponse {
    const weeks = payload.duration_weeks || 4;
    const weeklyModules = Array.from({ length: weeks }, (_, idx) => ({
      week: idx + 1,
      topic: `Module ${idx + 1}: Foundational principles of ${payload.goal}`,
      activities: [
        'Watch course lecture videos and review PDF notes',
        'Complete practical lab exercises',
        'Review study plan milestones',
      ],
      estimated_hours: 4,
    }));

    return {
      title: payload.title || `Mastery Plan: ${payload.goal}`,
      goal: payload.goal,
      estimated_hours_per_week: 4,
      topics: [`Foundations of ${payload.goal}`, 'Core Algorithms', 'Applied Systems', 'Capstone Evaluation'],
      plan: {
        weeks: weeklyModules,
        recommendations: [
          'Study in 45-minute focused intervals with 10-minute breaks',
          'Use local video seek controls to review complex topics',
        ],
      },
    };
  }
}

export const aiServiceClient = new AIServiceClient();
