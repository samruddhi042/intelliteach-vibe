import apiClient from "./client";
import type {
  LiveClassStartResponse,
  LiveClassEndResponse,
  EngagementSignalCreate,
  EngagementSignalResponse,
  EngagementStatus,
} from "@/types";

export async function startLiveClass(classId: number): Promise<LiveClassStartResponse> {
  const { data } = await apiClient.post<LiveClassStartResponse>("/live/start", null, {
    params: { class_id: classId },
  });
  return data;
}

export async function endLiveClass(sessionId: number): Promise<LiveClassEndResponse> {
  const { data } = await apiClient.post<LiveClassEndResponse>("/live/end", null, {
    params: { session_id: sessionId },
  });
  return data;
}

export async function sendEngagementSignal(
  sessionId: number,
  signal: EngagementSignalCreate
): Promise<EngagementSignalResponse> {
  const { data } = await apiClient.post<EngagementSignalResponse>(
    `/live/signal`,
    signal,
    { params: { session_id: sessionId } }
  );
  return data;
}

export async function getLiveStatus(sessionId: number): Promise<EngagementStatus> {
  const { data } = await apiClient.get<EngagementStatus>("/live/status", {
    params: { session_id: sessionId },
  });
  return data;
}

export async function markInterventionComplete(
  sessionId: number,
  interventionType: string
): Promise<void> {
  await apiClient.post("/live/intervention/complete", null, {
    params: { session_id: sessionId, intervention_type: interventionType },
  });
}
