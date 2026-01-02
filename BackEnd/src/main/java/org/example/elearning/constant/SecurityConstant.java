package org.example.elearning.constant;

public final class SecurityConstant {
    public static final String[] PUBLIC_ENDPOINTS = {
            "/api/v1/auth/**",
            "/api/v1/categories/**",
            "/api/v1/courses/**",
            "/api/v1/payment/vn-pay-callback",
            "/ws/**",
            "/api/v1/ws/**"
    };

    // Permissions for User
    public static final String VIEW_USER = "VIEW_USER";
    public static final String ADD_USER = "ADD_USER";
    public static final String UPDATE_USER = "UPDATE_USER";
    public static final String DELETE_USER = "DELETE_USER";

    // Permissions for Permission
    public static final String VIEW_PERMISSION = "VIEW_PERMISSION";
    public static final String ADD_PERMISSION = "ADD_PERMISSION";
    public static final String UPDATE_PERMISSION = "UPDATE_PERMISSION";
    public static final String DELETE_PERMISSION = "DELETE_PERMISSION";

    // Permissions for Role
    public static final String VIEW_ROLE = "VIEW_ROLE";
    public static final String ADD_ROLE = "ADD_ROLE";
    public static final String UPDATE_ROLE = "UPDATE_ROLE";
    public static final String DELETE_ROLE = "DELETE_ROLE";

}
