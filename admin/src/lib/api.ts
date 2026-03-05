import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:1234/api";

export const notificationsClient = axios.create({
  baseURL: `${API_BASE_URL}/notifications`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export interface SendNotificationPayload {
  title: string;
  body: string;
  type?: string;
  targetAudience?: "all" | "specific";
  walletAddresses?: string[];
  data?: Record<string, string>;
}

export async function sendNotification(payload: SendNotificationPayload) {
  const { data } = await notificationsClient.post("/send", payload);
  return data;
}

export interface NotificationRecord {
  _id: string;
  title: string;
  body?: string;
  type: string;
  targetAudience: "all" | "specific";
  totalRecipients?: number;
  successCount?: number;
  failureCount?: number;
  status: string;
  sentAt?: string | Date | null;
}

export interface NotificationHistoryResponse {
  notifications: NotificationRecord[];
  total: number;
  page: number;
  totalPages: number;
}

export async function fetchHistory(
  page = 1,
  limit = 20,
): Promise<NotificationHistoryResponse> {
  const { data } = await notificationsClient.get("/history", {
    params: { page, limit },
  });
  return data.data ?? data;
}

export interface NotificationStatsResponse {
  totalSent: number;
  totalSuccess: number;
  totalFailed: number;
  activeSubscribers: number;
}

export async function fetchStats(): Promise<NotificationStatsResponse> {
  const { data } = await notificationsClient.get("/stats");
  return data.data ?? data;
}

export async function triggerMorning() {
  const { data } = await notificationsClient.post("/trigger/morning");
  return data;
}

export async function triggerEvening() {
  const { data } = await notificationsClient.post("/trigger/evening");
  return data;
}

export async function triggerWeekly() {
  const { data } = await notificationsClient.post("/trigger/weekly");
  return data;
}

