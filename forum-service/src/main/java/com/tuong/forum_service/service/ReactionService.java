package com.tuong.forum_service.service;

import com.tuong.forum_service.dto.ReactionRequest;
import com.tuong.forum_service.dto.ReactionResponse;
import com.tuong.forum_service.exception.ResourceNotFoundException;
import com.tuong.forum_service.model.Post;
import com.tuong.forum_service.model.Reaction;
import com.tuong.forum_service.repository.ReactionRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReactionService {

  private static final List<String> ALLOWED_TYPES = List.of("GIỎI", "NGU", "HAHA");

  private final ReactionRepository reactionRepository;
  private final PostService postService;

  public ReactionResponse createOrUpdate(Long postId, ReactionRequest request) {
    String normalizedType = normalizeType(request.getType());
    String normalizedUserName = normalizeUserName(request.getUserName());
    Post post = postService.findEntityById(postId);

    // Ngăn người dùng tự react bài của họ
    if (post.getUserName() != null && post.getUserName().equalsIgnoreCase(normalizedUserName)) {
      throw new IllegalArgumentException("Bạn không thể react bài của chính mình");
    }

    Reaction reaction = reactionRepository.findByPostIdAndUserName(postId, normalizedUserName)
        .orElseGet(() -> {
          Reaction newReaction = new Reaction();
          newReaction.setPost(post);
          newReaction.setUserName(normalizedUserName);
          newReaction.setLegacyUserId(UUID.randomUUID());
          return newReaction;
        });

    reaction.setType(normalizedType);
    return toResponse(reactionRepository.save(reaction));
  }

  public List<ReactionResponse> getByPost(Long postId) {
    postService.findEntityById(postId);
    return reactionRepository.findByPostId(postId)
        .stream()
        .map(this::toResponse)
        .toList();
  }

  public Map<String, Long> getSummaryByPost(Long postId) {
    postService.findEntityById(postId);
    return ALLOWED_TYPES.stream().collect(java.util.stream.Collectors.toMap(type -> type,
        type -> reactionRepository.countByPostIdAndType(postId, type)));
  }

  public void delete(Long reactionId) {
    Reaction reaction = reactionRepository.findById(reactionId)
        .orElseThrow(() -> new ResourceNotFoundException("Reaction not found with id: " + reactionId));
    reactionRepository.delete(reaction);
  }

  public void deleteByUser(Long postId, String userName) {
    String normalizedUserName = normalizeUserName(userName);
    Reaction reaction = reactionRepository.findByPostIdAndUserName(postId, normalizedUserName)
        .orElseThrow(() -> new ResourceNotFoundException("Reaction not found for user in post"));
    reactionRepository.delete(reaction);
  }

  private ReactionResponse toResponse(Reaction reaction) {
    return ReactionResponse.builder()
        .id(reaction.getId())
        .type(reaction.getType())
        .userName(reaction.getUserName())
        .build();
  }

  private String normalizeUserName(String userName) {
    if (userName == null || userName.isBlank()) {
      throw new IllegalArgumentException("User name is required");
    }
    return userName.trim();
  }

  private String normalizeType(String type) {
    if (type == null || type.isBlank()) {
      throw new IllegalArgumentException("Reaction type is required");
    }
    String normalized = type.trim().toUpperCase();
    if (!ALLOWED_TYPES.contains(normalized)) {
      throw new IllegalArgumentException("Unsupported reaction type. Allowed: " + String.join(", ", ALLOWED_TYPES));
    }
    return normalized;
  }
}
