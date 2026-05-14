package com.musicdashboard.dto.music;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AlbumDto {
    private String id;
    private String name;
    private String imageUrl;
    private String releaseDate;
    private int totalTracks;
    private String spotifyUrl;
    private List<ArtistDto> artists;
}
