package com.tuong.forum_service.controller;

import com.tuong.forum_service.dto.CategoryRequest;
import com.tuong.forum_service.dto.CategoryResponse;
import com.tuong.forum_service.service.CategoryService;
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
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Stock ticker categories")
public class CategoryController {

  private final CategoryService categoryService;

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(summary = "Create a stock category")
  public CategoryResponse create(
      @RequestHeader(value = "X-Forum-User", required = false) String forumUser,
      @Valid @RequestBody CategoryRequest request) {
    if (forumUser == null || !"admin".equalsIgnoreCase(forumUser.trim())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can create category");
    }
    return categoryService.create(request);
  }

  @GetMapping
  @Operation(summary = "List all categories")
  public List<CategoryResponse> getAll() {
    return categoryService.getAll();
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get category detail")
  public CategoryResponse getById(@PathVariable Long id) {
    return categoryService.getById(id);
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update category")
  public CategoryResponse update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
    return categoryService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(summary = "Delete category")
  public void delete(@PathVariable Long id) {
    categoryService.delete(id);
  }
}
