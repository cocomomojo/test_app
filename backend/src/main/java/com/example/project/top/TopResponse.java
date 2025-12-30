package com.example.project.top;

public record TopResponse(
        String username,
        String now,
        int accessCount,
        int todoCount
) {}