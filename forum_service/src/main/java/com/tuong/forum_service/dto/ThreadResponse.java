package com.tuong.forum_service.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ThreadResponse {
  private Long id;
  private String title;
  private String userName;
  private Long categoryId;
  private String categoryName;
  private int viewCount;
  private LocalDateTime createdAt;
}
