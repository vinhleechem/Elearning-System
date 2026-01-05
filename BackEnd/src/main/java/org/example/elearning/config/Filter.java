package org.example.elearning.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.util.JwtAuthenticationHelper;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JWT authentication filter for HTTP requests.
 * Validates JWT tokens and sets up Spring Security authentication context.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class Filter extends OncePerRequestFilter {
    
    private final JwtAuthenticationHelper authHelper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        String token = authHelper.extractTokenFromHeader(authHeader);

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UsernamePasswordAuthenticationToken authentication = authHelper.authenticate(token);
            
            if (authentication != null) {
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("Authenticated user: {}", authentication.getName());
            }
        }

        filterChain.doFilter(request, response);
    }
}
