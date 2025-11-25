package org.example.elearning.service.impl;

import io.jsonwebtoken.Claims;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.constant.PredefinedRole;
import org.example.elearning.dto.request.*;
import org.example.elearning.dto.response.*;
import org.example.elearning.entity.RefreshTokenEntity;
import org.example.elearning.entity.RoleEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.enums.UserStatus;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.ResourceConflictException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.exception.exceptions.UnauthorizedException;
import org.example.elearning.mapper.RoleMapper;
import org.example.elearning.mapper.UserMapper;
import org.example.elearning.repository.RefreshTokenRepository;
import org.example.elearning.repository.UserRepository;
import org.example.elearning.repository.httpclient.OutboundAuthClient;
import org.example.elearning.repository.httpclient.OutboundUserClient;
import org.example.elearning.service.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationServiceImpl implements AuthenticationService {
    UserService userService;
    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    RoleService roleService;
    OutboundAuthClient outboundAuthClient;
    OutboundUserClient outboundUserClient;
    JwtService jwtService;
    RedisService redisService;
    RefreshTokenRepository refreshTokenRepository;
    RefreshTokenService refreshTokenService;

    @NonFinal
    @Value("${outbound.identity.client-id}")
    String clientId;

    @NonFinal
    @Value("${outbound.identity.redirect-uri}")
    String redirectUri;

    @NonFinal
    @Value("${outbound.identity.client-secret}")
    String clientSecret;

    static final String GRANT_TYPE = "authorization_code";

    static final String RESPONSE_FORMAT = "json";

    @Override
    public UserResponse register(RegisterRequest userRegisterRequest) {
        if (userRepository.existsByEmail(userRegisterRequest.getEmail())) {
            throw new ResourceConflictException(ErrorCode.USER_ALREADY_EXISTS.getMessage());
        }
        RoleEntity roleEntity = roleService.findByRoleName(PredefinedRole.ROLE_STUDENT);
        UserEntity userEntity = UserEntity.builder()
                .email(userRegisterRequest.getEmail())
                .fullName(userRegisterRequest.getFullName())
                .passwordHash(passwordEncoder.encode(userRegisterRequest.getPassword()))
                .roles(Set.of(roleEntity))
                .build();
        userRepository.save(userEntity);
        return userMapper.toEntityDTO(userEntity);
    }

    @Override
    public UserResponse.UserLoginResponse login(UserLoginRequest userLoginRequest) {
        UserEntity user = userService.getActiveUser(userLoginRequest.getEmail());
        boolean authenticated = passwordEncoder.matches(userLoginRequest.getPassword(), user.getPasswordHash());
        if (!authenticated) {
            throw new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS.getMessage());
        }
        String accessToken = jwtService.generateAccessToken(user);
        RefreshTokenEntity refreshToken = refreshTokenService.createRefreshToken(user);

        return UserResponse.UserLoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .build();
    }

    @Override
    @Transactional
    public void logout(LogoutRequest logoutRequest) {
        String accessToken = logoutRequest.getAccessToken();
        String refreshToken = logoutRequest.getRefreshToken();

        RefreshTokenEntity refreshTokenEntity = refreshTokenService.findByToken(refreshToken);

        Claims claims = jwtService.verifyToken(accessToken, false);
        Date expiryTime = claims.getExpiration();
        long ttl = (expiryTime.getTime() - System.currentTimeMillis()) / 1000;
        String jwtId = claims.getId();
        redisService.save(jwtId, accessToken, ttl, TimeUnit.SECONDS);

        refreshTokenRepository.delete(refreshTokenEntity);
    }

    public UserResponse.UserLoginResponse outboundAuthentication(String code) {
        // Gửi yêu cầu lấy access token từ Google (qua OutboundAuthClient)
        ExchangeTokenRequest request = ExchangeTokenRequest.builder()
                .code(code)
                .clientId(clientId)
                .clientSecret(clientSecret)
                .redirectUri(redirectUri)
                .grantType(GRANT_TYPE)
                .build();
        ExchangeTokenResponse response = outboundAuthClient.exchangeToken(request);

        // Gửi yêu cầu lấy thông tin user từ Google (qua OutboundUserClient)
        var userInfo = outboundUserClient.getUserInfor(RESPONSE_FORMAT, response.getAccessToken());

        UserEntity userEntity = userRepository.findByEmail(userInfo.getEmail())
                .map(existing -> {
                    if (existing.isDeleted()) {
                        throw new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND.getMessage());
                    }
                    if (existing.getStatus() == UserStatus.LOCKED) {
                        throw new ResourceConflictException(ErrorCode.USER_LOCKED.getMessage());
                    }
                    return existing;
                }).orElseGet(() -> {
                    RoleEntity roleEntity = roleService.findByRoleName(PredefinedRole.ROLE_STUDENT);
                    return userRepository.save(UserEntity.builder()
                            .email(userInfo.getEmail())
                            .fullName(userInfo.getFamilyName() + " " + userInfo.getGivenName())
                            .passwordHash(passwordEncoder.encode(generateRandomPassword()))
                            .status(UserStatus.ACTIVE)
                            .avatarUrl(userInfo.getPicture())
                            .roles(Set.of(roleEntity))
                            .build());
                });

        String accessToken = jwtService.generateAccessToken(userEntity);
        RefreshTokenEntity refreshTokenEntity = refreshTokenService.createRefreshToken(userEntity);

        return UserResponse.UserLoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenEntity.getToken()) // lấy từ DB
                .build();
    }

    @Override
    public RefreshTokenResponse refreshToken(RefreshTokenRequest request) {
        return refreshTokenService.refreshToken(request.getToken());
    }
    @Override
    public IntrospectResponse introspect(IntrospectRequest introspectRequest) {
        String token = introspectRequest.getToken();
        boolean isValid = true;

        try {
            Claims claims = jwtService.verifyToken(token, false);
            String jti = claims.getId();
            String blacklistedToken = redisService.get(jti);
            if (blacklistedToken != null) {
                isValid = false;
            }
        } catch (UnauthorizedException e) {
            isValid = false;
        }

        return IntrospectResponse.builder()
                .valid(isValid)
                .build();
    }

    private String generateRandomPassword() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}