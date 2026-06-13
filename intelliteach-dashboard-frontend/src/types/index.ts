// ─── Auth / User ────────────────────────────────────────────────────────────
export type UserRole = "Teacher" | "Student" | "Admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// ─── Class ───────────────────────────────────────────────────────────────────
export interface Class {
  id: number;
  subject: string;
  topic: string;
  teacher_id: number;
  syllabus_mapping: Record<string, string>;
}

// ─── Dashboard / Analytics ───────────────────────────────────────────────────
export interface DashboardSummary {
  active_students: number;
  avg_engagement: number;
  avg_mastery: number;
  classes_this_week: number;
}

export interface RecentClass {
  id: number;
  subject: string;
  topic: string;
  date: string;
  duration: string;
  students: number;
  engagement: number;
}

export interface EngagementTimelinePoint {
  time: string;
  engagement: number;
  confusion: number;
}

export interface InterventionEffectiveness {
  before_confusion: number;
  after_confusion: number;
  reduction_percent: number;
  intervention_time: string;
}

export interface ParticipationDistribution {
  active: number;
  moderate: number;
  passive: number;
}

export interface AnalyticsInsight {
  title: string;
  value: string;
  subtitle: string;
  type: "success" | "warning" | "info";
}

// ─── Engagement / Live Class ─────────────────────────────────────────────────
export type SignalType = "got_it" | "confused" | "poll" | "mcq";

export interface EngagementSignalCreate {
  signal_type: SignalType;
  correct?: boolean;
  concept?: string;
}

export interface EngagementSignalResponse {
  id: number;
  student_id: number;
  session_id: number;
  signal_type: SignalType;
  correct?: boolean;
  timestamp: string;
  concept?: string;
}

export interface EngagementStatus {
  engagement_percent: number;
  confusion_percent: number;
  got_it_count: number;
  confused_count: number;
  mcq_accuracy?: number;
  suggested_action?: string;
}

export interface LiveClassStartResponse {
  session_id: number;
  message: string;
  start_time: string;
}

export interface LiveClassEndResponse {
  message: string;
  session_id: number;
  end_time: string;
  final_engagement: number;
  final_confusion: number;
}

// ─── Mastery ─────────────────────────────────────────────────────────────────
export interface MasteryHeatmapItem {
  concept: string;
  mastery: number;
}

export interface MasteryHeatmap {
  student_id: number;
  heatmap: MasteryHeatmapItem[];
}

// ─── Homework ────────────────────────────────────────────────────────────────
export type HomeworkStatus = "pending" | "in_progress" | "completed";

export interface HomeworkResponse {
  id: number;
  student_id: number;
  class_id: number;
  title: string;
  concepts: string[];
  number_of_questions: number;
  estimated_time: number;
  target_mastery: number;
  current_mastery?: number;
  status: HomeworkStatus;
  created_at: string;
  completed_at?: string;
  questions: number[];
}

export interface HomeworkGenerateRequest {
  student_id: number;
  class_id: number;
  time_limit: number;
  focus_concepts?: string[];
}

// ─── Questions ───────────────────────────────────────────────────────────────
export type QuestionType = "MCQ" | "Short Answer" | "Conceptual" | "Application";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface QuestionResponse {
  id: number;
  session_id?: number;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  concept: string;
  estimated_time?: number;
  options?: string[];
  correct_answer?: string;
  created_at: string;
}

export interface QuestionGenerateRequest {
  session_id?: number;
  transcript_text?: string;
  concepts: string[];
  number_of_questions?: number;
  difficulty?: Difficulty;
}

// ─── Recordings ──────────────────────────────────────────────────────────────
export interface Recording {
  id: number;
  session_id: number;
  url: string;
  duration?: number;
  file_size?: number;
  is_transcribed: boolean;
  created_at: string;
}

export interface TranscriptSegment {
  time: string;
  speaker: "Teacher" | "Student";
  text: string;
  keywords?: string[];
}

// ─── Projects ────────────────────────────────────────────────────────────────
export type ProjectStatus = "not_started" | "in_progress" | "completed";

export interface Project {
  id: number;
  title: string;
  subject: string;
  description?: string;
  deadline: string;
  status: ProjectStatus;
  progress: number;
  tasks_total: number;
  tasks_completed: number;
  created_at: string;
}

export interface SoftSkillsScore {
  teamwork: number;
  communication: number;
  collaboration: number;
}

// ─── Reports ─────────────────────────────────────────────────────────────────
export interface EngagementReport {
  report_type: "engagement";
  generated_at: string;
  sessions: {
    session_id: number;
    class: string;
    start_time: string;
    end_time?: string;
    engagement_index: number;
    confusion_percent: number;
    timeline: EngagementTimelinePoint[];
  }[];
}

export interface MasteryReport {
  report_type: "mastery";
  generated_at: string;
  records: {
    student_id: number;
    student_name: string;
    concept: string;
    mastery_score: number;
    last_updated: string;
  }[];
}

// ─── API Error ───────────────────────────────────────────────────────────────
export interface ApiError {
  detail: string;
}
