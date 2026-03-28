package com.tuong.forum_service.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserStatsResponse {
  private long postCount;
  private long reactionCount;
}
