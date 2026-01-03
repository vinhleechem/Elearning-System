/**
 * Chatbot Service - Kết nối với AI Chatbot API
 * Hỗ trợ: HTTP REST API và WebSocket real-time
 */

const CHATBOT_BASE_URL =
  import.meta.env.VITE_CHATBOT_URL || "http://localhost:8001";

// ============= TYPES =============

export interface ChatMessage {
  id?: number;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  sources?: ChatSource[];
  cached?: boolean;
  status?: "sending" | "sent" | "delivered" | "read" | "error";
}

export interface ChatSource {
  content: string;
  title?: string;
  relevance?: number;
}

export interface Conversation {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ChatRequest {
  user_id: number;
  message: string;
  conversation_id?: number;
  context?: {
    course_id?: number;
    page?: string;
    [key: string]: any;
  };
}

export interface ChatResponse {
  conversation_id: number;
  message: string;
  role: "assistant";
  sources: ChatSource[];
  timestamp: string;
  cached: boolean;
}

export interface SuggestedQuestion {
  id: string;
  text: string;
  context?: any;
}

export interface QuickReply {
  id: string;
  label: string;
  value: string;
}

export interface FeedbackRequest {
  user_id: number;
  conversation_id: number;
  message_id?: number;
  rating: number; // 1-5
  feedback?: string;
}

export interface AnalyticsData {
  total_messages: number;
  total_conversations: number;
  avg_response_time: number;
  popular_topics: Record<string, number>;
  avg_satisfaction: number;
  error_count: number;
}

// ============= SERVICE CLASS =============

class ChatbotService {
  private wsConnection: WebSocket | null = null;
  private messageHandlers: Array<(message: any) => void> = [];
  private isConnecting = false;

  // ===== HTTP REST API =====

  /**
   * Gửi tin nhắn qua REST API
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${CHATBOT_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Error sending message:", error);
      throw error;
    }
  }

  /**
   * Gửi tin nhắn với streaming (như ChatGPT)
   */
  async sendMessageStream(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
    onConversationId?: (id: number) => void,
  ): Promise<void> {
    try {
      const response = await fetch(`${CHATBOT_BASE_URL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Response body is null");
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onComplete();
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.substring(6);
            if (data === "[DONE]") {
              onComplete();
              return;
            }

            // Check if it's JSON (conversation_id)
            if (data.trim().startsWith("{")) {
              try {
                const json = JSON.parse(data);
                if (json.conversation_id && onConversationId) {
                  onConversationId(json.conversation_id);
                  continue;
                }
              } catch (e) {
                // Not JSON, treat as text chunk
              }
            }

            onChunk(data);
          }
        }
      }
    } catch (error) {
      console.error("❌ Streaming error:", error);
      onError(error as Error);
    }
  }

  /**
   * Lấy danh sách conversations của user
   */
  async getConversations(
    userId: number,
    limit: number = 20,
  ): Promise<Conversation[]> {
    try {
      const response = await fetch(
        `${CHATBOT_BASE_URL}/conversations/${userId}?limit=${limit}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Error fetching conversations:", error);
      throw error;
    }
  }

  /**
   * Lấy lịch sử tin nhắn của conversation
   */
  async getConversationMessages(
    conversationId: number,
    userId: number,
  ): Promise<ChatResponse[]> {
    try {
      const response = await fetch(
        `${CHATBOT_BASE_URL}/conversations/${conversationId}/messages?user_id=${userId}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Error fetching messages:", error);
      throw error;
    }
  }

  /**
   * Xóa conversation
   */
  async deleteConversation(
    conversationId: number,
    userId: number,
  ): Promise<void> {
    try {
      const response = await fetch(
        `${CHATBOT_BASE_URL}/conversations/${conversationId}?user_id=${userId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error deleting conversation:", error);
      throw error;
    }
  }

  /**
   * Submit feedback
   */
  async submitFeedback(feedback: FeedbackRequest): Promise<void> {
    try {
      const response = await fetch(`${CHATBOT_BASE_URL}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Error submitting feedback:", error);
      throw error;
    }
  }

  /**
   * Lấy analytics data
   */
  async getAnalytics(): Promise<AnalyticsData> {
    try {
      const response = await fetch(`${CHATBOT_BASE_URL}/analytics`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.chatbot_analytics;
    } catch (error) {
      console.error("❌ Error fetching analytics:", error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${CHATBOT_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error("❌ Health check failed:", error);
      return false;
    }
  }

  // ===== WEBSOCKET REAL-TIME =====

  /**
   * Kết nối WebSocket cho real-time chat
   */
  connectWebSocket(
    userId: number,
    onMessage: (message: any) => void,
    onError?: (error: Event) => void,
  ): void {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      console.log("✅ WebSocket already connected");
      return;
    }

    if (this.isConnecting) {
      console.log("⏳ WebSocket connection in progress");
      return;
    }

    this.isConnecting = true;
    const wsUrl = `${CHATBOT_BASE_URL.replace("http", "ws")}/ws/chat/${userId}`;

    console.log("🔌 Connecting to WebSocket:", wsUrl);

    this.wsConnection = new WebSocket(wsUrl);

    this.wsConnection.onopen = () => {
      console.log("✅ WebSocket connected");
      this.isConnecting = false;
    };

    this.wsConnection.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("📨 WebSocket message:", message);

        // Notify all handlers
        this.messageHandlers.forEach((handler) => handler(message));

        // Call provided callback
        if (onMessage) {
          onMessage(message);
        }
      } catch (error) {
        console.error("❌ Error parsing WebSocket message:", error);
      }
    };

    this.wsConnection.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      this.isConnecting = false;
      if (onError) {
        onError(error);
      }
    };

    this.wsConnection.onclose = () => {
      console.log("🔌 WebSocket disconnected");
      this.isConnecting = false;
      this.wsConnection = null;
    };
  }

  /**
   * Gửi tin nhắn qua WebSocket
   */
  sendWebSocketMessage(message: {
    type: "message";
    content: string;
    conversation_id?: number;
    context?: any;
  }): void {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(message));
    } else {
      console.error("❌ WebSocket not connected");
      throw new Error("WebSocket not connected");
    }
  }

  /**
   * Ngắt kết nối WebSocket
   */
  disconnectWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
      this.messageHandlers = [];
    }
  }

  /**
   * Đăng ký handler cho WebSocket messages
   */
  onWebSocketMessage(handler: (message: any) => void): () => void {
    this.messageHandlers.push(handler);

    // Return unsubscribe function
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Kiểm tra trạng thái WebSocket
   */
  isWebSocketConnected(): boolean {
    return this.wsConnection?.readyState === WebSocket.OPEN;
  }

  // ===== HELPER FUNCTIONS =====

  /**
   * Lấy suggested questions dựa trên context
   */
  getSuggestedQuestions(context?: {
    page?: string;
    course_id?: number;
  }): SuggestedQuestion[] {
    const suggestions: SuggestedQuestion[] = [];

    if (context?.page === "course_detail") {
      suggestions.push(
        { id: "1", text: "Khóa học này có chứng chỉ không?" },
        { id: "2", text: "Thời gian học bao lâu?" },
        { id: "3", text: "Có hỗ trợ trả góp không?" },
      );
    } else if (context?.page === "checkout") {
      suggestions.push(
        { id: "4", text: "Các phương thức thanh toán nào được hỗ trợ?" },
        { id: "5", text: "Làm sao để áp dụng mã giảm giá?" },
        { id: "6", text: "Chính sách hoàn tiền như thế nào?" },
      );
    } else {
      suggestions.push(
        { id: "7", text: "Làm sao để đăng ký khóa học?" },
        { id: "8", text: "Khóa học nào phù hợp với người mới bắt đầu?" },
        { id: "9", text: "Có ưu đãi gì không?" },
      );
    }

    return suggestions;
  }

  /**
   * Lấy quick replies
   */
  getQuickReplies(): QuickReply[] {
    return [
      { id: "help", label: "❓ Trợ giúp", value: "Tôi cần trợ giúp" },
      { id: "courses", label: "📚 Khóa học", value: "Xem các khóa học" },
      { id: "payment", label: "💳 Thanh toán", value: "Hướng dẫn thanh toán" },
      {
        id: "certificate",
        label: "📜 Chứng chỉ",
        value: "Thông tin về chứng chỉ",
      },
    ];
  }
}

// Export singleton instance
export const chatbotService = new ChatbotService();
export default chatbotService;
