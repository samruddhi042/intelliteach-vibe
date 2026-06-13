import apiClient from "./client";
import type { MasteryHeatmap, HomeworkResponse, HomeworkGenerateRequest } from "@/types";

export async function getMasteryHeatmap(
  studentId?: number,
  classId?: number
): Promise<MasteryHeatmap> {
  const { data } = await apiClient.get<MasteryHeatmap>("/mastery/heatmap", {
    params: {
      ...(studentId && { student_id: studentId }),
      ...(classId && { class_id: classId }),
    },
  });
  return data;
}

export async function getHomework(studentId?: number, classId?: number): Promise<HomeworkResponse[]> {
  const { data } = await apiClient.get<HomeworkResponse[]>("/homework", {
    params: {
      ...(studentId && { student_id: studentId }),
      ...(classId && { class_id: classId }),
    },
  });
  return data;
}

export async function generateHomework(
  request: HomeworkGenerateRequest
): Promise<HomeworkResponse> {
  const { data } = await apiClient.post<HomeworkResponse>("/homework/generate", request);
  return data;
}

export async function completeHomework(
  homeworkId: number,
  correctPercentage: number
): Promise<void> {
  await apiClient.post(`/homework/${homeworkId}/complete`, null, {
    params: { correct_percentage: correctPercentage },
  });
}
