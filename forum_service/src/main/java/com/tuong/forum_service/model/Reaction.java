package com.tuong.forum_service.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "reactions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Reaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // LIKE, LOVE, WOW, etc.

    @Column(name = "user_name")
    private String userName;

    @Column(name = "user_id", nullable = false)
    private UUID legacyUserId;

    // Nhiều Reaction thuộc về 1 Post
    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
}