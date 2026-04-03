package com.tuong.forum_service.controller;

import com.tuong.forum_service.dto.ReactionRequest;
import com.tuong.forum_service.dto.ReactionResponse;
import com.tuong.forum_service.service.ReactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Reactions", description = "Reaction on comments")
public class ReactionController {

  private final ReactionService reactionService;

  @PostMapping("/posts/{postId}/reactions")
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(summary = "Create or update reaction of current user for a comment")
  public ReactionResponse createOrUpdate(@PathVariable Long postId, @Valid @RequestBody ReactionRequest request) {
    return reactionService.createOrUpdate(postId, request);
  }

  @GetMapping("/posts/{postId}/reactions")
  @Operation(summary = "List reactions by comment")
  public List<ReactionResponse> getByPost(@PathVariable Long postId) {
    return reactionService.getByPost(postId);
  }

  @GetMapping("/posts/{postId}/reactions/summary")
  @Operation(summary = "Get reaction counters by type")
  public Map<String, Long> getSummaryByPost(@PathVariable Long postId) {
    return reactionService.getSummaryByPost(postId);
  }

  @DeleteMapping("/reactions/{reactionId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(summary = "Delete a reaction by reaction id")
  public void delete(@PathVariable Long reactionId) {
    reactionService.delete(reactionId);
  }

  @DeleteMapping("/posts/{postId}/reactions/users/{userName}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(summary = "Delete reaction of one user in a comment")
  public void deleteByUser(@PathVariable Long postId, @PathVariable String userName) {
    reactionService.deleteByUser(postId, userName);
  }
}
