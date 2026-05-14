package com.musicdashboard.dto.music;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AlbumDto {
    private Long id;
    private String title;
    private String coverUri;
    private List<ArtistDto> artists;
    private Integer year;
    private Integer trackCount;
    private String genre;
    private String type;
}
