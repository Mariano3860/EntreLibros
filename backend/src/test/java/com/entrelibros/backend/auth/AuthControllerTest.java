package com.entrelibros.backend.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthControllerTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void loginWithValidCredentialsReturnsTokenAndCookie() {
        LoginRequest request = new LoginRequest("user@entrelibros.com", "correcthorsebatterystaple");
        ResponseEntity<LoginResponse> response = restTemplate.postForEntity("/auth/login", request, LoginResponse.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().token());
        assertTrue(response.getHeaders().containsKey(HttpHeaders.SET_COOKIE));
    }

    @Test
    void loginWithInvalidCredentialsReturns401() {
        LoginRequest request = new LoginRequest("user@entrelibros.com", "wrong");
        ResponseEntity<ErrorResponse> response = restTemplate.postForEntity("/auth/login", request, ErrorResponse.class);
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("auth.errors.invalid_credentials", response.getBody().message());
    }
}
