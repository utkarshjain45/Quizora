package com.quizora.Quizora.dao;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuizResponse {
    private UUID id;
    private String code;
    private String title;
    private String description;
    private List<QuestionResponse> questions;
}

