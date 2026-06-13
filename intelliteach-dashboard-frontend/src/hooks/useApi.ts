import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  dashboardApi,
  liveClassApi,
  analyticsApi,
  masteryApi,
  questionsApi,
  recordingsApi,
  projectsApi,
  reportsApi,
} from "@/api";
import type {
  EngagementSignalCreate,
  HomeworkGenerateRequest,
  QuestionGenerateRequest,
  Difficulty,
} from "@/types";
import { toast } from "sonner";

// ─── Query Keys (centralised so you never have a typo) ───────────────────────
export const queryKeys = {
  dashboardSummary: ["dashboard", "summary"] as const,
  recentClasses: ["dashboard", "recent-classes"] as const,
  engagementTimeline: (sessionId: number) => ["analytics", "timeline", sessionId] as const,
  confusionBeforeAfter: (sessionId: number) => ["analytics", "confusion", sessionId] as const,
  masteryHeatmap: (studentId?: number, classId?: number) =>
    ["mastery", "heatmap", studentId, classId] as const,
  homework: (studentId?: number, classId?: number) =>
    ["homework", studentId, classId] as const,
  questions: (sessionId?: number) => ["questions", sessionId] as const,
  liveStatus: (sessionId: number) => ["live", "status", sessionId] as const,
  recordings: (sessionId?: number) => ["recordings", sessionId] as const,
  recording: (id: number) => ["recordings", id] as const,
  conceptMap: (recordingId: number) => ["recordings", "concept-map", recordingId] as const,
  projects: ["projects"] as const,
  project: (id: number) => ["projects", id] as const,
  softSkills: (projectId: number) => ["projects", "soft-skills", projectId] as const,
  engagementReport: ["reports", "engagement"] as const,
  masteryReport: ["reports", "mastery"] as const,
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboardSummary,
    queryFn: dashboardApi.getDashboardSummary,
    staleTime: 30_000, // 30s
  });
}

export function useRecentClasses() {
  return useQuery({
    queryKey: queryKeys.recentClasses,
    queryFn: dashboardApi.getRecentClasses,
    staleTime: 30_000,
  });
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export function useEngagementTimeline(sessionId: number) {
  return useQuery({
    queryKey: queryKeys.engagementTimeline(sessionId),
    queryFn: () => analyticsApi.getEngagementTimeline(sessionId),
    enabled: sessionId > 0,
  });
}

export function useConfusionBeforeAfter(sessionId: number, interventionTime: string) {
  return useQuery({
    queryKey: queryKeys.confusionBeforeAfter(sessionId),
    queryFn: () => analyticsApi.getConfusionBeforeAfter(sessionId, interventionTime),
    enabled: sessionId > 0 && !!interventionTime,
  });
}

// ─── Live Class ───────────────────────────────────────────────────────────────
export function useLiveStatus(sessionId: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.liveStatus(sessionId),
    queryFn: () => liveClassApi.getLiveStatus(sessionId),
    enabled: sessionId > 0 && enabled,
    refetchInterval: 5_000, // Poll every 5s while live
  });
}

export function useStartLiveClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (classId: number) => liveClassApi.startLiveClass(classId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.recentClasses });
      toast.success("Live class started!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useEndLiveClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: number) => liveClassApi.endLiveClass(sessionId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.recentClasses });
      qc.invalidateQueries({ queryKey: queryKeys.dashboardSummary });
      toast.success(`Class ended — Final engagement: ${data.final_engagement}%`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useSendEngagementSignal(sessionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (signal: EngagementSignalCreate) =>
      liveClassApi.sendEngagementSignal(sessionId, signal),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.liveStatus(sessionId) });
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useMarkInterventionComplete() {
  return useMutation({
    mutationFn: ({ sessionId, type }: { sessionId: number; type: string }) =>
      liveClassApi.markInterventionComplete(sessionId, type),
    onSuccess: () => toast.success("Intervention marked as complete!"),
    onError: (err: Error) => toast.error(err.message),
  });
}

// ─── Mastery ──────────────────────────────────────────────────────────────────
export function useMasteryHeatmap(studentId?: number, classId?: number) {
  return useQuery({
    queryKey: queryKeys.masteryHeatmap(studentId, classId),
    queryFn: () => masteryApi.getMasteryHeatmap(studentId, classId),
    staleTime: 60_000,
  });
}

export function useHomework(studentId?: number, classId?: number) {
  return useQuery({
    queryKey: queryKeys.homework(studentId, classId),
    queryFn: () => masteryApi.getHomework(studentId, classId),
    staleTime: 30_000,
  });
}

export function useGenerateHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: HomeworkGenerateRequest) => masteryApi.generateHomework(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homework"] });
      toast.success("Adaptive homework generated!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCompleteHomework() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, pct }: { id: number; pct: number }) =>
      masteryApi.completeHomework(id, pct),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["homework"] });
      qc.invalidateQueries({ queryKey: ["mastery"] });
      toast.success("Homework completed! Mastery updated.");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ─── Questions ────────────────────────────────────────────────────────────────
export function useGenerateQuestions() {
  return useMutation({
    mutationFn: (req: QuestionGenerateRequest) => questionsApi.generateQuestions(req),
    onSuccess: () => toast.success("Questions generated!"),
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useQuestionsBySession(sessionId: number) {
  return useQuery({
    queryKey: queryKeys.questions(sessionId),
    queryFn: () => questionsApi.getQuestionsBySession(sessionId),
    enabled: sessionId > 0,
  });
}

// ─── Recordings ───────────────────────────────────────────────────────────────
export function useRecordings(sessionId?: number) {
  return useQuery({
    queryKey: queryKeys.recordings(sessionId),
    queryFn: () => recordingsApi.getRecordings(sessionId),
    staleTime: 60_000,
  });
}

export function useConceptMap(recordingId: number) {
  return useQuery({
    queryKey: queryKeys.conceptMap(recordingId),
    queryFn: () => recordingsApi.getConceptMap(recordingId),
    enabled: recordingId > 0,
  });
}

export function useTranscribeRecording() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recordingId: number) => recordingsApi.transcribeRecording(recordingId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["recordings"] });
      toast.success(`Transcription done — ${data.transcript_count} segments`);
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: projectsApi.getProjects,
    staleTime: 60_000,
  });
}

export function useProject(projectId: number) {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => projectsApi.getProject(projectId),
    enabled: projectId > 0,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects });
      toast.success("Project created!");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useSoftSkills(projectId: number) {
  return useQuery({
    queryKey: queryKeys.softSkills(projectId),
    queryFn: () => projectsApi.getSoftSkills(projectId),
    enabled: projectId > 0,
  });
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export function useEngagementReport() {
  return useQuery({
    queryKey: queryKeys.engagementReport,
    queryFn: () => reportsApi.getEngagementReport(),
    staleTime: 120_000,
  });
}

export function useMasteryReport() {
  return useQuery({
    queryKey: queryKeys.masteryReport,
    queryFn: () => reportsApi.getMasteryReport(),
    staleTime: 120_000,
  });
}
