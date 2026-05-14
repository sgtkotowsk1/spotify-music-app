package com.musicdashboard.dto.user;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class UserProfileDto {
    private Long id;
    private String yandexId;
    private String email;
    private String displayName;
    private String login;
    private String avatarUrl;
    private Instant memberSince;
}
