package com.musicdashboard.repository;

import com.musicdashboard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findBySpotifyId(String spotifyId);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.oAuthToken WHERE u.id = :id")
    Optional<User> findByIdWithToken(Long id);
}
