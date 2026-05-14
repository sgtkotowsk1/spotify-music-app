package com.musicdashboard.dto.music;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ArtistDto {
    private String id;
    private String name;
    private String imageUrl;
    private int popularity;
    private int followersTotal;
    private List<String> genres;
    private String spotifyUrl;
}
