export type ResourceType = 'pdf' | 'video' | 'notes' | 'document' | 'other';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor: string;
  created_at: string;
  updated_at: string;
}

export interface CourseWithResources extends Course {
  resources?: Resource[];
}

export interface Resource {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  resource_type: ResourceType;
  storage_path: string;
  mime_type: string;
  file_size: number;
  created_at: string;
}

export interface ResourceResponse extends Resource {
  file_url: string;
  download_url: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  goal: string;
  plan_json: string;
  created_at: string;
  updated_at: string;
}

export interface ParsedStudyPlan extends Omit<StudyPlan, 'plan_json'> {
  plan: Record<string, unknown>;
}

// AI Service API Contracts
export interface AIAskRequest {
  question: string;
  course_id?: string;
  resource_id?: string;
  history?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
}

export interface AIAskResponse {
  answer: string;
  sources?: Array<{
    course_id?: string;
    resource_id?: string;
    title?: string;
    snippet?: string;
  }>;
  suggested_questions?: string[];
  metadata?: Record<string, unknown>;
}

export interface AIStudyPlanRequest {
  goal: string;
  title?: string;
  course_id?: string;
  duration_weeks?: number;
  preferences?: Record<string, unknown>;
  save?: boolean;
}

export interface AIStudyPlanResponse {
  title: string;
  goal: string;
  plan: Record<string, unknown>;
  estimated_hours_per_week?: number;
  topics?: string[];
  study_plan_id?: string;
}

// Search result structures
export interface SearchResult {
  query: string;
  total: number;
  courses: Course[];
  resources: ResourceResponse[];
  content_search_enabled: boolean;
  content_results?: Array<{
    resource_id: string;
    course_id: string;
    title: string;
    snippet: string;
    relevance_score?: number;
  }>;
}
