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
public class QuestionAnalysisResponse {
    private UUID questionId;
    private String questionText;
    private List<String> options;
    private Integer selectedOption; // null if unattempted
    private Integer correctAnswerIndex;
    private Integer points;
    private boolean isCorrect;
    private boolean isUnattempted;
}
