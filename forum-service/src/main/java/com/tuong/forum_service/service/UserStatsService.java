package com.tuong.forum_service.service;

import com.tuong.forum_service.dto.UserStatsResponse;
import com.tuong.forum_service.repository.ReactionRepository;
import com.tuong.forum_service.repository.ThreadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserStatsService {

  private final ThreadRepository threadRepository;
  private final ReactionRepository reactionRepository;

  public UserStatsResponse getByUserName(String userName) {
    String normalizedUserName = normalizeUserName(userName);
    return UserStatsResponse.builder()
        .postCount(threadRepository.countByUserNameIgnoreCase(normalizedUserName))
        .reactionCount(reactionRepository.countReactionsFromOthers(normalizedUserName))
        .build();
  }

  private String normalizeUserName(String userName) {
    if (userName == null || userName.isBlank()) {
      throw new IllegalArgumentException("User name is required");
    }
    return userName.trim();
  }
}
