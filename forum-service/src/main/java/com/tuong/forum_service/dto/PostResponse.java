package com.tuong.forum_service.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PostResponse {
  private Long id;
  private String content;
  private String userName;
  private Long threadId;
  private LocalDateTime createdAt;
  private List<ReactionResponse> reactions;
}
