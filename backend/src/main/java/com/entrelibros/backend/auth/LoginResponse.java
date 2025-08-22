package com.entrelibros.backend.auth;

public record LoginResponse(String token, UserDto user, String message) {}
