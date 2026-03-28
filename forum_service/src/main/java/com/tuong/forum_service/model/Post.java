package com.tuong.forum_service.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "posts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "user_id", nullable = false)
    private UUID legacyUserId;

    // Nhiều Post thuộc về 1 Thread
    @ManyToOne
    @JoinColumn(name = "thread_id", nullable = false)
    private Thread thread;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reaction> reactions;

    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }
}