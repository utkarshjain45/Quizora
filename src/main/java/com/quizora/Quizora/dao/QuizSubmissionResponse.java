package com.quizora.Quizora.dao;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QuizSubmissionResponse {
    private Integer score;
    private Integer totalMarks;
    private Boolean isRetake;
}

