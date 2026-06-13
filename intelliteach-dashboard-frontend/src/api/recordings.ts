import apiClient from "./client";
import type { Recording } from "@/types";

export async function getRecordings(sessionId?: number): Promise<Recording[]> {
  const { data } = await apiClient.get<Recording[]>("/recordings", {
    params: sessionId ? { session_id: sessionId } : {},
  });
  return data;
}

export async function getRecording(recordingId: number): Promise<Recording> {
  const { data } = await apiClient.get<Recording>(`/recordings/${recordingId}`);
  return data;
}

export async function transcribeRecording(
  recordingId: number
): Promise<{ message: string; recording_id: number; transcript_count: number }> {
  const { data } = await apiClient.post(`/recordings/${recordingId}/transcribe`);
  return data;
}

export async function getConceptMap(
  recordingId: number
): Promise<{ concept: string; confidence: number; syllabus_topic: string; mentions: number }[]> {
  const { data } = await apiClient.get(`/recordings/${recordingId}/concept-map`);
  return data;
}
