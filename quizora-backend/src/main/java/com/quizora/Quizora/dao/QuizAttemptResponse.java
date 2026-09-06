package com.quizora.Quizora.dao;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuizAttemptResponse {
    private Integer score;
    private Integer totalMarks;
    private LocalDateTime attemptedAt;
}

