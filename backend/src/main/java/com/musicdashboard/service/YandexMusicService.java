package com.musicdashboard.service;

import com.musicdashboard.dto.music.*;
import com.musicdashboard.exception.ResourceNotFoundException;
import com.musicdashboard.exception.YandexApiException;
import com.musicdashboard.model.OAuthToken;
import com.musicdashboard.model.User;
import com.musicdashboard.repository.OAuthTokenRepository;
import com.musicdashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import org.w3c.dom.Document;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class YandexMusicService {

    private final WebClient webClient;
    private final UserRepository userRepository;
    private final OAuthTokenRepository oAuthTokenRepository;

    private static final String DOWNLOAD_SALT = "XGRlBW9FXlekgbPrRHuSiA";

    @Value("${yandex.music-api-url}")
    private String musicApiUrl;

    @Cacheable(value = "likedTracks", key = "#userId")
    public List<TrackDto> getLikedTracks(Long userId) {
        String token = getAccessToken(userId);
        String yandexId = getYandexId(userId);
        return fetchLikedTracks(token, yandexId);
    }

    @Cacheable(value = "likedAlbums", key = "#userId")
    public List<AlbumDto> getLikedAlbums(Long userId) {
        String token = getAccessToken(userId);
        String yandexId = getYandexId(userId);
        return fetchLikedAlbums(token, yandexId);
    }

    @Cacheable(value = "likedArtists", key = "#userId")
    public List<ArtistDto> getLikedArtists(Long userId) {
        String token = getAccessToken(userId);
        String yandexId = getYandexId(userId);
        return fetchLikedArtists(token, yandexId);
    }

    @Cacheable(value = "playlists", key = "#userId")
    public List<PlaylistDto> getPlaylists(Long userId) {
        String token = getAccessToken(userId);
        String yandexId = getYandexId(userId);
        return fetchPlaylists(token, yandexId);
    }

    @Cacheable(value = "dashboard", key = "#userId")
    public DashboardStatsDto getDashboardStats(Long userId) {
        List<TrackDto> tracks = getLikedTracks(userId);
        List<AlbumDto> albums = getLikedAlbums(userId);
        List<ArtistDto> artists = getLikedArtists(userId);
        List<PlaylistDto> playlists = getPlaylists(userId);

        return DashboardStatsDto.builder()
            .totalLikedTracks(tracks.size())
            .totalLikedAlbums(albums.size())
            .totalLikedArtists(artists.size())
            .totalPlaylists(playlists.size())
            .recentTracks(tracks.stream().limit(10).collect(Collectors.toList()))
            .recentAlbums(albums.stream().limit(6).collect(Collectors.toList()))
            .topArtists(artists.stream().limit(6).collect(Collectors.toList()))
            .build();
    }

    @SuppressWarnings("unchecked")
    private List<TrackDto> fetchLikedTracks(String token, String yandexId) {
        try {
            Map<String, Object> response = webClient.get()
                .uri(musicApiUrl + "/users/" + yandexId + "/likes/tracks")
                .header("Authorization", "OAuth " + token)
                .header("X-Yandex-Music-Client", "YandexMusicAndroid/5.13")
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response == null) return Collections.emptyList();

            Map<String, Object> result = (Map<String, Object>) response.get("result");
            if (result == null) return Collections.emptyList();

            Map<String, Object> library = (Map<String, Object>) result.get("library");
            if (library == null) return Collections.emptyList();

            List<Map<String, Object>> trackEntries = (List<Map<String, Object>>) library.get("tracks");
            if (trackEntries == null || trackEntries.isEmpty()) return Collections.emptyList();

            List<String> trackIds = trackEntries.stream()
                .map(t -> {
                    Object id = t.get("id");
                    Object albumId = t.get("albumId");
                    return id != null ? id.toString() + (albumId != null ? ":" + albumId : "") : null;
                })
                .filter(Objects::nonNull)
                .limit(50)
                .collect(Collectors.toList());

            return fetchTracksByIds(token, trackIds);
        } catch (WebClientResponseException ex) {
            log.error("Failed to fetch liked tracks: HTTP {}", ex.getStatusCode());
            throw new YandexApiException("Failed to fetch liked tracks", ex.getStatusCode().value());
        } catch (Exception ex) {
            log.error("Failed to fetch liked tracks", ex);
            throw new YandexApiException("Failed to fetch liked tracks");
        }
    }

    @SuppressWarnings("unchecked")
    private List<TrackDto> fetchTracksByIds(String token, List<String> trackIds) {
        if (trackIds.isEmpty()) return Collections.emptyList();
        try {
            String ids = String.join(",", trackIds);
            Map<String, Object> response = webClient.get()
                .uri(musicApiUrl + "/tracks?track-ids=" + ids)
                .header("Authorization", "OAuth " + token)
                .header("X-Yandex-Music-Client", "YandexMusicAndroid/5.13")
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response == null) {
                return Collections.emptyList();
            }

            List<Map<String, Object>> tracks = (List<Map<String, Object>>) response.get("result");
            if (tracks == null) return Collections.emptyList();

            return tracks.stream().map(this::mapTrack).collect(Collectors.toList());
        } catch (Exception ex) {
            log.error("Failed to fetch tracks by IDs", ex);
            return Collections.emptyList();
        }
    }

    @SuppressWarnings("unchecked")
    private List<AlbumDto> fetchLikedAlbums(String token, String yandexId) {
        try {
            Map<String, Object> response = webClient.get()
                .uri(musicApiUrl + "/users/" + yandexId + "/likes/albums")
                .header("Authorization", "OAuth " + token)
                .header("X-Yandex-Music-Client", "YandexMusicAndroid/5.13")
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response == null) {
                return Collections.emptyList();
            }

            List<Map<String, Object>> result = (List<Map<String, Object>>) response.get("result");
            if (result == null) return Collections.emptyList();

            return result.stream()
                .map(entry -> {
                    Map<String, Object> album = (Map<String, Object>) entry.get("album");
                    return album != null ? mapAlbum(album) : null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        } catch (Exception ex) {
            log.error("Failed to fetch liked albums", ex);
            throw new YandexApiException("Failed to fetch liked albums");
        }
    }

    @SuppressWarnings("unchecked")
    private List<ArtistDto> fetchLikedArtists(String token, String yandexId) {
        try {
            Map<String, Object> response = webClient.get()
                .uri(musicApiUrl + "/users/" + yandexId + "/likes/artists")
                .header("Authorization", "OAuth " + token)
                .header("X-Yandex-Music-Client", "YandexMusicAndroid/5.13")
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response == null) {
                return Collections.emptyList();
            }

            List<Map<String, Object>> result = (List<Map<String, Object>>) response.get("result");
            if (result == null) return Collections.emptyList();

            return result.stream()
                .map(entry -> {
                    Map<String, Object> artist = (Map<String, Object>) entry.get("artist");
                    return artist != null ? mapArtist(artist) : null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        } catch (Exception ex) {
            log.error("Failed to fetch liked artists", ex);
            throw new YandexApiException("Failed to fetch liked artists");
        }
    }

    @SuppressWarnings("unchecked")
    private List<PlaylistDto> fetchPlaylists(String token, String yandexId) {
        try {
            Map<String, Object> response = webClient.get()
                .uri(musicApiUrl + "/users/" + yandexId + "/playlists/list")
                .header("Authorization", "OAuth " + token)
                .header("X-Yandex-Music-Client", "YandexMusicAndroid/5.13")
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response == null) {
                return Collections.emptyList();
            }

            List<Map<String, Object>> result = (List<Map<String, Object>>) response.get("result");
            if (result == null) return Collections.emptyList();

            return result.stream().map(this::mapPlaylist).collect(Collectors.toList());
        } catch (Exception ex) {
            log.error("Failed to fetch playlists", ex);
            throw new YandexApiException("Failed to fetch playlists");
        }
    }

    @SuppressWarnings("unchecked")
    private TrackDto mapTrack(Map<String, Object> t) {
        List<Map<String, Object>> artistsRaw = (List<Map<String, Object>>) t.get("artists");
        List<ArtistDto> artists = artistsRaw != null
            ? artistsRaw.stream().map(this::mapArtist).collect(Collectors.toList())
            : Collections.emptyList();

        List<Map<String, Object>> albumsRaw = (List<Map<String, Object>>) t.get("albums");
        AlbumDto album = (albumsRaw != null && !albumsRaw.isEmpty()) ? mapAlbum(albumsRaw.get(0)) : null;

        String coverUri = album != null ? album.getCoverUri() : null;

        return TrackDto.builder()
            .id(toLong(t.get("id")))
            .title((String) t.get("title"))
            .artists(artists)
            .album(album)
            .durationMs(toInt(t.get("durationMs")))
            .coverUri(coverUri)
            .available((Boolean) t.get("available"))
            .explicit(Boolean.TRUE.equals(t.get("explicit")))
            .build();
    }

    @SuppressWarnings("unchecked")
    private AlbumDto mapAlbum(Map<String, Object> a) {
        List<Map<String, Object>> artistsRaw = (List<Map<String, Object>>) a.get("artists");
        List<ArtistDto> artists = artistsRaw != null
            ? artistsRaw.stream().map(this::mapArtist).collect(Collectors.toList())
            : Collections.emptyList();

        String coverUri = buildCoverUri((String) a.get("coverUri"));

        return AlbumDto.builder()
            .id(toLong(a.get("id")))
            .title((String) a.get("title"))
            .coverUri(coverUri)
            .artists(artists)
            .year(toInt(a.get("year")))
            .trackCount(toInt(a.get("trackCount")))
            .genre((String) a.get("genre"))
            .type((String) a.get("type"))
            .build();
    }

    @SuppressWarnings("unchecked")
    private ArtistDto mapArtist(Map<String, Object> a) {
        Map<String, Object> cover = (Map<String, Object>) a.get("cover");
        String coverUri = cover != null ? buildCoverUri((String) cover.get("uri")) : null;

        List<String> genres = (List<String>) a.get("genres");

        Map<String, Object> counts = (Map<String, Object>) a.get("counts");

        return ArtistDto.builder()
            .id(toLong(a.get("id")))
            .name((String) a.get("name"))
            .coverUri(coverUri)
            .genres(genres)
            .trackCount(counts != null ? toInt(counts.get("tracks")) : null)
            .albumCount(counts != null ? toInt(counts.get("directAlbums")) : null)
            .build();
    }

    @SuppressWarnings("unchecked")
    private PlaylistDto mapPlaylist(Map<String, Object> p) {
        Map<String, Object> cover = (Map<String, Object>) p.get("cover");
        String coverUri = cover != null ? buildCoverUri((String) cover.get("uri")) : null;

        Map<String, Object> owner = (Map<String, Object>) p.get("owner");
        String ownerName = owner != null ? (String) owner.get("name") : null;

        return PlaylistDto.builder()
            .kind(toInt(p.get("kind")))
            .title((String) p.get("title"))
            .description((String) p.get("description"))
            .coverUri(coverUri)
            .trackCount(toInt(p.get("trackCount")))
            .durationMs(toLong(p.get("durationMs")))
            .isPublic(Boolean.TRUE.equals(p.get("visibility")) || "public".equals(p.get("visibility")))
            .ownerName(ownerName)
            .build();
    }

    private String buildCoverUri(String uri) {
        if (uri == null) return null;
        if (uri.startsWith("http")) return uri.replace("%%", "400x400");
        return "https://" + uri.replace("%%", "400x400");
    }

    @SuppressWarnings("unchecked")
    private String upgradeToPlusToken(String standardToken) {
        try {
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("grant_type", "x-token");
            form.add("access_token", standardToken);
            form.add("client_id", "23cabbbdc6cd418abb4b39c32c41195d");
            form.add("client_secret", "53bc75238f0c4d08a85d4154df1bf0d4");

            Map<String, Object> resp = webClient.post()
                .uri("https://mobileproxy.passport.yandex.net/1/bundle/oauth/token/by_sso_token/")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(form))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (resp != null && resp.get("access_token") != null) {
                log.info("Token upgraded to music-capable token successfully");
                return (String) resp.get("access_token");
            }
        } catch (Exception ex) {
            log.warn("Token upgrade failed, using standard token: {}", ex.getMessage());
        }
        return standardToken;
    }

    @SuppressWarnings("unchecked")
    public String getTrackStreamUrl(Long userId, Long trackId) {
        String token = upgradeToPlusToken(getAccessToken(userId));
        try {
            Map<String, Object> response = webClient.get()
                .uri(musicApiUrl + "/tracks/" + trackId + "/download-info")
                .header("Authorization", "OAuth " + token)
                .header("X-Yandex-Music-Client", "YandexMusicAndroid/5.13")
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            if (response == null) throw new YandexApiException("No download info for track " + trackId);

            List<Map<String, Object>> infos = (List<Map<String, Object>>) response.get("result");
            if (infos == null || infos.isEmpty()) throw new YandexApiException("Empty download info");

            infos.forEach(i -> log.info("download-info item: codec={} bitrate={} preview={}",
                i.get("codec"), i.get("bitrateInKbps"), i.get("preview")));

            Map<String, Object> best = infos.stream()
                .filter(i -> "mp3".equals(i.get("codec")) && !Boolean.TRUE.equals(i.get("preview")))
                .max(Comparator.comparingInt(i -> toInt(i.get("bitrateInKbps")) != null ? toInt(i.get("bitrateInKbps")) : 0))
                .or(() -> infos.stream().filter(i -> "mp3".equals(i.get("codec"))).findFirst())
                .orElseThrow(() -> new YandexApiException("No MP3 available for track " + trackId));

            String downloadInfoUrl = (String) best.get("downloadInfoUrl");
            String xml = webClient.get()
                .uri(downloadInfoUrl)
                .retrieve()
                .bodyToMono(String.class)
                .block();

            if (xml == null) throw new YandexApiException("Empty download XML for track " + trackId);
            return buildDownloadUrl(xml);
        } catch (YandexApiException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to get stream URL for track {}", trackId, ex);
            throw new YandexApiException("Failed to get stream URL");
        }
    }

    private String buildDownloadUrl(String xml) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8)));

            String host = doc.getElementsByTagName("host").item(0).getTextContent();
            String path = doc.getElementsByTagName("path").item(0).getTextContent();
            String ts   = doc.getElementsByTagName("ts").item(0).getTextContent();
            String s    = doc.getElementsByTagName("s").item(0).getTextContent();

            String toHash = DOWNLOAD_SALT + path.substring(1) + s;
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(toHash.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));

            return "https://" + host + "/get-mp3/" + sb + "/" + ts + path;
        } catch (Exception ex) {
            throw new YandexApiException("Failed to build download URL: " + ex.getMessage());
        }
    }

    private String getAccessToken(Long userId) {
        return oAuthTokenRepository.findByUserId(userId)
            .map(OAuthToken::getAccessToken)
            .orElseThrow(() -> new ResourceNotFoundException("No Yandex token found for user"));
    }

    private String getYandexId(Long userId) {
        return userRepository.findById(userId)
            .map(User::getYandexId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Long toLong(Object val) {
        if (val == null) return null;
        if (val instanceof Long l) return l;
        if (val instanceof Integer i) return i.longValue();
        if (val instanceof String s) {
            try { return Long.parseLong(s); } catch (NumberFormatException e) { return null; }
        }
        return null;
    }

    private Integer toInt(Object val) {
        if (val == null) return null;
        if (val instanceof Integer i) return i;
        if (val instanceof Long l) return l.intValue();
        if (val instanceof String s) {
            try { return Integer.parseInt(s); } catch (NumberFormatException e) { return null; }
        }
        return null;
    }
}
