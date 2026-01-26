/**
 * Format date to dd/mm/yyyy format
 * @param date - Date object or date string
 * @returns Formatted date string in dd/mm/yyyy format
 */
export const formatDate = (date: Date | string | undefined | null): string => {
    if (!date) return "";

    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return "";

    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();

    return `${day}/${month}/${year}`;
};

/**
 * Format date to dd/mm/yyyy HH:mm format
 * @param date - Date object or date string
 * @returns Formatted date string in dd/mm/yyyy HH:mm format
 */
export const formatDateTime = (date: Date | string | undefined | null): string => {
    if (!date) return "";

    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return "";

    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Format date for chat messages (Facebook-style)
 * - Today: "HH:mm" (e.g., "14:30")
 * - Yesterday: "Hôm qua HH:mm"
 * - This week: "Thứ X HH:mm"
 * - Older: "dd/mm/yyyy HH:mm"
 * @param date - Date object or date string
 * @returns Formatted date string for chat
 */
export const formatChatTime = (date: Date | string | undefined | null): string => {
    if (!date) return "";

    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return "";

    const now = new Date();
    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    const time = `${hours}:${minutes}`;

    // Check if today
    const isToday =
        dateObj.getDate() === now.getDate() &&
        dateObj.getMonth() === now.getMonth() &&
        dateObj.getFullYear() === now.getFullYear();

    if (isToday) {
        return time;
    }

    // Check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
        dateObj.getDate() === yesterday.getDate() &&
        dateObj.getMonth() === yesterday.getMonth() &&
        dateObj.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
        return `Hôm qua ${time}`;
    }

    // Check if this week
    const daysDiff = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
        const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
        return `${days[dateObj.getDay()]} ${time}`;
    }

    // Older messages: show full date
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year} ${time}`;
};


export const formatLastSeen = (date: Date | string | undefined | null): string => {
    if (!date) return "Không rõ";

    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) return "Không rõ";

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Less than 1 minute
    if (diffMinutes < 1) {
        return "Vừa xong";
    }

    // Less than 60 minutes
    if (diffMinutes < 60) {
        return `${diffMinutes} phút trước`;
    }

    // Less than 24 hours
    if (diffHours < 24) {
        return `${diffHours} giờ trước`;
    }

    // Yesterday
    if (diffDays === 1) {
        return "Hôm qua";
    }

    // Less than 7 days
    if (diffDays < 7) {
        return `${diffDays} ngày trước`;
    }

    // Older: show date
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
};
