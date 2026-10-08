package com.bookworm.exception;

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) { super(message); }
}
