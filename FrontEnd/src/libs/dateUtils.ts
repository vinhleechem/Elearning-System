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
