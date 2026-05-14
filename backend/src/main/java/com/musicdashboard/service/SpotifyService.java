package com.musicdashboard.service;

import com.musicdashboard.dto.music.*;
import com.musicdashboard.exception.SpotifyApiException;
import com.musicdashboard.model.OAuthToken;
import com.musicdashboard.repository.OAuthTokenRepository;
import com.musicdashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpotifyService {

    private final WebClient webClient;
    private final OAuthTokenRepository oAuthTokenRepository;
    private final UserRepository userRepository;

    @Value("${spotify.client-id}")
    private String clientId;

    @Value("${spotify.client-secret}")
    private String clientSecret;

    @Value("${spotify.token-url}")
    private String tokenUrl;

    @Value("${spotify.api-url}")
    private String apiUrl;

    public DashboardStatsDto getDashboardStats(Long userId) {
        String token = getValidToken(userId);
        List<TrackDto> topTracks = fetchTopTracks(token, "short_term", 5);
        List<ArtistDto> topArtists = fetchTopArtists(token, "short_term", 5);
        List<RecentlyPlayedDto> recentlyPlayed = fetchRecentlyPlayed(token, 10);
        List<PlaylistDto> playlists = fetchPlaylists(token);

        return DashboardStatsDto.builder()
            .topTracks(topTracks)
            .topArtists(topArtists)
            .recentlyPlayed(recentlyPlayed)
            .totalPlaylists(playlists.size())
            .build();
    }

    public List<TrackDto> getTopTracks(Long userId, String timeRange) {
        return fetchTopTracks(getValidToken(userId), timeRange, 50);
    }

    public List<ArtistDto> getTopArtists(Long userId, String timeRange) {
        return fetchTopArtists(getValidToken(userId), timeRange, 50);
    }

    public List<RecentlyPlayedDto> getRecentlyPlayed(Long userId) {
        return fetchRecentlyPlayed(getValidToken(userId), 50);
    }

    public List<PlaylistDto> getPlaylists(Long userId) {
        return fetchPlaylists(getValidToken(userId));
    }

    @SuppressWarnings("unchecked")
    private List<TrackDto> fetchTopTracks(String token, String timeRange, int limit) {
        try {
            Map<String, Object> response = webClient.get()
                .uri(apiUrl + "/v1/me/top/tracks?time_range={tr}&limit={l}", timeRange, limit)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response == null) return Collections.emptyList();
            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");
            if (items == null) return Collections.emptyList();

            return items.stream().map(this::mapTrack).collect(Collectors.toList());
        } catch (Exception ex) {
            log.error("Failed to fetch top tracks: {}", ex.getMessage());
            throw new SpotifyApiException("Failed to fetch top tracks");
        }
    }

    @SuppressWarnings("unchecked")
    private List<ArtistDto> fetchTopArtists(String token, String timeRange, int limit) {
        try {
            Map<String, Object> response = webClient.get()
                .uri(apiUrl + "/v1/me/top/artists?time_range={tr}&limit={l}", timeRange, limit)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response == null) return Collections.emptyList();
            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");
            if (items == null) return Collections.emptyList();

            return items.stream().map(this::mapArtist).collect(Collectors.toList());
        } catch (Exception ex) {
            log.error("Failed to fetch top artists: {}", ex.getMessage());
            throw new SpotifyApiException("Failed to fetch top artists");
        }
    }

    @SuppressWarnings("unchecked")
    private List<RecentlyPlayedDto> fetchRecentlyPlayed(String token, int limit) {
        try {
            Map<String, Object> response = webClient.get()
                .uri(apiUrl + "/v1/me/player/recently-played?limit={l}", limit)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response == null) return Collections.emptyList();
            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");
            if (items == null) return Collections.emptyList();

            return items.stream().map(item -> RecentlyPlayedDto.builder()
                .track(mapTrack((Map<String, Object>) item.get("track")))
                .playedAt((String) item.get("played_at"))
                .build()
            ).collect(Collectors.toList());
        } catch (Exception ex) {
            log.error("Failed to fetch recently played: {}", ex.getMessage());
            throw new SpotifyApiException("Failed to fetch recently played");
        }
    }

    @SuppressWarnings("unchecked")
    private List<PlaylistDto> fetchPlaylists(String token) {
        try {
            Map<String, Object> response = webClient.get()
                .uri(apiUrl + "/v1/me/playlists?limit=50")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response == null) return Collections.emptyList();
            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");
            if (items == null) return Collections.emptyList();

            return items.stream().map(this::mapPlaylist).collect(Collectors.toList());
        } catch (Exception ex) {
            log.error("Failed to fetch playlists: {}", ex.getMessage());
            throw new SpotifyApiException("Failed to fetch playlists");
        }
    }

    @SuppressWarnings("unchecked")
    private TrackDto mapTrack(Map<String, Object> item) {
        Map<String, Object> album = (Map<String, Object>) item.get("album");
        List<Map<String, Object>> artists = (List<Map<String, Object>>) item.get("artists");
        Map<String, String> externalUrls = (Map<String, String>) item.get("external_urls");

        return TrackDto.builder()
            .id((String) item.get("id"))
            .name((String) item.get("name"))
            .durationMs(((Number) item.getOrDefault("duration_ms", 0)).intValue())
            .popularity(((Number) item.getOrDefault("popularity", 0)).intValue())
            .spotifyUrl(externalUrls != null ? externalUrls.get("spotify") : null)
            .album(album != null ? mapAlbum(album) : null)
            .artists(artists != null ? artists.stream().map(this::mapArtistSimple).collect(Collectors.toList()) : Collections.emptyList())
            .build();
    }

    @SuppressWarnings("unchecked")
    private AlbumDto mapAlbum(Map<String, Object> item) {
        List<Map<String, Object>> images = (List<Map<String, Object>>) item.get("images");
        List<Map<String, Object>> artists = (List<Map<String, Object>>) item.get("artists");
        Map<String, String> externalUrls = (Map<String, String>) item.get("external_urls");
        String imageUrl = (images != null && !images.isEmpty()) ? (String) images.get(0).get("url") : null;

        return AlbumDto.builder()
            .id((String) item.get("id"))
            .name((String) item.get("name"))
            .imageUrl(imageUrl)
            .releaseDate((String) item.get("release_date"))
            .totalTracks(((Number) item.getOrDefault("total_tracks", 0)).intValue())
            .spotifyUrl(externalUrls != null ? externalUrls.get("spotify") : null)
            .artists(artists != null ? artists.stream().map(this::mapArtistSimple).collect(Collectors.toList()) : Collections.emptyList())
            .build();
    }

    @SuppressWarnings("unchecked")
    private ArtistDto mapArtist(Map<String, Object> item) {
        List<Map<String, Object>> images = (List<Map<String, Object>>) item.get("images");
        List<String> genres = (List<String>) item.get("genres");
        Map<String, Object> followers = (Map<String, Object>) item.get("followers");
        Map<String, String> externalUrls = (Map<String, String>) item.get("external_urls");
        String imageUrl = (images != null && !images.isEmpty()) ? (String) images.get(0).get("url") : null;
        int followersTotal = followers != null ? ((Number) followers.getOrDefault("total", 0)).intValue() : 0;

        return ArtistDto.builder()
            .id((String) item.get("id"))
            .name((String) item.get("name"))
            .imageUrl(imageUrl)
            .popularity(((Number) item.getOrDefault("popularity", 0)).intValue())
            .followersTotal(followersTotal)
            .genres(genres != null ? genres : Collections.emptyList())
            .spotifyUrl(externalUrls != null ? externalUrls.get("spotify") : null)
            .build();
    }

    @SuppressWarnings("unchecked")
    private ArtistDto mapArtistSimple(Map<String, Object> item) {
        Map<String, String> externalUrls = (Map<String, String>) item.get("external_urls");
        return ArtistDto.builder()
            .id((String) item.get("id"))
            .name((String) item.get("name"))
            .spotifyUrl(externalUrls != null ? externalUrls.get("spotify") : null)
            .genres(Collections.emptyList())
            .build();
    }

    @SuppressWarnings("unchecked")
    private PlaylistDto mapPlaylist(Map<String, Object> item) {
        List<Map<String, Object>> images = (List<Map<String, Object>>) item.get("images");
        Map<String, Object> tracks = (Map<String, Object>) item.get("tracks");
        Map<String, Object> owner = (Map<String, Object>) item.get("owner");
        Map<String, String> externalUrls = (Map<String, String>) item.get("external_urls");
        String imageUrl = (images != null && !images.isEmpty()) ? (String) images.get(0).get("url") : null;

        return PlaylistDto.builder()
            .id((String) item.get("id"))
            .name((String) item.get("name"))
            .description((String) item.getOrDefault("description", ""))
            .imageUrl(imageUrl)
            .totalTracks(tracks != null ? ((Number) tracks.getOrDefault("total", 0)).intValue() : 0)
            .ownerName(owner != null ? (String) owner.get("display_name") : null)
            .isPublic(Boolean.TRUE.equals(item.get("public")))
            .spotifyUrl(externalUrls != null ? externalUrls.get("spotify") : null)
            .build();
    }

    @Transactional
    private String getValidToken(Long userId) {
        OAuthToken token = oAuthTokenRepository.findByUserId(userId)
            .orElseThrow(() -> new SpotifyApiException("No Spotify token found for user", 401));

        if (token.getExpiresAt() != null && Instant.now().isAfter(token.getExpiresAt().minusSeconds(60))) {
            return refreshSpotifyToken(token);
        }
        return token.getAccessToken();
    }

    @SuppressWarnings("unchecked")
    private String refreshSpotifyToken(OAuthToken token) {
        if (token.getRefreshToken() == null) {
            throw new SpotifyApiException("No refresh token available", 401);
        }

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "refresh_token");
        formData.add("refresh_token", token.getRefreshToken());

        String credentials = clientId + ":" + clientSecret;
        String basicAuth = "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));

        try {
            Map<String, Object> response = webClient.post()
                .uri(tokenUrl)
                .header(HttpHeaders.AUTHORIZATION, basicAuth)
                .body(BodyInserters.fromFormData(formData))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response == null || response.get("access_token") == null) {
                throw new SpotifyApiException("Failed to refresh Spotify token");
            }

            String newAccessToken = (String) response.get("access_token");
            Integer expiresIn = ((Number) response.getOrDefault("expires_in", 3600)).intValue();

            token.setAccessToken(newAccessToken);
            token.setExpiresAt(Instant.now().plusSeconds(expiresIn));
            oAuthTokenRepository.save(token);

            return newAccessToken;
        } catch (SpotifyApiException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to refresh token: {}", ex.getMessage());
            throw new SpotifyApiException("Failed to refresh Spotify token");
        }
    }
}
