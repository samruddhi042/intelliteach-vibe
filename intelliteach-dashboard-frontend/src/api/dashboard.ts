import apiClient from "./client";
import type { DashboardSummary, RecentClass } from "@/types";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await apiClient.get<DashboardSummary>("/dashboard/summary");
  return data;
}

export async function getRecentClasses(): Promise<RecentClass[]> {
  const { data } = await apiClient.get<RecentClass[]>("/dashboard/recent-classes");
  return data;
}
