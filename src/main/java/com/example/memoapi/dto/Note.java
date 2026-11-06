package com.example.memoapi.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Note {
    private long id;
    private String title;
    private String content;
    private LocalDateTime createdAt;
}
