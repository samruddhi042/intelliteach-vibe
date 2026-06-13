import apiClient from "./client";
import type { QuestionResponse, QuestionGenerateRequest } from "@/types";

export async function generateQuestions(
  request: QuestionGenerateRequest
): Promise<QuestionResponse[]> {
  const { data } = await apiClient.post<QuestionResponse[]>("/questions/generate", request);
  return data;
}

export async function getQuestionsBySession(sessionId: number): Promise<QuestionResponse[]> {
  const { data } = await apiClient.get<QuestionResponse[]>(
    `/questions/by-session/${sessionId}`
  );
  return data;
}
