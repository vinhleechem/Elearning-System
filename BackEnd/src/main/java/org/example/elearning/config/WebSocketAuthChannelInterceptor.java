package org.example.elearning.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.util.JwtAuthenticationHelper;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

/**
 * WebSocket authentication interceptor that validates JWT tokens
 * and sets up Spring Security authentication for WebSocket connections.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtAuthenticationHelper authHelper;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = resolveToken(accessor);

            if (token != null) {
                UsernamePasswordAuthenticationToken authentication = authHelper.authenticate(token);
                
                if (authentication != null) {
                    accessor.setUser(authentication);
                    log.debug("WebSocket authenticated: {}", authentication.getName());
                } else {
                    log.warn("WebSocket authentication failed");
                }
            } else {
                log.debug("WebSocket connection without token");
            }
        }

        return message;
    }

    /**
     * Resolve JWT token from Authorization header or session attributes
     */
    private String resolveToken(StompHeaderAccessor accessor) {
        // Try Authorization header first
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        String token = authHelper.extractTokenFromHeader(authHeader);
        
        if (token != null) {
            return token;
        }

        // Fallback to session attributes (set during handshake)
        if (accessor.getSessionAttributes() != null) {
            return (String) accessor.getSessionAttributes().get("token");
        }

        return null;
    }
}
