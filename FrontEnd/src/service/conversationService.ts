import { httpClient } from "./httpClient";

export interface ConversationResponse {
  conversationId: number;
  studentId: number;
  studentName: string;
  studentAvatar?: string;
  instructorId: number;
  instructorUserId: number;
  instructorName: string;
  instructorAvatar?: string;
  courseId: number;
  courseName: string;
  lastMessageContent?: string;
  lastMessageAt?: string;
  lastMessageSenderId?: number;
  lastMessageSenderType?: "STUDENT" | "INSTRUCTOR";
  lastMessageIsImage?: boolean;
  studentUnreadCount: number;
  instructorUnreadCount: number;
  isArchived: boolean;
  isLocked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface MessageResponse {
  messageId: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  senderType: "STUDENT" | "INSTRUCTOR";
  content: string;
  imageUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface SendMessageRequest {
  conversationId: number;
  content: string;
  imageUrl?: string;
}

export interface PaginatedConversationResponse {
  data: ConversationResponse[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface PaginatedMessageResponse {
  data: MessageResponse[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
}

export const conversationService = {
  // User APIs - Works for both Students and Instructors
  getMyConversations: async (
    page: number = 0,
    size: number = 10,
    filters?: { courseId?: number; keyword?: string; archived?: boolean },
  ): Promise<PaginatedConversationResponse> => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("size", size.toString());
    if (filters?.courseId) params.set("courseId", filters.courseId.toString());
    if (filters?.keyword) params.set("keyword", filters.keyword);
    if (filters?.archived !== undefined)
      params.set("archived", filters.archived.toString());

    const response = await httpClient<PaginatedConversationResponse>(
      `/conversations?${params.toString()}`,
      { method: "GET" },
    );
    if (!response.data) {
      throw new Error(
        response.message || "Không lấy được danh sách conversations",
      );
    }
    return response.data;
  },

  markAsRead: async (conversationId: number): Promise<void> => {
    const response = await httpClient<void>(
      `/conversations/${conversationId}/mark-read`,
      { method: "PUT" },
    );
    if (!response.success) {
      throw new Error(response.message || "Không thể đánh dấu đã đọc");
    }
  },

  archiveConversation: async (
    conversationId: number,
    archived: boolean,
  ): Promise<void> => {
    const response = await httpClient<void>(
      `/conversations/${conversationId}/archive?archived=${archived}`,
      { method: "PUT" },
    );
    if (!response.success) {
      throw new Error(response.message || "Không thể lưu trữ conversation");
    }
  },

  // Get or create conversation for a course (Student)
  getOrCreateConversation: async (
    courseId: number,
  ): Promise<ConversationResponse> => {
    const response = await httpClient<ConversationResponse>(
      `/conversations/course/${courseId}`,
      { method: "POST" },
    );
    if (!response.data) {
      throw new Error(response.message || "Không tạo được conversation");
    }
    return response.data;
  },

  // Admin APIs
  getAllConversations: async (
    page: number = 0,
    size: number = 10,
    filters?: {
      courseId?: number;
      instructorId?: number;
      studentId?: number;
      isArchived?: boolean;
      isLocked?: boolean;
      startDate?: string;
      endDate?: string;
      keyword?: string;
    },
  ): Promise<PaginatedConversationResponse> => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("size", size.toString());

    if (filters?.courseId) params.set("courseId", filters.courseId.toString());
    if (filters?.instructorId)
      params.set("instructorId", filters.instructorId.toString());
    if (filters?.studentId)
      params.set("studentId", filters.studentId.toString());
    if (filters?.isArchived !== undefined)
      params.set("isArchived", filters.isArchived.toString());
    if (filters?.isLocked !== undefined)
      params.set("isLocked", filters.isLocked.toString());
    if (filters?.startDate) params.set("startDate", filters.startDate);
    if (filters?.endDate) params.set("endDate", filters.endDate);
    if (filters?.keyword) params.set("keyword", filters.keyword);

    const response = await httpClient<PaginatedConversationResponse>(
      `/admin/conversations?${params.toString()}`,
      { method: "GET" },
    );
    if (!response.data) {
      throw new Error(
        response.message || "Không lấy được danh sách conversations",
      );
    }
    return response.data;
  },

  getConversationDetail: async (
    conversationId: number,
  ): Promise<ConversationResponse> => {
    const response = await httpClient<ConversationResponse>(
      `/admin/conversations/${conversationId}`,
      { method: "GET" },
    );
    if (!response.data) {
      throw new Error(response.message || "Không tìm thấy conversation");
    }
    return response.data;
  },

  lockConversation: async (conversationId: number): Promise<void> => {
    const response = await httpClient<void>(
      `/admin/conversations/${conversationId}/lock`,
      { method: "PUT" },
    );
    if (!response.success) {
      throw new Error(response.message || "Không thể khóa conversation");
    }
  },

  unlockConversation: async (conversationId: number): Promise<void> => {
    const response = await httpClient<void>(
      `/admin/conversations/${conversationId}/unlock`,
      { method: "PUT" },
    );
    if (!response.success) {
      throw new Error(response.message || "Không thể mở khóa conversation");
    }
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await httpClient<number>(
      `/conversations/unread-count`,
      { method: "GET" },
    );
    return response.data || 0;
  },
};

export const messageService = {
  sendMessage: async (data: SendMessageRequest): Promise<MessageResponse> => {
    const response = await httpClient<MessageResponse>(`/messages`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.data) {
      throw new Error(response.message || "Không gửi được tin nhắn");
    }
    return response.data;
  },

  getMessages: async (
    conversationId: number,
    page: number = 0,
    size: number = 20,
  ): Promise<PaginatedMessageResponse> => {
    const response = await httpClient<PaginatedMessageResponse>(
      `/messages?conversationId=${conversationId}&page=${page}&size=${size}`,
      { method: "GET" },
    );
    if (!response.data) {
      throw new Error(response.message || "Không lấy được danh sách tin nhắn");
    }
    return response.data;
  },

  markMessagesAsRead: async (conversationId: number): Promise<void> => {
    const response = await httpClient<void>(
      `/messages/conversations/${conversationId}/mark-read`,
      { method: "PUT" },
    );
    if (!response.success) {
      throw new Error(response.message || "Không thể đánh dấu đã đọc");
    }
  },

  deleteMessage: async (messageId: number): Promise<void> => {
    const response = await httpClient<void>(`/messages/${messageId}`, {
      method: "DELETE",
    });
    if (!response.success) {
      throw new Error(response.message || "Không xóa được tin nhắn");
    }
  },

  adminDeleteMessage: async (messageId: number): Promise<void> => {
    const response = await httpClient<void>(`/messages/admin/${messageId}`, {
      method: "DELETE",
    });
    if (!response.success) {
      throw new Error(response.message || "Không xóa được tin nhắn");
    }
  },
};
