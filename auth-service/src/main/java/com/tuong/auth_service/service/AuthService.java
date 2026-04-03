package com.tuong.auth_service.service;

import com.tuong.auth_service.dto.RegisterRequest;
import com.tuong.auth_service.dto.LoginRequest;
import com.tuong.auth_service.dto.ForumStatsResponse;
import com.tuong.auth_service.dto.UserProfile;
import com.tuong.auth_service.entity.User;
import com.tuong.auth_service.repository.UserRepository;
import com.tuong.auth_service.util.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class AuthService {
    private static final Duration ONLINE_WINDOW = Duration.ofMinutes(5);
    private static final long MAX_AVATAR_SIZE_BYTES = 5L * 1024L * 1024L;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        MediaType.IMAGE_JPEG_VALUE,
        MediaType.IMAGE_PNG_VALUE,
        "image/webp",
        "image/gif"
    );

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Value("${avatar.upload-dir:./uploads/avatars}")
    private String avatarUploadDir;

    private final Map<String, Instant> onlineUsers = new ConcurrentHashMap<>();

    public boolean register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) return false;
        User user = new User(request.getUsername(), request.getPassword(), request.getEmail());
        userRepository.save(user);
        return true;
    }

    public Map<String, String> login(LoginRequest request) {
        Optional<User> user = userRepository.findByUsername(request.getUsername());
        if (user.isPresent() && user.get().getPassword().equals(request.getPassword())) {
            Map<String, String> tokens = new HashMap<>();
            String accessToken = jwtTokenProvider.generateAccessToken(request.getUsername());
            String refreshToken = jwtTokenProvider.generateRefreshToken(request.getUsername());
            tokens.put("accessToken", accessToken);
            tokens.put("refreshToken", refreshToken);
            markUserOnline(request.getUsername());
            return tokens;
        }
        return null;
    }

    public void logout(String authorization) {
        extractUsernameFromAuthorization(authorization).ifPresent(onlineUsers::remove);
    }

    public ForumStatsResponse getForumStats() {
        cleanupOfflineUsers();
        long totalUsers = userRepository.count();
        long onlineUsersCount = Math.min(totalUsers, (long) onlineUsers.size());
        return new ForumStatsResponse(totalUsers, onlineUsersCount);
    }

    public String refreshToken(String refreshToken) {
        if (refreshToken != null && jwtTokenProvider.validateToken(refreshToken)) {
            String username = jwtTokenProvider.getUsernameFromToken(refreshToken);
            if (username != null) {
                return jwtTokenProvider.generateAccessToken(username);
            }
        }
        return null;
    }

    public UserProfile getProfile(String authorization) {
        Optional<User> user = getUserFromAuthorization(authorization);
        if (user.isEmpty()) {
            return null;
        }

        User currentUser = user.get();
        return new UserProfile(
            currentUser.getUsername(),
            currentUser.getEmail(),
            currentUser.getCreatedAt(),
            currentUser.getAvatarUrl()
        );
    }

    public UserProfile updateAvatar(String authorization, String avatarUrl) {
        Optional<User> user = getUserFromAuthorization(authorization);
        if (user.isEmpty()) {
            return null;
        }

        String normalizedAvatar = avatarUrl == null ? null : avatarUrl.trim();
        if (normalizedAvatar != null && normalizedAvatar.length() > 1000) {
            throw new IllegalArgumentException("Avatar URL is too long");
        }

        User currentUser = user.get();
        currentUser.setAvatarUrl((normalizedAvatar == null || normalizedAvatar.isEmpty()) ? null : normalizedAvatar);
        User saved = userRepository.save(currentUser);

        return new UserProfile(
            saved.getUsername(),
            saved.getEmail(),
            saved.getCreatedAt(),
            saved.getAvatarUrl()
        );
    }

    public UserProfile updateAvatarFile(String authorization, MultipartFile file) {
        Optional<User> user = getUserFromAuthorization(authorization);
        if (user.isEmpty()) {
            return null;
        }

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Avatar file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Only JPG, PNG, WEBP, GIF images are allowed");
        }

        if (file.getSize() > MAX_AVATAR_SIZE_BYTES) {
            throw new IllegalArgumentException("Avatar file is too large (max 5MB)");
        }

        User currentUser = user.get();
        String extension = resolveFileExtension(contentType);
        String fileName = currentUser.getUsername() + "_" + Instant.now().toEpochMilli() + extension;
        Path uploadDir = Paths.get(avatarUploadDir).toAbsolutePath().normalize();
        Path targetFile = uploadDir.resolve(fileName);

        try {
            Files.createDirectories(uploadDir);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Could not store avatar file");
        }

        String avatarUrl = "/auth/avatar-files/" + fileName;
        currentUser.setAvatarUrl(avatarUrl);
        User saved = userRepository.save(currentUser);

        return new UserProfile(
            saved.getUsername(),
            saved.getEmail(),
            saved.getCreatedAt(),
            saved.getAvatarUrl()
        );
    }

    public byte[] loadAvatarFile(String fileName) {
        if (!StringUtils.hasText(fileName) || fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            throw new IllegalArgumentException("Invalid avatar file");
        }

        Path uploadDir = Paths.get(avatarUploadDir).toAbsolutePath().normalize();
        Path targetFile = uploadDir.resolve(fileName).normalize();

        if (!targetFile.startsWith(uploadDir)) {
            throw new IllegalArgumentException("Invalid avatar file path");
        }

        try {
            if (!Files.exists(targetFile) || !Files.isRegularFile(targetFile)) {
                throw new IllegalArgumentException("Avatar not found");
            }
            return Files.readAllBytes(targetFile);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Could not read avatar file");
        }
    }

    public String detectAvatarContentType(String fileName) {
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return MediaType.IMAGE_JPEG_VALUE;
        }
        if (lower.endsWith(".png")) {
            return MediaType.IMAGE_PNG_VALUE;
        }
        if (lower.endsWith(".webp")) {
            return "image/webp";
        }
        if (lower.endsWith(".gif")) {
            return "image/gif";
        }
        return MediaType.APPLICATION_OCTET_STREAM_VALUE;
    }

    private String resolveFileExtension(String contentType) {
        return switch (contentType.toLowerCase()) {
            case MediaType.IMAGE_JPEG_VALUE -> ".jpg";
            case MediaType.IMAGE_PNG_VALUE -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".bin";
        };
    }

    private Optional<User> getUserFromAuthorization(String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.replace("Bearer ", "");
            if (jwtTokenProvider.validateToken(token)) {
                String username = jwtTokenProvider.getUsernameFromToken(token);
                if (username != null) {
                    markUserOnline(username);
                    return userRepository.findByUsername(username);
                }
            }
        }
        return Optional.empty();
    }

    private Optional<String> extractUsernameFromAuthorization(String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            String token = authorization.replace("Bearer ", "");
            if (jwtTokenProvider.validateToken(token)) {
                String username = jwtTokenProvider.getUsernameFromToken(token);
                return Optional.ofNullable(username);
            }
        }
        return Optional.empty();
    }

    private void markUserOnline(String username) {
        if (username != null && !username.isBlank()) {
            onlineUsers.put(username.trim().toLowerCase(), Instant.now());
            cleanupOfflineUsers();
        }
    }

    private void cleanupOfflineUsers() {
        Instant threshold = Instant.now().minus(ONLINE_WINDOW);
        onlineUsers.entrySet().removeIf(entry -> entry.getValue().isBefore(threshold));
    }
}
