package com.entrelibros.backend.auth;

import com.entrelibros.backend.user.User;
import com.entrelibros.backend.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .filter(u -> passwordEncoder.matches(request.password(), u.password()))
                .orElseThrow(InvalidCredentialsException::new);
        String token = jwtService.generateToken(user);
        UserDto dto = new UserDto(user.id(), user.email(), user.role());
        return new LoginResponse(token, dto, "auth.success.login");
    }
}
