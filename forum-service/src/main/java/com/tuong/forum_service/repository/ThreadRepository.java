
package com.tuong.forum_service.repository;

import com.tuong.forum_service.model.Thread;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ThreadRepository extends JpaRepository<Thread, Long> {
  List<Thread> findByCategoryIdOrderByCreatedAtDesc(Long categoryId);

  @Query("select t from Thread t where upper(t.category.name) <> upper(:categoryName) order by t.createdAt desc")
  List<Thread> findAllExcludingCategoryNameOrderByCreatedAtDesc(@Param("categoryName") String categoryName);

  @Query("select coalesce(sum(t.viewCount), 0) from Thread t where t.category.id = :categoryId")
  int sumViewCountByCategoryId(@Param("categoryId") Long categoryId);

  @Query("select coalesce(sum(t.viewCount), 0) from Thread t where upper(t.category.name) <> upper(:categoryName)")
  int sumViewCountExcludingCategoryName(@Param("categoryName") String categoryName);

  @Query("select count(t) from Thread t where lower(t.userName) = lower(:userName)")
  long countByUserNameIgnoreCase(@Param("userName") String userName);

  @Query("select count(t) from Thread t where t.category.id = :categoryId")
  long countByCategoryId(@Param("categoryId") Long categoryId);

  @Query("select count(t) from Thread t where upper(t.category.name) <> upper(:categoryName)")
  long countExcludingCategoryName(@Param("categoryName") String categoryName);
}
