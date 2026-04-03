package com.tuong.forum_service.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "threads")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Thread {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "user_id", nullable = false)
    private UUID legacyUserId;

    // Nhiều Thread thuộc về 1 Category
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    // Một Thread có nhiều Posts (bình luận)
    @OneToMany(mappedBy = "thread", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Post> posts;

    private int viewCount = 0;
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }
}