package com.musicdashboard.dto.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
    private UserInfo user;

    @Data
    @Builder
    public static class UserInfo {
        private Long id;
        private String displayName;
        private String email;
        private String avatarUrl;
        private String login;
    }
}
