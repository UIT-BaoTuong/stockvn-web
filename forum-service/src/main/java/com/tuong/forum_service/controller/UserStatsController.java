package com.tuong.forum_service.controller;

import com.tuong.forum_service.dto.UserStatsResponse;
import com.tuong.forum_service.service.UserStatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Stats", description = "User posting and reaction statistics")
public class UserStatsController {

  private final UserStatsService userStatsService;

  @GetMapping("/{userName}/stats")
  @Operation(summary = "Get user stats")
  public UserStatsResponse getByUserName(@PathVariable String userName) {
    return userStatsService.getByUserName(userName);
  }
}
