package com.tuong.forum_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ThreadRequest {
  @NotBlank
  private String title;

  @NotBlank
  private String userName;
}
