package com.musicdashboard.exception;

public class YandexApiException extends RuntimeException {
    private final int statusCode;

    public YandexApiException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public YandexApiException(String message) {
        super(message);
        this.statusCode = 502;
    }

    public int getStatusCode() {
        return statusCode;
    }
}
