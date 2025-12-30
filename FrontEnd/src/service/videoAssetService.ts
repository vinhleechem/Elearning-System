import { httpClient } from "./httpClient";

export interface VideoAssetResponse {
    assetId: number;
    title: string;
    status: string;
    hlsUrl?: string;
    dashUrl?: string;
    originalUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    sizeBytes?: number;
    resolution?: string;
    provider?: string;
}

export const videoAssetService = {
    // Upload video file
    uploadVideo: async (file: File, title?: string): Promise<VideoAssetResponse> => {
        const formData = new FormData();
        formData.append("file", file);
        if (title) {
            formData.append("title", title);
        }

        const response = await httpClient<VideoAssetResponse>("/videos/upload", {
            method: "POST",
            body: formData,
            // Don't set Content-Type - browser will set it automatically with boundary
            headers: {},
        });

        if (!response.data) {
            throw new Error(response.message || "Không upload được video");
        }
        return response.data;
    },

    // Get video asset by ID
    getVideoAsset: async (assetId: number): Promise<VideoAssetResponse> => {
        const response = await httpClient<VideoAssetResponse>(`/videos/${assetId}`, {
            method: "GET",
        });
        if (!response.data) {
            throw new Error(response.message || "Không tìm thấy video");
        }
        return response.data;
    },
};
