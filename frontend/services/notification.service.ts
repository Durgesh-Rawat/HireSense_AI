import { USE_MOCK } from "@/lib/config";
import { ENDPOINTS } from "@/constants/endpoints";
import { mockNotifications } from "@/mocks/mockApi";
import type { Notification } from "@/types/user";
import { http } from "./api";

export const notificationService = {
  list: (): Promise<Notification[]> => (USE_MOCK ? mockNotifications.list() : http.get(ENDPOINTS.notifications.list)),
  markRead: (id: string): Promise<void> => (USE_MOCK ? mockNotifications.markRead(id) : http.post(ENDPOINTS.notifications.markRead(id))),
  markAllRead: (): Promise<void> => (USE_MOCK ? mockNotifications.markAllRead() : http.post(ENDPOINTS.notifications.markAllRead)),
};
