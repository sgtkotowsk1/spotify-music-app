package com.musicdashboard.service;

import com.musicdashboard.dto.user.UserProfileDto;
import com.musicdashboard.exception.ResourceNotFoundException;
import com.musicdashboard.model.User;
import com.musicdashboard.repository.UserRepository;
import com.musicdashboard.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserDetailsImpl loadUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return new UserDetailsImpl(user);
    }

    @Transactional(readOnly = true)
    public UserProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toProfileDto(user);
    }

    @Transactional(readOnly = true)
    public User getById(Long userId) {
        return userRepository.findByIdWithToken(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private UserProfileDto toProfileDto(User user) {
        return UserProfileDto.builder()
            .id(user.getId())
            .yandexId(user.getYandexId())
            .email(user.getEmail())
            .displayName(user.getDisplayName())
            .login(user.getLogin())
            .avatarUrl(user.getAvatarUrl())
            .memberSince(user.getCreatedAt())
            .build();
    }
}
