import apiClient from "./client";
import type { Project, SoftSkillsScore } from "@/types";

export async function getProjects(): Promise<Project[]> {
  const { data } = await apiClient.get<Project[]>("/projects");
  return data;
}

export async function getProject(projectId: number): Promise<Project> {
  const { data } = await apiClient.get<Project>(`/projects/${projectId}`);
  return data;
}

export interface ProjectCreatePayload {
  title: string;
  subject: string;
  description?: string;
  deadline: string;
  tasks_total?: number;
}

export async function createProject(payload: ProjectCreatePayload): Promise<Project> {
  const { data } = await apiClient.post<Project>("/projects", payload);
  return data;
}

export async function assignTeam(
  projectId: number,
  userIds: number[]
): Promise<void> {
  await apiClient.post(`/projects/${projectId}/teams`, { user_ids: userIds });
}

export interface PeerReviewPayload {
  reviewee_id: number;
  teamwork_score: number;
  communication_score: number;
  collaboration_score: number;
  feedback?: string;
}

export async function submitPeerReview(
  projectId: number,
  payload: PeerReviewPayload
): Promise<void> {
  await apiClient.post(`/projects/${projectId}/peer-review`, payload);
}

export async function getSoftSkills(projectId: number): Promise<SoftSkillsScore> {
  const { data } = await apiClient.get<SoftSkillsScore>(`/projects/${projectId}/soft-skills`);
  return data;
}
