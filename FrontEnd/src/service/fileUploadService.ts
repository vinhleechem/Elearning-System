import { httpClient } from "./httpClient";

export const fileUploadService = {
    uploadFile: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await httpClient<{ url: string }>("/files/upload", {
            method: "POST",
            body: formData,
        });

        if (!response.data || !response.data.url) {
            throw new Error("Upload file thất bại: Không nhận được URL");
        }

        return response.data.url;
    },
};
