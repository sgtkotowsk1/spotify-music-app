package com.musicdashboard.dto.music;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DashboardStatsDto {
    private int totalLikedTracks;
    private int totalLikedAlbums;
    private int totalLikedArtists;
    private int totalPlaylists;
    private List<TrackDto> recentTracks;
    private List<ArtistDto> topArtists;
    private List<AlbumDto> recentAlbums;
}
