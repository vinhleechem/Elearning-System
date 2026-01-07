import httpClient from "./httpClient";

export interface SetPasswordRequest {
    token: string;
    password: string;
    confirmPassword: string;
}

export interface ValidateTokenResponse {
    success: boolean;
    message: string;
    data: boolean;
}

const passwordResetService = {
    /**
     * Validate if token is valid and not expired
     */
    validateToken: async (token: string): Promise<boolean> => {
        const response = await httpClient<ValidateTokenResponse>(
            `/password-reset/validate?token=${token}`,
            {
                method: "GET",
            }
        );
        return response.data;
    },

    /**
     * Set new password using token
     */
    setPassword: async (request: SetPasswordRequest): Promise<void> => {
        await httpClient<void>("/password-reset/set-password", {
            method: "POST",
            body: JSON.stringify(request),
        });
    },

    /**
     * Request password reset email
     */
    requestPasswordReset: async (email: string): Promise<void> => {
        await httpClient<void>(`/password-reset/request?email=${email}`, {
            method: "POST",
        });
    },
};

export default passwordResetService;
