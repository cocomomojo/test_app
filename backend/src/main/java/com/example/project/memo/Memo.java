package com.example.project.memo;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;

@Entity
@Data
public class Memo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String s3Key;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;
}
