package com.tuong.auth_service.dto;

import java.time.LocalDateTime;

public class UserProfile {
    private String username;
    private String email;
    private LocalDateTime registeredAt;
    private String avatarUrl;

    public UserProfile() {}
    public UserProfile(String username, String email, LocalDateTime registeredAt, String avatarUrl) {
        this.username = username;
        this.email = email;
        this.registeredAt = registeredAt;
        this.avatarUrl = avatarUrl;
    }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}