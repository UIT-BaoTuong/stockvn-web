package com.tuong.forum_service.repository;

import com.tuong.forum_service.model.Post;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
  List<Post> findByThreadIdOrderByCreatedAtAsc(Long threadId);
}
