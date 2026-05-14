package com.musicdashboard.dto.music;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PlaylistDto {
    private Integer kind;
    private String title;
    private String description;
    private String coverUri;
    private Integer trackCount;
    private Long durationMs;
    private Boolean isPublic;
    private String ownerName;
    private List<TrackDto> tracks;
}
