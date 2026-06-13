import apiClient from "./client";
import type { EngagementReport, MasteryReport } from "@/types";

export async function getEngagementReport(
  sessionId?: number,
  startDate?: string,
  endDate?: string
): Promise<EngagementReport> {
  const { data } = await apiClient.get<EngagementReport>("/reports/engagement", {
    params: {
      ...(sessionId && { session_id: sessionId }),
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
    },
  });
  return data;
}

export async function getMasteryReport(
  studentId?: number,
  classId?: number
): Promise<MasteryReport> {
  const { data } = await apiClient.get<MasteryReport>("/reports/mastery", {
    params: {
      ...(studentId && { student_id: studentId }),
      ...(classId && { class_id: classId }),
    },
  });
  return data;
}

export async function getInterventionEffectivenessReport(
  sessionId: number,
  interventionTime: string
) {
  const { data } = await apiClient.get("/reports/intervention-effectiveness", {
    params: { session_id: sessionId, intervention_time: interventionTime },
  });
  return data;
}
