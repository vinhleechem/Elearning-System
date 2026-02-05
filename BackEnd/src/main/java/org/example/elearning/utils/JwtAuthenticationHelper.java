package org.example.elearning.utils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.service.JwtService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;


@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationHelper {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;


    public String extractTokenFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }


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

}
