import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getAuthStoreState } from "../store/authStore";

export interface Notification {
  notificationId?: number;
  id?: number;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  userId?: number;
  link?: string;
  isRead?: boolean;
  createdAt?: string;
  conversationId?: number; // Added
}

type NotificationCallback = (notification: Notification) => void;
type MessageCallback = (message: any) => void;

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, any> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private notificationListeners: Set<NotificationCallback> = new Set();

  addNotificationListener(callback: NotificationCallback) {
    this.notificationListeners.add(callback);
  }

  removeNotificationListener(callback: NotificationCallback) {
    this.notificationListeners.delete(callback);
  }

  private notifyListeners(notification: Notification) {
    this.notificationListeners.forEach(listener => listener(notification));
  }

  connect(userId: string) {
    if (this.client?.connected) {
      console.log("WebSocket already connected");
      return;
    }

    // WebSocket URL from env
    const wsUrl = import.meta.env.VITE_WS_URL;

    const token = getAuthStoreState().tokens?.accessToken;
    const wsUrlWithToken = `${wsUrl}?token=${token}`;

    console.log("🔌 Connecting WebSocket with token:", token ? "✅ Token exists" : "❌ No token");

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrlWithToken) as any,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        // console.log("STOMP Debug:", str);
      },
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = () => {
      console.log("✅ WebSocket Connected");
      this.reconnectAttempts = 0;

      // Subscribe to user-specific notifications
      const userSub = this.client!.subscribe(
        `/user/queue/notifications`,
        (message) => {
          const notification: Notification = JSON.parse(message.body);
          console.log("📬 Personal Notification:", notification);
          this.notifyListeners(notification);
        },
      );
      this.subscriptions.set("user", userSub);

      // Subscribe to broadcast notifications
      const broadcastSub = this.client!.subscribe(
        "/topic/notifications",
        (message) => {
          const notification: Notification = JSON.parse(message.body);
          console.log("📢 Broadcast Notification:", notification);
          this.notifyListeners(notification);
        },
      );
      this.subscriptions.set("broadcast", broadcastSub);
    };

    this.client.onStompError = (frame) => {
      console.error("❌ STOMP error:", frame);
    };

    this.client.onWebSocketClose = () => {
      console.log("🔌 WebSocket connection closed");
      this.handleReconnect(userId);
    };

    this.client.activate();
  }

  subscribeToConversation(conversationId: number, onMessage: MessageCallback) {
    if (!this.client?.connected) {
      console.warn("Cannot subscribe to conversation: WebSocket not connected");
      return;
    }

    const topic = `/topic/conversation/${conversationId}`;
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic).unsubscribe();
      this.subscriptions.delete(topic);
    }

    console.log(`Subscribing to conversation ${conversationId}`);
    const sub = this.client.subscribe(topic, (message) => {
      const msg = JSON.parse(message.body);
      onMessage(msg);
    });
    this.subscriptions.set(topic, sub);
  }

  unsubscribeFromConversation(conversationId: number) {
    const topic = `/topic/conversation/${conversationId}`;
    const sub = this.subscriptions.get(topic);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(topic);
      console.log(`Unsubscribed from conversation ${conversationId}`);
    }
  }

  private handleReconnect(userId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => {
        this.connect(userId);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("❌ Max reconnection attempts reached");
    }
  }

  disconnect() {
    if (this.client) {
      // Unsubscribe from all subscriptions
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();

      this.client.deactivate();
      this.client = null;
      console.log("🔌 WebSocket disconnected");
    }
  }

  // Reconnect with new token after token refresh
  reconnectWithNewToken(userId: string) {
    console.log("🔄 Reconnecting WebSocket with new token...");
    this.disconnect();
    // Small delay to ensure clean disconnect
    setTimeout(() => {
      this.connect(userId);
    }, 500);
  }

  sendNotification(notification: Notification) {
    if (this.client?.connected) {
      this.client.publish({
        destination: "/app/notify",
        body: JSON.stringify(notification),
      });
    } else {
      console.error("WebSocket not connected");
    }
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}

export const webSocketService = new WebSocketService();
