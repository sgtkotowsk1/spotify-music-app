package com.musicdashboard.exception;

import lombok.Getter;

@Getter
public class SpotifyApiException extends RuntimeException {

    private final int statusCode;

    public SpotifyApiException(String message) {
        super(message);
        this.statusCode = 502;
    }

    public SpotifyApiException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
