package com.musicdashboard.service;

import com.musicdashboard.dto.auth.AuthResponse;
import com.musicdashboard.exception.SpotifyApiException;
import com.musicdashboard.model.OAuthToken;
import com.musicdashboard.model.User;
import com.musicdashboard.repository.OAuthTokenRepository;
import com.musicdashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final WebClient webClient;
    private final UserRepository userRepository;
    private final OAuthTokenRepository oAuthTokenRepository;
    private final JwtService jwtService;

    @Value("${spotify.client-id}")
    private String clientId;

    @Value("${spotify.client-secret}")
    private String clientSecret;

    @Value("${spotify.redirect-uri}")
    private String redirectUri;

    @Value("${spotify.auth-url}")
    private String authUrl;

    @Value("${spotify.token-url}")
    private String tokenUrl;

    @Value("${spotify.scopes}")
    private String scopes;

    public String buildAuthorizationUrl(String state) {
        return UriComponentsBuilder.fromHttpUrl(authUrl)
            .queryParam("client_id", clientId)
            .queryParam("response_type", "code")
            .queryParam("redirect_uri", redirectUri)
            .queryParam("scope", scopes)
            .queryParam("state", state)
            .queryParam("show_dialog", "false")
            .build()
            .toUriString();
    }

    @Transactional
    public AuthResponse exchangeCodeAndAuthenticate(String code) {
        Map<String, Object> tokenResponse = exchangeCode(code);

        String accessToken = (String) tokenResponse.get("access_token");
        String refreshToken = (String) tokenResponse.get("refresh_token");
        Integer expiresIn = (Integer) tokenResponse.get("expires_in");

        if (accessToken == null) {
            throw new SpotifyApiException("Failed to obtain access token from Spotify");
        }

        Map<String, Object> userInfo = fetchUserInfo(accessToken);

        String spotifyId = (String) userInfo.get("id");
        String email = (String) userInfo.get("email");
        String displayName = (String) userInfo.get("display_name");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> images = (List<Map<String, Object>>) userInfo.get("images");
        String avatarUrl = (images != null && !images.isEmpty())
            ? (String) images.get(0).get("url")
            : null;

        User user = userRepository.findBySpotifyId(spotifyId)
            .map(existing -> updateUser(existing, email, displayName, avatarUrl))
            .orElseGet(() -> createUser(spotifyId, email, displayName, avatarUrl));

        saveOrUpdateToken(user, accessToken, refreshToken, expiresIn);

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
            throw new SpotifyApiException("Invalid or expired refresh token", 401);
        }
        Long userId = jwtService.extractUserId(refreshToken);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new SpotifyApiException("User not found", 401));

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
        formData.add("redirect_uri", redirectUri);

        try {
            return webClient.post()
                .uri(tokenUrl)
                .header(HttpHeaders.AUTHORIZATION, basicAuthHeader())
                .body(BodyInserters.fromFormData(formData))
                .retrieve()
                .onStatus(status -> !status.is2xxSuccessful(), response ->
                    response.bodyToMono(String.class).defaultIfEmpty("").map(body -> {
                        log.error("Spotify token exchange error {}: {}", response.statusCode().value(), body);
                        return (Throwable) new SpotifyApiException("Token exchange " + response.statusCode().value() + ": " + body);
                    })
                )
                .bodyToMono(Map.class)
                .block();
        } catch (SpotifyApiException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to exchange code: {} {}", ex.getClass().getSimpleName(), ex.getMessage());
            throw new SpotifyApiException("Failed to exchange code: " + ex.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchUserInfo(String accessToken) {
        try {
            return webClient.get()
                .uri("https://api.spotify.com/v1/me")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header(HttpHeaders.ACCEPT, "application/json")
                .retrieve()
                .onStatus(status -> !status.is2xxSuccessful(), response ->
                    response.bodyToMono(String.class).defaultIfEmpty("").map(body -> {
                        log.error("Spotify /v1/me error {}: {}", response.statusCode().value(), body);
                        return (Throwable) new SpotifyApiException("/v1/me " + response.statusCode().value() + ": " + body);
                    })
                )
                .bodyToMono(Map.class)
                .block();
        } catch (SpotifyApiException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to fetch user info: {} {}", ex.getClass().getSimpleName(), ex.getMessage());
            throw new SpotifyApiException("Failed to fetch user info: " + ex.getMessage());
        }
    }

    private String basicAuthHeader() {
        String credentials = clientId + ":" + clientSecret;
        return "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
    }

    private User createUser(String spotifyId, String email, String displayName, String avatarUrl) {
        User user = User.builder()
            .spotifyId(spotifyId)
            .login(spotifyId)
            .email(email)
            .displayName(displayName)
            .avatarUrl(avatarUrl)
            .build();
        return userRepository.save(user);
    }

    private User updateUser(User user, String email, String displayName, String avatarUrl) {
        user.setEmail(email);
        user.setDisplayName(displayName);
        user.setAvatarUrl(avatarUrl);
        return userRepository.save(user);
    }

    private void saveOrUpdateToken(User user, String accessToken, String refreshToken, Integer expiresIn) {
        Instant expiresAt = expiresIn != null ? Instant.now().plusSeconds(expiresIn) : null;
        oAuthTokenRepository.findByUserId(user.getId())
            .map(token -> {
                token.setAccessToken(accessToken);
                if (refreshToken != null) token.setRefreshToken(refreshToken);
                token.setExpiresAt(expiresAt);
                return oAuthTokenRepository.save(token);
            })
            .orElseGet(() -> oAuthTokenRepository.save(
                OAuthToken.builder()
                    .user(user)
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresAt(expiresAt)
                    .build()
            ));
    }
}
