package com.musicdashboard.dto.music;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DashboardStatsDto {
    private List<TrackDto> topTracks;
    private List<ArtistDto> topArtists;
    private List<RecentlyPlayedDto> recentlyPlayed;
    private int totalPlaylists;
}
