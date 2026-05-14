package com.musicdashboard.dto.music;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TrackDto {
    private Long id;
    private String title;
    private List<ArtistDto> artists;
    private AlbumDto album;
    private Integer durationMs;
    private String coverUri;
    private Boolean available;
    private Boolean explicit;
}
