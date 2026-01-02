import { httpClient } from "./httpClient";
import type { Notification } from "./webSocketService";

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        pageNo: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
    };
}

class NotificationService {
    async getMyNotifications(
        page: number,
        size: number,
    ): Promise<PaginatedResponse<Notification>> {
        const response = await httpClient<PaginatedResponse<Notification>>(
            `/notifications?page=${page}&size=${size}`,
            { method: "GET" }
        );
        return response.data!;
    }

    async markAsRead(notificationId: number): Promise<Notification> {
        const response = await httpClient<Notification>(`/notifications/${notificationId}/read`, { method: "PUT" });
        return response.data!;
    }

    async markAllAsRead(): Promise<void> {
        await httpClient<void>("/notifications/read-all", { method: "PUT" });
    }

    async deleteNotification(notificationId: number): Promise<void> {
        await httpClient<void>(`/notifications/${notificationId}`, { method: "DELETE" });
    }

    async getUnreadCount(): Promise<number> {
        const response = await httpClient<number>("/notifications/unread-count", { method: "GET" });
        return response.data!;
    }
}

export const notificationService = new NotificationService();
