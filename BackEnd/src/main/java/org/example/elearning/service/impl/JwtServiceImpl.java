package org.example.elearning.service.impl;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.experimental.NonFinal;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.UnauthorizedException;
import org.example.elearning.service.JwtService;
import org.example.elearning.service.RedisService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.function.Function;

@Service
public class JwtServiceImpl implements JwtService {
    private final RedisService redisService;
    @NonFinal
    @Value("${jwt.secret-key}")
    String secretKey;

    @NonFinal
    @Value("${jwt.valid-duration}")
    long validDuration;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    long refreshableDuration;

    public JwtServiceImpl(RedisService redisService) {
        this.redisService = redisService;
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String generateAccessToken(UserEntity user) {
        return generateAccessToken(new HashMap<>(), user);
    }

    public String generateRefreshToken(UserDetails user) {
        return generateRefreshToken(new HashMap<>(), user);
    }

    private String generateRefreshToken(Map<String, Object> claims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(claims)
                .setId(UUID.randomUUID().toString())
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(Instant.now()
                        .plus(refreshableDuration, ChronoUnit.SECONDS)
                        .toEpochMilli()))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

    }
    public Claims verifyToken(String token, boolean isRefresh) {
        try {
            // Parse và verify chữ ký
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            // Check expiry
            Date expiryTime = claims.getExpiration();
            if (expiryTime == null || expiryTime.before(new Date())) {
                throw new UnauthorizedException(ErrorCode.TOKEN_INCORRECT.getMessage());
            }

            // Check jti trong Redis
            String jti = claims.getId(); // tương đương JWT ID
            if (!isRefresh && redisService.exists(jti)) {
                throw new UnauthorizedException(ErrorCode.UNAUTHENTICATED.getMessage());
            }

            return claims;
        } catch (JwtException e) {
            throw new UnauthorizedException(ErrorCode.TOKEN_INCORRECT.getMessage());
        }
    }

    private String generateAccessToken(Map<String, Object> claims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(claims)
                .setId(UUID.randomUUID().toString())
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(Instant.now()
                        .plus(validDuration, ChronoUnit.SECONDS)
                        .toEpochMilli()))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

    }

    public boolean isValidToken(String token) {
        String email = extractEmail(token);
        try{
            Jws<Claims> claimsJws = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            Claims claims = claimsJws.getBody();
            return !claims.getExpiration().before(new Date()) && email.equals(claims.getSubject());
        }catch (Exception e){
            return false;
        }
    }



    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
