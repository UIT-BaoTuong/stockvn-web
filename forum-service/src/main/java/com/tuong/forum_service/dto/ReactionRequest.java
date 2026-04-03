package com.tuong.forum_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReactionRequest {
  @NotBlank
  private String type;

  @NotBlank
  private String userName;
}
