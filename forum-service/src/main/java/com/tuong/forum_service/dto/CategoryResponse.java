package com.tuong.forum_service.dto;

import lombok.Builder;
import lombok.Getter;


@Getter
@Builder
public class CategoryResponse {
  private Long id;
  private String name;
  private String description;
  private int displayOrder;
  private int viewCount;
  private long threadCount;
}
