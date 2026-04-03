package com.tuong.forum_service.controller;

import com.tuong.forum_service.dto.ThreadRequest;
import com.tuong.forum_service.dto.ThreadResponse;
import com.tuong.forum_service.service.ThreadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Threads", description = "Topics inside a stock category")
public class ThreadController {

  private final ThreadService threadService;

  @PostMapping("/categories/{categoryId}/threads")
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(summary = "Create thread in a category")
  public ThreadResponse create(@PathVariable Long categoryId, @Valid @RequestBody ThreadRequest request) {
    return threadService.create(categoryId, request);
  }

  @GetMapping("/categories/{categoryId}/threads")
  @Operation(summary = "List threads by category")
  public List<ThreadResponse> getByCategory(@PathVariable Long categoryId) {
    return threadService.getByCategory(categoryId);
  }

  @GetMapping("/threads/{threadId}")
  @Operation(summary = "Get thread detail")
  public ThreadResponse getById(@PathVariable Long threadId) {
    return threadService.getById(threadId);
  }

  @PutMapping("/threads/{threadId}")
  @Operation(summary = "Update thread")
  public ThreadResponse update(@PathVariable Long threadId, @Valid @RequestBody ThreadRequest request) {
    return threadService.update(threadId, request);
  }

  @DeleteMapping("/threads/{threadId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(summary = "Delete thread")
  public void delete(@PathVariable Long threadId) {
    threadService.delete(threadId);
  }

  @PostMapping("/threads/{threadId}/views")
  @Operation(summary = "Increase thread view count")
  public ThreadResponse increaseView(@PathVariable Long threadId) {
    return threadService.increaseView(threadId);
  }
}
