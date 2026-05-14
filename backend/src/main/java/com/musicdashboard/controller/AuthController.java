package com.musicdashboard.controller;

import com.musicdashboard.dto.auth.AuthResponse;
import com.musicdashboard.dto.auth.RefreshTokenRequest;
import com.musicdashboard.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Yandex OAuth2 authentication endpoints")
public class AuthController {

    private final AuthService authService;

    @Value("${frontend.url}")
    private String frontendUrl;

    @GetMapping("/yandex/authorize")
    @Operation(summary = "Get Yandex OAuth authorization URL")
    public ResponseEntity<Map<String, String>> getAuthorizationUrl() {
        String state = UUID.randomUUID().toString();
        String url = authService.buildAuthorizationUrl(state);
        return ResponseEntity.ok(Map.of("url", url, "state", state));
    }

    @GetMapping("/yandex/callback")
    @Operation(summary = "Handle Yandex OAuth callback")
    public ResponseEntity<Void> handleCallback(
        @RequestParam String code,
        @RequestParam(required = false) String state
    ) {
        AuthResponse auth = authService.exchangeCodeAndAuthenticate(code);
        String redirectUrl = frontendUrl + "/auth/callback"
            + "?accessToken=" + auth.getAccessToken()
            + "&refreshToken=" + auth.getRefreshToken()
            + "&expiresIn=" + auth.getExpiresIn();
        return ResponseEntity.status(302).location(URI.create(redirectUrl)).build();
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshTokens(request.getRefreshToken()));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout (client-side token invalidation)")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
