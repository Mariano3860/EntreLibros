package com.entrelibros.backend.user;

import java.util.Optional;

public interface UserRepository {
    Optional<User> findByEmail(String email);
}
