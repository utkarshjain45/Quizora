package com.quizora.Quizora.dao;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuizAnalysisResponse {
    private String quizCode;
    private String quizTitle;
    private String quizDescription;
    private Integer score;
    private Integer totalMarks;
    private LocalDateTime attemptedAt;
    private Integer totalQuestions;
    private Integer correctCount;
    private Integer wrongCount;
    private Integer unattemptedCount;
    private List<QuestionAnalysisResponse> questions;
}
