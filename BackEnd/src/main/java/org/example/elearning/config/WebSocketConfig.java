package org.example.elearning.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable a simple memory-based message broker to send messages to clients
        // Prefix /topic for broadcasting, /queue for individual messages
        config.enableSimpleBroker("/topic", "/queue");
        
        // Prefix for messages from client to server
        config.setApplicationDestinationPrefixes("/app");
        
        // CRITICAL: Set user destination prefix to use principal name (email) instead of session ID
        // This ensures messages sent to /user/{email}/queue/notifications are correctly routed
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket endpoint that clients will connect to
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Allow all origins (configure properly in production)
                .addInterceptors(new org.springframework.web.socket.server.HandshakeInterceptor() {
                    @Override
                    public boolean beforeHandshake(org.springframework.http.server.ServerHttpRequest request,
                                                 org.springframework.http.server.ServerHttpResponse response,
                                                 org.springframework.web.socket.WebSocketHandler wsHandler,
                                                 java.util.Map<String, Object> attributes) throws Exception {
                        if (request instanceof org.springframework.http.server.ServletServerHttpRequest) {
                            org.springframework.http.server.ServletServerHttpRequest servletRequest = 
                                (org.springframework.http.server.ServletServerHttpRequest) request;
                            String token = servletRequest.getServletRequest().getParameter("token");
                            System.out.println("WebSocket Handshake - Token from query: " + (token != null ? "Present" : "Missing"));
                            if (token != null) {
                                attributes.put("token", token);
                            }
                        }
                        return true;
                    }

                    @Override
                    public void afterHandshake(org.springframework.http.server.ServerHttpRequest request,
                                             org.springframework.http.server.ServerHttpResponse response,
                                             org.springframework.web.socket.WebSocketHandler wsHandler,
                                             Exception exception) {
                    }
                })
                .withSockJS(); // Enable SockJS fallback options
        
        // Also register with /api/v1 prefix for consistency with REST API
        registry.addEndpoint("/api/v1/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
    @org.springframework.beans.factory.annotation.Autowired
    private org.example.elearning.service.JwtService jwtService;

    @org.springframework.beans.factory.annotation.Autowired
    private org.example.elearning.service.UserService userService;

    @Override
    public void configureClientInboundChannel(org.springframework.messaging.simp.config.ChannelRegistration registration) {
        registration.interceptors(new org.springframework.messaging.support.ChannelInterceptor() {
            @Override
            public org.springframework.messaging.Message<?> preSend(org.springframework.messaging.Message<?> message, org.springframework.messaging.MessageChannel channel) {
                org.springframework.messaging.simp.stomp.StompHeaderAccessor accessor =
                        org.springframework.messaging.simp.stomp.StompHeaderAccessor.wrap(message);

                if (org.springframework.messaging.simp.stomp.StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String token = null;
                    
                    // Try to get token from Authorization header first
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    System.out.println("WebSocket CONNECT - Auth header: " + (authHeader != null ? "Present" : "Missing"));
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        token = authHeader.substring(7);
                    }
                    
                    // If no header, try to get from session attributes (set during handshake)
                    if (token == null) {
                        token = (String) accessor.getSessionAttributes().get("token");
                        System.out.println("WebSocket CONNECT - Token from session: " + (token != null ? "Present" : "Missing"));
                    }
                    
                    if (token != null) {
                        try {
                            String email = jwtService.extractEmail(token);
                            System.out.println("WebSocket - Extracted email: " + email);
                            if (email != null && jwtService.isValidToken(token)) {
                                org.springframework.security.core.userdetails.UserDetails userDetails = userService.userDetailsService().loadUserByUsername(email);
                                
                                // IMPORTANT: Use email string as principal, not UserDetails
                                // This is required for SimpMessagingTemplate.convertAndSendToUser() to work
                                org.springframework.security.authentication.UsernamePasswordAuthenticationToken authentication =
                                        new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                                                email, // Use email string as principal
                                                null, 
                                                userDetails.getAuthorities());
                                accessor.setUser(authentication);
                                System.out.println("✅ WebSocket Authenticated User: " + email);
                                System.out.println("✅ WebSocket Principal name: " + authentication.getName());
                            } else {
                                System.out.println("❌ WebSocket - Invalid token or email is null");
                            }
                        } catch (Exception e) {
                            // Token validation failed
                            System.out.println("❌ WebSocket Authentication failed: " + e.getMessage());
                            e.printStackTrace();
                        }
                    } else {
                        System.out.println("❌ WebSocket - No token found in header or session");
                    }
                }
                return message;
            }
        });
    }
}
