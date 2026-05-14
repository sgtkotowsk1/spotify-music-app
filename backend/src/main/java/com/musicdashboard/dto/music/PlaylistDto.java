package com.musicdashboard.dto.music;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PlaylistDto {
    private String id;
    private String name;
    private String description;
    private String imageUrl;
    private int totalTracks;
    private String ownerName;
    private boolean isPublic;
    private String spotifyUrl;
}
