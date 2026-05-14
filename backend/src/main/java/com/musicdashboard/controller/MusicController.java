package com.musicdashboard.controller;

import com.musicdashboard.dto.music.*;
import com.musicdashboard.security.UserDetailsImpl;
import com.musicdashboard.service.SpotifyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/spotify")
@RequiredArgsConstructor
@Tag(name = "Spotify", description = "Spotify data endpoints")
@SecurityRequirement(name = "bearerAuth")
public class MusicController {

    private final SpotifyService spotifyService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<DashboardStatsDto> getDashboard(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(spotifyService.getDashboardStats(user.getId()));
    }

    @GetMapping("/top-tracks")
    @Operation(summary = "Get top tracks")
    public ResponseEntity<List<TrackDto>> getTopTracks(
        @AuthenticationPrincipal UserDetailsImpl user,
        @RequestParam(defaultValue = "short_term") String timeRange
    ) {
        return ResponseEntity.ok(spotifyService.getTopTracks(user.getId(), timeRange));
    }

    @GetMapping("/top-artists")
    @Operation(summary = "Get top artists")
    public ResponseEntity<List<ArtistDto>> getTopArtists(
        @AuthenticationPrincipal UserDetailsImpl user,
        @RequestParam(defaultValue = "short_term") String timeRange
    ) {
        return ResponseEntity.ok(spotifyService.getTopArtists(user.getId(), timeRange));
    }

    @GetMapping("/recently-played")
    @Operation(summary = "Get recently played tracks")
    public ResponseEntity<List<RecentlyPlayedDto>> getRecentlyPlayed(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(spotifyService.getRecentlyPlayed(user.getId()));
    }

    @GetMapping("/playlists")
    @Operation(summary = "Get user playlists")
    public ResponseEntity<List<PlaylistDto>> getPlaylists(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(spotifyService.getPlaylists(user.getId()));
    }
}
