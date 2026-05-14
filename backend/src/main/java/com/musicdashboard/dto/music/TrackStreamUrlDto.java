package com.musicdashboard.dto.music;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TrackStreamUrlDto {
    private Long trackId;
    private String url;
}
