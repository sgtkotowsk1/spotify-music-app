package com.musicdashboard.controller;

import com.musicdashboard.dto.music.*;
import com.musicdashboard.security.UserDetailsImpl;
import com.musicdashboard.service.YandexMusicService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/music")
@RequiredArgsConstructor
@Tag(name = "Music", description = "Yandex Music data endpoints")
@SecurityRequirement(name = "bearerAuth")
public class MusicController {

    private final YandexMusicService yandexMusicService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<DashboardStatsDto> getDashboard(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(yandexMusicService.getDashboardStats(user.getId()));
    }

    @GetMapping("/tracks/liked")
    @Operation(summary = "Get liked tracks")
    public ResponseEntity<List<TrackDto>> getLikedTracks(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(yandexMusicService.getLikedTracks(user.getId()));
    }

    @GetMapping("/albums/liked")
    @Operation(summary = "Get liked albums")
    public ResponseEntity<List<AlbumDto>> getLikedAlbums(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(yandexMusicService.getLikedAlbums(user.getId()));
    }

    @GetMapping("/artists/liked")
    @Operation(summary = "Get liked artists")
    public ResponseEntity<List<ArtistDto>> getLikedArtists(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(yandexMusicService.getLikedArtists(user.getId()));
    }

    @GetMapping("/playlists")
    @Operation(summary = "Get user playlists")
    public ResponseEntity<List<PlaylistDto>> getPlaylists(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(yandexMusicService.getPlaylists(user.getId()));
    }

    @GetMapping("/tracks/{trackId}/stream-url")
    @Operation(summary = "Get playback stream URL for a track")
    public ResponseEntity<TrackStreamUrlDto> getTrackStreamUrl(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long trackId) {
        String url = yandexMusicService.getTrackStreamUrl(user.getId(), trackId);
        return ResponseEntity.ok(TrackStreamUrlDto.builder().trackId(trackId).url(url).build());
    }
}
