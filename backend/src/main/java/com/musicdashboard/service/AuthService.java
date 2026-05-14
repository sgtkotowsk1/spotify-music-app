package com.musicdashboard.service;

import com.musicdashboard.dto.auth.AuthResponse;
import com.musicdashboard.exception.YandexApiException;
import com.musicdashboard.model.OAuthToken;
import com.musicdashboard.model.User;
import com.musicdashboard.repository.OAuthTokenRepository;
import com.musicdashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final WebClient webClient;
    private final UserRepository userRepository;
    private final OAuthTokenRepository oAuthTokenRepository;
    private final JwtService jwtService;

    @Value("${yandex.client-id}")
    private String clientId;

    @Value("${yandex.client-secret}")
    private String clientSecret;

    @Value("${yandex.redirect-uri}")
    private String redirectUri;

    @Value("${yandex.auth-url}")
    private String authUrl;

    @Value("${yandex.token-url}")
    private String tokenUrl;

    @Value("${yandex.user-info-url}")
    private String userInfoUrl;

    public String buildAuthorizationUrl(String state) {
        return UriComponentsBuilder.fromHttpUrl(authUrl)
            .queryParam("response_type", "code")
            .queryParam("client_id", clientId)
            .queryParam("redirect_uri", redirectUri)
            .queryParam("state", state)
            .queryParam("force_confirm", "yes")
            .build()
            .toUriString();
    }

    @Transactional
    public AuthResponse exchangeCodeAndAuthenticate(String code) {
        Map<String, Object> tokenResponse = exchangeCode(code);

        String accessToken = (String) tokenResponse.get("access_token");
        String refreshToken = (String) tokenResponse.get("refresh_token");
        Integer expiresIn = (Integer) tokenResponse.get("expires_in");
        String tokenType = (String) tokenResponse.get("token_type");

        if (accessToken == null) {
            throw new YandexApiException("Failed to obtain access token from Yandex");
        }

        Map<String, Object> userInfo = fetchUserInfo(accessToken);

        String yandexId = String.valueOf(userInfo.get("id"));
        String login = (String) userInfo.get("login");
        String email = (String) userInfo.get("default_email");
        String displayName = (String) userInfo.get("display_name");
        String avatarId = (String) userInfo.get("default_avatar_id");
        String avatarUrl = avatarId != null
            ? "https://avatars.yandex.net/get-yapic/" + avatarId + "/islands-200"
            : null;

        User user = userRepository.findByYandexId(yandexId)
            .map(existing -> updateUser(existing, login, email, displayName, avatarUrl))
            .orElseGet(() -> createUser(yandexId, login, email, displayName, avatarUrl));

        saveOrUpdateToken(user, accessToken, refreshToken, tokenType, expiresIn);

        String jwtAccess = jwtService.generateAccessToken(user.getId(), user.getEmail());
        String jwtRefresh = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
            .accessToken(jwtAccess)
            .refreshToken(jwtRefresh)
            .tokenType("Bearer")
            .expiresIn(jwtService.getAccessTokenExpirationMs() / 1000)
            .user(AuthResponse.UserInfo.builder()
                .id(user.getId())
                .displayName(user.getDisplayName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .login(user.getLogin())
                .build())
            .build();
    }

    @Transactional
    public AuthResponse refreshTokens(String refreshToken) {
        if (!jwtService.isTokenValid(refreshToken)) {
            throw new YandexApiException("Invalid or expired refresh token", 401);
        }
        Long userId = jwtService.extractUserId(refreshToken);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new YandexApiException("User not found", 401));

        String jwtAccess = jwtService.generateAccessToken(user.getId(), user.getEmail());
        String jwtRefresh = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
            .accessToken(jwtAccess)
            .refreshToken(jwtRefresh)
            .tokenType("Bearer")
            .expiresIn(jwtService.getAccessTokenExpirationMs() / 1000)
            .user(AuthResponse.UserInfo.builder()
                .id(user.getId())
                .displayName(user.getDisplayName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .login(user.getLogin())
                .build())
            .build();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> exchangeCode(String code) {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "authorization_code");
        formData.add("code", code);
        formData.add("client_id", clientId);
        formData.add("client_secret", clientSecret);
        formData.add("redirect_uri", redirectUri);

        try {
            return webClient.post()
                .uri(tokenUrl)
                .body(BodyInserters.fromFormData(formData))
                .retrieve()
                .bodyToMono(Map.class)
                .block();
        } catch (Exception ex) {
            log.error("Failed to exchange code: {}", ex.getMessage());
            throw new YandexApiException("Failed to exchange authorization code");
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchUserInfo(String accessToken) {
        try {
            return webClient.get()
                .uri(userInfoUrl + "?format=json")
                .header("Authorization", "OAuth " + accessToken)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
        } catch (Exception ex) {
            log.error("Failed to fetch user info: {}", ex.getMessage());
            throw new YandexApiException("Failed to fetch user info from Yandex");
        }
    }

    private User createUser(String yandexId, String login, String email, String displayName, String avatarUrl) {
        User user = User.builder()
            .yandexId(yandexId)
            .login(login)
            .email(email)
            .displayName(displayName)
            .avatarUrl(avatarUrl)
            .build();
        return userRepository.save(user);
    }

    private User updateUser(User user, String login, String email, String displayName, String avatarUrl) {
        user.setLogin(login);
        user.setEmail(email);
        user.setDisplayName(displayName);
        user.setAvatarUrl(avatarUrl);
        return userRepository.save(user);
    }

    private void saveOrUpdateToken(User user, String accessToken, String refreshToken, String tokenType, Integer expiresIn) {
        Instant expiresAt = expiresIn != null ? Instant.now().plusSeconds(expiresIn) : null;
        oAuthTokenRepository.findByUserId(user.getId())
            .map(token -> {
                token.setAccessToken(accessToken);
                token.setRefreshToken(refreshToken);
                token.setTokenType(tokenType);
                token.setExpiresAt(expiresAt);
                return oAuthTokenRepository.save(token);
            })
            .orElseGet(() -> oAuthTokenRepository.save(
                OAuthToken.builder()
                    .user(user)
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType(tokenType)
                    .expiresAt(expiresAt)
                    .build()
            ));
    }
}
