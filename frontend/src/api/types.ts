export type ResourceType = 'pdf' | 'video' | 'notes' | 'slides' | 'lab' | 'other';

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  instructor?: string;
  department: string;
  semester: string;
  resource_count: number;
  resource_types: ResourceType[];
  updated_at?: string;
  color_tag?: string;
}

export interface Resource {
  id: string;
  course_id: string;
  course_title?: string;
  course_code?: string;
  title: string;
  description?: string;
  resource_type: ResourceType;
  file_url: string;
  file_name?: string;
  file_size_bytes?: number;
  duration_seconds?: number;
  page_count?: number;
  author?: string;
  created_at: string;
  tags?: string[];
  content_preview?: string;
}

export interface SearchResult {
  id: string;
  resource_id: string;
  resource_title: string;
  course_id: string;
  course_title: string;
  course_code: string;
  resource_type: ResourceType;
  matching_snippet: string;
  file_url: string;
  page_number?: number;
  relevance_score?: number;
}

export interface SourceReference {
  resource_id: string;
  resource_title: string;
  course_id: string;
  course_title: string;
  course_code?: string;
  resource_type: ResourceType;
  page_number?: number;
  section?: string;
  passage: string;
  file_url: string;
}

export interface AskQuestionRequest {
  course_id?: string;
  question: string;
  history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface AskQuestionResponse {
  answer: string;
  sources: SourceReference[];
  grounded: boolean;
  generated_at: string;
  course_id?: string;
  confidence_score?: number;
}

export interface StudyPlanTask {
  id: string;
  title: string;
  description: string;
  estimated_minutes: number;
  resource_id?: string;
  resource_title?: string;
  resource_type?: ResourceType;
  completed?: boolean;
}

export interface StudyPlanDay {
  day_number: number;
  day_label: string;
  focus_area: string;
  tasks: StudyPlanTask[];
}

export interface CreateStudyPlanRequest {
  topic_or_goal: string;
  course_ids: string[];
  days_count?: number;
  hours_per_day?: number;
}

export interface StudyPlanResponse {
  id: string;
  goal: string;
  course_ids: string[];
  course_names: string[];
  created_at: string;
  total_days: number;
  total_hours: number;
  days: StudyPlanDay[];
  summary: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  ai_service: 'connected' | 'disconnected' | 'unavailable';
  database: 'connected' | 'offline_sqlite' | 'unavailable';
  storage: 'local' | 'network';
  offline_ready: boolean;
  timestamp: string;
}

export interface CreateResourceRequest {
  title: string;
  course_id: string;
  resource_type: ResourceType;
  description?: string;
  file: File;
}
