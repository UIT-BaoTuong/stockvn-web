package com.tuong.forum_service.repository;

import com.tuong.forum_service.model.Reaction;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {
  List<Reaction> findByPostId(Long postId);

  Optional<Reaction> findByPostIdAndUserName(Long postId, String userName);

  long countByPostIdAndType(Long postId, String type);

  @org.springframework.data.jpa.repository.Query("select count(r) from Reaction r where lower(r.userName) = lower(:userName)")
  long countByUserNameIgnoreCase(@org.springframework.data.repository.query.Param("userName") String userName);

  // Đếm reaction từ người khác (loại trừ self-reactions)
  @org.springframework.data.jpa.repository.Query("select count(r) from Reaction r join Post p on r.post.id = p.id where lower(p.userName) = lower(:userName) and lower(r.userName) != lower(p.userName)")
  long countReactionsFromOthers(@org.springframework.data.repository.query.Param("userName") String userName);
}
