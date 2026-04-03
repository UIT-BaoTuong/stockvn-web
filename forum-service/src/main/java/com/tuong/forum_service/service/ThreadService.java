package com.tuong.forum_service.service;

import com.tuong.forum_service.dto.ThreadRequest;
import com.tuong.forum_service.dto.ThreadResponse;
import com.tuong.forum_service.exception.ResourceNotFoundException;
import com.tuong.forum_service.model.Category;
import com.tuong.forum_service.model.Thread;
import com.tuong.forum_service.repository.ThreadRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ThreadService {

  private final ThreadRepository threadRepository;
  private final CategoryService categoryService;
  private final PostService postService;

  public ThreadResponse create(Long categoryId, ThreadRequest request) {
    Category category = categoryService.findEntityById(categoryId);

    Thread thread = new Thread();
    thread.setTitle(request.getTitle().trim());
    thread.setUserName(request.getUserName().trim());
    thread.setLegacyUserId(UUID.randomUUID());
    thread.setCategory(category);

    return toResponse(threadRepository.save(thread));
  }

  public List<ThreadResponse> getByCategory(Long categoryId) {
    Category category = categoryService.findEntityById(categoryId);

    List<Thread> threads = categoryService.isDefaultAllCategory(category)
        ? threadRepository.findAllExcludingCategoryNameOrderByCreatedAtDesc(CategoryService.ALL_CATEGORY_NAME)
        : threadRepository.findByCategoryIdOrderByCreatedAtDesc(categoryId);

    return threads
        .stream()
        .map(this::toResponse)
        .toList();
  }

  public ThreadResponse getById(Long threadId) {
    return toResponse(findEntityById(threadId));
  }

  public ThreadResponse update(Long threadId, ThreadRequest request) {
    Thread thread = findEntityById(threadId);
    thread.setTitle(request.getTitle().trim());
    thread.setUserName(request.getUserName().trim());
    return toResponse(threadRepository.save(thread));
  }

  @Transactional
  public void delete(Long threadId) {
    Thread thread = findEntityById(threadId);
    postService.deleteByThreadId(threadId);
    threadRepository.delete(thread);
  }

  public ThreadResponse increaseView(Long threadId) {
    Thread thread = findEntityById(threadId);
    thread.setViewCount(thread.getViewCount() + 1);
    return toResponse(threadRepository.save(thread));
  }

  public Thread findEntityById(Long threadId) {
    return threadRepository.findById(threadId)
        .orElseThrow(() -> new ResourceNotFoundException("Thread not found with id: " + threadId));
  }

  private ThreadResponse toResponse(Thread thread) {
    return ThreadResponse.builder()
        .id(thread.getId())
        .title(thread.getTitle())
      .userName(thread.getUserName())
        .categoryId(thread.getCategory() != null ? thread.getCategory().getId() : null)
        .categoryName(thread.getCategory() != null ? thread.getCategory().getName() : null)
        .viewCount(thread.getViewCount())
        .createdAt(thread.getCreatedAt())
        .build();
  }
}
