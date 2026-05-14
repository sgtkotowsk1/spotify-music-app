package com.musicdashboard.dto.music;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RecentlyPlayedDto {
    private TrackDto track;
    private String playedAt;
}
