import { config } from '../config/env';
import {
  AIAskRequest,
  AIAskResponse,
  AIStudyPlanRequest,
  AIStudyPlanResponse,
} from '../types';
import { AppError, ServiceUnavailableError } from '../middleware/error.middleware';
import { CourseService } from './course.service';

export interface AIHealthResponse {
  status: string;
  service: string;
  version?: string;
  model?: string;
  timestamp: string;
}

// OpenAI-compatible types (used by LM Studio)
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  reasoning_content?: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class AIServiceClient {
  private baseUrl: string;
  private timeoutMs: number;
  private apiKey: string;
  private mockFallback: boolean;
  private model: string;

  constructor() {
    this.baseUrl = config.AI_SERVICE_URL.replace(/\/$/, '');
    this.timeoutMs = config.AI_SERVICE_TIMEOUT_MS;
    this.apiKey = config.AI_SERVICE_API_KEY;
    this.mockFallback = config.AI_MOCK_FALLBACK;
    this.model = config.LM_STUDIO_MODEL;
  }

  /**
   * Health check: hits LM Studio's /v1/models endpoint
   */
  public async checkHealth(): Promise<AIHealthResponse> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/v1/models`, {
        method: 'GET',
        headers: this.buildHeaders(),
      });

      if (!response.ok) {
        throw new AppError(`LM Studio health returned HTTP ${response.status}`, 502);
      }

      const data = await response.json() as { data?: Array<{ id: string }> };
      const loadedModels = data?.data?.map((m) => m.id).join(', ') || this.model;

      return {
        status: 'ok',
        service: 'LM Studio (Gemma — local)',
        model: loadedModels,
        version: '1.0.0',
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
      // If LM Studio is not running, report offline gracefully
      return {
        status: 'offline',
        service: 'LM Studio (Gemma)',
        model: this.model,
        version: 'N/A',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Send a QA question to Gemma via LM Studio's OpenAI-compatible API
   */
  public async ask(payload: AIAskRequest): Promise<AIAskResponse> {
    const systemPrompt = `You are NEXUS AI, an expert offline university study assistant powered by Gemma.
Answer the student's question directly, clearly, and educationally using the course information provided.
Do NOT show any internal thinking, reasoning tags, or thought process.
Respond directly with the final, polished educational answer in 2 to 3 clear paragraphs.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Include conversation history if provided
    if (payload.history && payload.history.length > 0) {
      for (const msg of payload.history) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    // Lookup course metadata from SQLite database if course_id is provided
    let courseContext = '';
    if (payload.course_id) {
      try {
        const course = CourseService.getById(payload.course_id);
        const resourceList = course.resources && course.resources.length > 0
          ? course.resources.map((r) => `• ${r.title} (${r.resource_type})`).join('\n')
          : 'Lecture materials uploaded to NEXUS repository';
        courseContext = `[Context for Course: "${course.title}" | Instructor: ${course.instructor} | Description: ${course.description || 'University course'}]\nMaterials available in this course:\n${resourceList}\n\n`;
      } catch {
        // Course ID might not match or be global
      }
    }

    const userMessage = `${courseContext}Student Question: ${payload.question}`;
    messages.push({ role: 'user', content: userMessage });

    try {
      const reply = await this.callChatCompletion({
        model: this.model,
        messages,
        temperature: 0.3,
        max_tokens: 600,
      });

      const choiceMsg = reply.choices?.[0]?.message;
      let answer = choiceMsg?.content?.trim();

      // Fallback if model output was put in reasoning_content
      if (!answer && choiceMsg?.reasoning_content) {
        // Strip any "Thinking Process:" prefix from reasoning if that's all there is
        answer = choiceMsg.reasoning_content
          .replace(/^Thinking Process:[\s\S]*?(?=\n\n(?:[A-Z]|\d\.|\*\*))/i, '')
          .trim();
      }

      if (!answer) {
        answer = 'No response generated. Please ensure Gemma is loaded and ready in LM Studio.';
      }

      return {
        answer,
        sources: [],
        suggested_questions: this.generateFollowUpSuggestions(payload.question),
        metadata: {
          model: reply.model || this.model,
          provider: 'LM Studio (Gemma)',
          usage: reply.usage,
        },
      };
    } catch (err: unknown) {
      if (this.mockFallback) {
        return this.generateMockAskResponse(payload);
      }
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('ECONNREFUSED') || message.includes('fetch failed') || message.includes('Failed to fetch')) {
        return {
          answer:
            '⚠️ **LM Studio is not running.** Please open LM Studio, load the Gemma model, and start the Local Server (Developer tab → Start Server). Then try again.',
          sources: [],
          suggested_questions: [],
          metadata: { lm_studio_offline: true },
        };
      }
      this.handleNetworkError(err);
    }
  }

  /**
   * Generate a study plan using Gemma via LM Studio
   */
  public async generateStudyPlan(payload: AIStudyPlanRequest): Promise<AIStudyPlanResponse> {
    const weeks = payload.duration_weeks || 4;
    const systemPrompt = `You are NEXUS AI, an educational planning assistant for university students.
Generate structured, realistic study plans in valid JSON format only.
No markdown, no explanation outside JSON. Return only the JSON object.`;

    const userPrompt = `Create a ${weeks}-week study plan for a student with this goal: "${payload.goal}".
${payload.title ? `Plan title: "${payload.title}"` : ''}
${payload.course_id ? `Course context: ${payload.course_id}` : ''}

Return a JSON object with this exact structure:
{
  "title": "string",
  "goal": "string",
  "estimated_hours_per_week": number,
  "topics": ["topic1", "topic2", ...],
  "plan": {
    "weeks": [
      {
        "week": 1,
        "topic": "string",
        "activities": ["activity1", "activity2"],
        "estimated_hours": number
      }
    ],
    "recommendations": ["tip1", "tip2"]
  }
}`;

    try {
      const reply = await this.callChatCompletion({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 2048,
      });

      const rawContent = reply.choices[0]?.message?.content?.trim() || '';

      // Extract JSON from the response (model might wrap in markdown)
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new AppError('Model did not return valid JSON for study plan', 502);
      }

      const parsed = JSON.parse(jsonMatch[0]) as Partial<AIStudyPlanResponse>;
      return this.validateStudyPlanResponse(parsed, payload);
    } catch (err: unknown) {
      if (this.mockFallback) {
        return this.generateMockStudyPlanResponse(payload);
      }
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('ECONNREFUSED') || message.includes('fetch failed') || message.includes('Failed to fetch')) {
        // Return a helpful offline study plan
        return this.generateMockStudyPlanResponse(payload);
      }
      this.handleNetworkError(err);
    }
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  private async callChatCompletion(body: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new AppError(
        `LM Studio responded with status ${response.status}: ${errorText || response.statusText}`,
        502
      );
    }

    return response.json() as Promise<ChatCompletionResponse>;
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
      const response = await fetch(url, { ...options, signal: controller.signal });
      return response;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new AppError(`LM Studio request timed out after ${this.timeoutMs / 1000}s — model may still be loading`, 504);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  private handleNetworkError(err: unknown): never {
    if (err instanceof AppError) throw err;
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('ECONNREFUSED') || message.includes('Failed to fetch') || message.includes('fetch failed')) {
      throw new ServiceUnavailableError(
        'LM Studio is not running. Please open LM Studio, load Gemma, and start the Local Server.'
      );
    }
    throw new ServiceUnavailableError('Unable to connect to LM Studio at this time.');
  }

  private generateFollowUpSuggestions(question: string): string[] {
    const q = question.toLowerCase();
    if (q.includes('machine learning') || q.includes('supervised') || q.includes('neural')) {
      return [
        'Can you explain overfitting and how to prevent it?',
        'What is the difference between supervised and unsupervised learning?',
        'How does gradient descent work?',
      ];
    }
    if (q.includes('os') || q.includes('process') || q.includes('deadlock')) {
      return [
        'What are the four conditions for a deadlock?',
        'How does the banker\'s algorithm prevent deadlocks?',
        'Explain the difference between a process and a thread.',
      ];
    }
    return [
      'Can you give a practical example of this concept?',
      'What are common mistakes students make with this topic?',
      'How does this relate to other topics in the course?',
    ];
  }

  private validateStudyPlanResponse(data: Partial<AIStudyPlanResponse>, req: AIStudyPlanRequest): AIStudyPlanResponse {
    return {
      title: data.title || req.title || `Study Plan: ${req.goal}`,
      goal: data.goal || req.goal,
      plan: typeof data.plan === 'object' && data.plan !== null ? data.plan : { schedule: [] },
      estimated_hours_per_week: data.estimated_hours_per_week || 5,
      topics: Array.isArray(data.topics) ? data.topics : [],
    };
  }

  private generateMockAskResponse(payload: AIAskRequest): AIAskResponse {
    return {
      answer: `[LM Studio Offline] Regarding "${payload.question}": Please start LM Studio and load Gemma to get real AI responses. In the meantime, check your course lecture notes and resources for comprehensive answers.`,
      sources: [{ title: 'Course Materials & Lectures', snippet: `Content matching: ${payload.question}` }],
      suggested_questions: [
        'How does this concept apply in real-world systems?',
        'Can you provide a code example for this topic?',
      ],
      metadata: { mock_mode: true, lm_studio_offline: true },
    };
  }

  private generateMockStudyPlanResponse(payload: AIStudyPlanRequest): AIStudyPlanResponse {
    const weeks = payload.duration_weeks || 4;
    const weeklyModules = Array.from({ length: weeks }, (_, idx) => ({
      week: idx + 1,
      topic: `Module ${idx + 1}: ${payload.goal} — Part ${idx + 1}`,
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
