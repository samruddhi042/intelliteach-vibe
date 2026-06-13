import apiClient from "./client";
import type { EngagementTimelinePoint, InterventionEffectiveness, ParticipationDistribution } from "@/types";

export async function getEngagementTimeline(sessionId: number): Promise<EngagementTimelinePoint[]> {
  const { data } = await apiClient.get<EngagementTimelinePoint[]>(
    "/analytics/engagement-timeline",
    { params: { session_id: sessionId } }
  );
  return data;
}

export async function getConfusionBeforeAfter(
  sessionId: number,
  interventionTime: string
): Promise<InterventionEffectiveness> {
  const { data } = await apiClient.get<InterventionEffectiveness>(
    "/analytics/confusion-before-after",
    { params: { session_id: sessionId, intervention_time: interventionTime } }
  );
  return data;
}
