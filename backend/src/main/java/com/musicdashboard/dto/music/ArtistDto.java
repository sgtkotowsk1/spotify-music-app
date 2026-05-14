package com.musicdashboard.dto.music;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ArtistDto {
    private Long id;
    private String name;
    private String coverUri;
    private List<String> genres;
    private Integer trackCount;
    private Integer albumCount;
}
