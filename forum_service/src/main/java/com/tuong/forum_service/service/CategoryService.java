package com.tuong.forum_service.service;

import com.tuong.forum_service.dto.CategoryRequest;
import com.tuong.forum_service.dto.CategoryResponse;
import com.tuong.forum_service.exception.ResourceNotFoundException;
import com.tuong.forum_service.model.Category;
import com.tuong.forum_service.model.Thread;
import com.tuong.forum_service.repository.CategoryRepository;
import com.tuong.forum_service.repository.ThreadRepository;
import jakarta.annotation.PostConstruct;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryService {

  public static final String ALL_CATEGORY_NAME = "ALL";

  private final CategoryRepository categoryRepository;
  private final ThreadRepository threadRepository;
  private final PostService postService;

  @PostConstruct
  @Transactional
  public void initializeDefaultCategory() {
    ensureDefaultAllCategory();
  }

  public CategoryResponse create(CategoryRequest request) {
    String normalizedName = normalizeTicker(request.getName());
    categoryRepository.findByName(normalizedName).ifPresent(existing -> {
      throw new IllegalArgumentException("Category ticker already exists: " + normalizedName);
    });

    Category category = new Category();
    category.setName(normalizedName);
    category.setDescription(request.getDescription());
    category.setDisplayOrder(request.getDisplayOrder() == null ? 0 : request.getDisplayOrder());

    return toResponse(categoryRepository.save(category));
  }

  public List<CategoryResponse> getAll() {
    ensureDefaultAllCategory();
    return categoryRepository.findAll().stream()
        .sorted(Comparator.comparingInt(Category::getDisplayOrder).thenComparing(Category::getName))
        .map(this::toResponse)
        .toList();
  }

  public CategoryResponse getById(Long id) {
    return toResponse(findEntityById(id));
  }

  public CategoryResponse update(Long id, CategoryRequest request) {
    Category category = findEntityById(id);
    if (isDefaultAllCategory(category)) {
      throw new IllegalArgumentException("Default category ALL cannot be updated");
    }

    String normalizedName = normalizeTicker(request.getName());
    categoryRepository.findByName(normalizedName)
        .filter(existing -> !existing.getId().equals(id))
        .ifPresent(existing -> {
          throw new IllegalArgumentException("Category ticker already exists: " + normalizedName);
        });

    category.setName(normalizedName);
    category.setDescription(request.getDescription());
    category.setDisplayOrder(request.getDisplayOrder() == null ? category.getDisplayOrder() : request.getDisplayOrder());

    return toResponse(categoryRepository.save(category));
  }

  @Transactional
  public void delete(Long id) {
    Category category = findEntityById(id);
    if (isDefaultAllCategory(category)) {
      throw new IllegalArgumentException("Default category ALL cannot be deleted");
    }

    List<Thread> threads = threadRepository.findByCategoryIdOrderByCreatedAtDesc(id);
    for (Thread thread : threads) {
      postService.deleteByThreadId(thread.getId());
    }
    threadRepository.deleteAll(threads);

    categoryRepository.delete(category);
  }

  public Category findEntityById(Long id) {
    return categoryRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
  }

  public boolean isDefaultAllCategory(Category category) {
    return category != null && ALL_CATEGORY_NAME.equalsIgnoreCase(category.getName());
  }

  private CategoryResponse toResponse(Category category) {
    int totalViewCount = isDefaultAllCategory(category)
        ? threadRepository.sumViewCountExcludingCategoryName(ALL_CATEGORY_NAME)
        : threadRepository.sumViewCountByCategoryId(category.getId());
    long threadCount = isDefaultAllCategory(category)
      ? threadRepository.countExcludingCategoryName(ALL_CATEGORY_NAME)
      : threadRepository.countByCategoryId(category.getId());
    return CategoryResponse.builder()
        .id(category.getId())
        .name(category.getName())
        .description(category.getDescription())
        .displayOrder(category.getDisplayOrder())
        .viewCount(totalViewCount)
      .threadCount(threadCount)
        .build();
  }

  private String normalizeTicker(String value) {
    if (value == null || value.isBlank()) {
      throw new IllegalArgumentException("Category name (ticker) is required");
    }
    return value.trim().toUpperCase();
  }

  private Category ensureDefaultAllCategory() {
    return categoryRepository.findByName(ALL_CATEGORY_NAME)
        .orElseGet(() -> {
          Category defaultCategory = new Category();
          defaultCategory.setName(ALL_CATEGORY_NAME);
          defaultCategory.setDescription("Contains all threads from every category");
          defaultCategory.setDisplayOrder(-1);
          return categoryRepository.save(defaultCategory);
        });
  }
}
