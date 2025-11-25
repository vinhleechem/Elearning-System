package org.example.elearning.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.ForbiddenException;
import org.example.elearning.exception.exceptions.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Aspect
@Component
@Slf4j
public class SecuredEndpointAspect {

    @Around("@annotation(securedEndpoint)")
    public Object checkSecuredEndpoint(ProceedingJoinPoint joinPoint, SecuredEndpoint securedEndpoint) throws Throwable {
        String requiredPermission = securedEndpoint.value();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException(ErrorCode.UNAUTHENTICATED.getMessage());
        }
        // Lấy quyền từ Authentication (set từ JwtFilter lúc login)
        Set<String> userPermissions = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
        if (!userPermissions.contains(requiredPermission)) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN.getMessage());
        }
        return joinPoint.proceed();
    }
}