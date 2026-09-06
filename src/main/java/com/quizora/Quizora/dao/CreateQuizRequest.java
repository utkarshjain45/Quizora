package com.quizora.Quizora.dao;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateQuizRequest {
    private String code;
    private String title;
    private String description;
    private List<QuestionRequest> questions;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class QuestionRequest {
        private String questionText;
        private List<String> options;
        private Integer correctAnswerIndex;
        private Integer points;
    }
}

