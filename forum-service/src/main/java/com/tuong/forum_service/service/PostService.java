package com.tuong.forum_service.service;

import com.tuong.forum_service.dto.PostRequest;
import com.tuong.forum_service.dto.PostResponse;
import com.tuong.forum_service.dto.ReactionResponse;
import com.tuong.forum_service.exception.ResourceNotFoundException;
import com.tuong.forum_service.model.Post;
import com.tuong.forum_service.model.Reaction;
import com.tuong.forum_service.model.Thread;
import com.tuong.forum_service.repository.PostRepository;
import com.tuong.forum_service.repository.ReactionRepository;
import com.tuong.forum_service.repository.ThreadRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostService {

  private final PostRepository postRepository;
  private final ReactionRepository reactionRepository;
  private final ThreadRepository threadRepository;

  public PostResponse create(Long threadId, PostRequest request) {
    Thread thread = findThreadById(threadId);

    Post post = new Post();
    post.setThread(thread);
    post.setContent(request.getContent().trim());
    post.setUserName(request.getUserName().trim());
    post.setLegacyUserId(UUID.randomUUID());

    return toResponse(postRepository.save(post));
  }

  public List<PostResponse> getByThread(Long threadId) {
    findThreadById(threadId);
    return postRepository.findByThreadIdOrderByCreatedAtAsc(threadId)
        .stream()
        .map(this::toResponse)
        .toList();
  }

  public PostResponse update(Long postId, PostRequest request) {
    Post post = findEntityById(postId);
    post.setContent(request.getContent().trim());
    post.setUserName(request.getUserName().trim());
    return toResponse(postRepository.save(post));
  }

  @Transactional
  public void delete(Long postId) {
    Post post = findEntityById(postId);
    reactionRepository.deleteAll(reactionRepository.findByPostId(postId));
    postRepository.delete(post);
  }

  @Transactional
  public void deleteByThreadId(Long threadId) {
    List<Post> posts = postRepository.findByThreadIdOrderByCreatedAtAsc(threadId);
    for (Post post : posts) {
      reactionRepository.deleteAll(reactionRepository.findByPostId(post.getId()));
    }
    postRepository.deleteAll(posts);
  }

  public Post findEntityById(Long postId) {
    return postRepository.findById(postId)
        .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));
  }

  private Thread findThreadById(Long threadId) {
    return threadRepository.findById(threadId)
        .orElseThrow(() -> new ResourceNotFoundException("Thread not found with id: " + threadId));
  }

  private PostResponse toResponse(Post post) {
    List<ReactionResponse> reactions = reactionRepository.findByPostId(post.getId())
        .stream()
        .map(this::toReactionResponse)
        .toList();

    return PostResponse.builder()
        .id(post.getId())
        .content(post.getContent())
      .userName(post.getUserName())
        .threadId(post.getThread() != null ? post.getThread().getId() : null)
        .createdAt(post.getCreatedAt())
        .reactions(reactions)
        .build();
  }

  private ReactionResponse toReactionResponse(Reaction reaction) {
    return ReactionResponse.builder()
        .id(reaction.getId())
        .type(reaction.getType())
        .userName(reaction.getUserName())
        .build();
  }
}
