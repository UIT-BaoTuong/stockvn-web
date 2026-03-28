package com.tuong.auth_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.Map;
import com.tuong.auth_service.dto.RegisterRequest;
import com.tuong.auth_service.dto.LoginRequest;
import com.tuong.auth_service.dto.ForumStatsResponse;
import com.tuong.auth_service.dto.UpdateAvatarRequest;
import com.tuong.auth_service.dto.UserProfile;
import com.tuong.auth_service.dto.ErrorResponse;
import com.tuong.auth_service.dto.ApiResponse;
import com.tuong.auth_service.service.AuthService;
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class AuthController {

  @Autowired
  private AuthService authService;

  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
    if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Username is required"));
    }
    if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Email is required"));
    }
    if (request.getPassword() == null || request.getPassword().isEmpty()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Password is required"));
    }
    
    boolean success = authService.register(request);
    if (success) {
      return ResponseEntity.ok(new ApiResponse("success", "Registration successful"));
    } else {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("Username already exists"));
    }
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    Map<String, String> tokens = authService.login(request);
    if (tokens != null) {
      return ResponseEntity.ok(tokens);
    } else {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Invalid username or password"));
    }
  }

  @PostMapping("/logout")
  public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authorization) {
    authService.logout(authorization);
    return ResponseEntity.ok("Logout success");
  }

  @PostMapping("/refresh-token")
  public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> body) {
    String refreshToken = body.get("refreshToken");
    String newAccessToken = authService.refreshToken(refreshToken);
    if (newAccessToken != null) {
      Map<String, String> result = new HashMap<>();
      result.put("accessToken", newAccessToken);
      return ResponseEntity.ok(result);
    } else {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token");
    }
  }

  @GetMapping("/stats/forum")
  @Operation(summary = "Get forum user stats")
  public ResponseEntity<ForumStatsResponse> getForumStats() {
    return ResponseEntity.ok(authService.getForumStats());
  }

  @GetMapping("/profile")
  public ResponseEntity<?> getProfile(@RequestHeader(value = "Authorization", required = true) String authorization) {
    UserProfile profile = authService.getProfile(authorization);
    if (profile != null) {
      return ResponseEntity.ok(profile);
    } else {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
    }
  }

  @PutMapping("/profile/avatar")
  @Operation(summary = "Update current user avatar URL")
  public ResponseEntity<?> updateAvatar(
      @RequestHeader(value = "Authorization", required = true) String authorization,
      @RequestBody UpdateAvatarRequest request) {
    try {
      UserProfile profile = authService.updateAvatar(authorization, request == null ? null : request.getAvatarUrl());
      if (profile != null) {
        return ResponseEntity.ok(profile);
      }
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Invalid token"));
    } catch (IllegalArgumentException ex) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(ex.getMessage()));
    }
  }

  @PutMapping("/profile/avatar/upload")
  @Operation(summary = "Upload avatar image file for current user")
  public ResponseEntity<?> uploadAvatar(
      @RequestHeader(value = "Authorization", required = true) String authorization,
      @RequestParam("file") MultipartFile file) {
    try {
      UserProfile profile = authService.updateAvatarFile(authorization, file);
      if (profile != null) {
        return ResponseEntity.ok(profile);
      }
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Invalid token"));
    } catch (IllegalArgumentException ex) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(ex.getMessage()));
    }
  }

  @GetMapping("/avatar-files/{fileName:.+}")
  @Operation(summary = "Get avatar image file")
  public ResponseEntity<?> getAvatarFile(@PathVariable String fileName) {
    try {
      byte[] fileBytes = authService.loadAvatarFile(fileName);
      String contentType = authService.detectAvatarContentType(fileName);
      return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType)).body(fileBytes);
    } catch (IllegalArgumentException ex) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(ex.getMessage()));
    }
  }
}