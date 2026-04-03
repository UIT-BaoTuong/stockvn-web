package com.tuong.forum_service.controller;

import com.tuong.forum_service.dto.PostRequest;
import com.tuong.forum_service.dto.PostResponse;
import com.tuong.forum_service.service.PostService;
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
@Tag(name = "Posts", description = "Comments inside thread")
public class PostController {

  private final PostService postService;

  @PostMapping("/threads/{threadId}/posts")
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(summary = "Create comment in thread")
  public PostResponse create(@PathVariable Long threadId, @Valid @RequestBody PostRequest request) {
    return postService.create(threadId, request);
  }

  @GetMapping("/threads/{threadId}/posts")
  @Operation(summary = "List comments by thread")
  public List<PostResponse> getByThread(@PathVariable Long threadId) {
    return postService.getByThread(threadId);
  }

  @PutMapping("/posts/{postId}")
  @Operation(summary = "Update comment")
  public PostResponse update(@PathVariable Long postId, @Valid @RequestBody PostRequest request) {
    return postService.update(postId, request);
  }

  @DeleteMapping("/posts/{postId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(summary = "Delete comment")
  public void delete(@PathVariable Long postId) {
    postService.delete(postId);
  }
}
