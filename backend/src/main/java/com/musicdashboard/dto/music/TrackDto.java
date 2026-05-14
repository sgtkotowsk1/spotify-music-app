package com.musicdashboard.dto.music;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TrackDto {
    private String id;
    private String name;
    private int durationMs;
    private int popularity;
    private String spotifyUrl;
    private AlbumDto album;
    private List<ArtistDto> artists;
}
