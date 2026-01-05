package org.example.elearning.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.service.JwtService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

/**
 * Helper class to handle JWT authentication logic.
 * Eliminates code duplication between HTTP filter and WebSocket interceptor.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationHelper {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    /**
     * Extract JWT token from Authorization header
     * 
     * @param authHeader Authorization header value
     * @return JWT token or null if not found
     */
    public String extractTokenFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    /**
     * Authenticate user using JWT token
     * 
     * @param token JWT token
     * @return Authentication object or null if authentication fails
     */
    public UsernamePasswordAuthenticationToken authenticate(String token) {
        if (token == null) {
            return null;
        }

        try {
            if (!jwtService.isValidToken(token)) {
                log.debug("Invalid JWT token");
                return null;
            }

            String email = jwtService.extractEmail(token);
            if (email == null) {
                log.warn("Email is null in JWT token");
                return null;
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            // Use email as principal (required for WebSocket user-specific messaging)
            return new UsernamePasswordAuthenticationToken(
                    email,
                    null,
                    userDetails.getAuthorities()
            );
        } catch (Exception e) {
            log.error("Authentication failed: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Verify token validity (for refresh token validation)
     * 
     * @param token JWT token
     * @param isRefreshToken true if validating refresh token
     */
    public void verifyToken(String token, boolean isRefreshToken) {
        jwtService.verifyToken(token, isRefreshToken);
    }
}
