package com.tuong.forum_service.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReactionResponse {
  private Long id;
  private String type;
  private String userName;
}
