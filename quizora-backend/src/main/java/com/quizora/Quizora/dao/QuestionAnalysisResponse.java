package com.quizora.Quizora.dao;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    @JsonProperty("isCorrect")
    private boolean isCorrect;

    @JsonProperty("isUnattempted")
    private boolean isUnattempted;

    @JsonProperty("isCorrect")
    public boolean isCorrect() {
        return isCorrect;
    }

    @JsonProperty("isCorrect")
    public void setIsCorrect(boolean isCorrect) {
        this.isCorrect = isCorrect;
    }

    @JsonProperty("isUnattempted")
    public boolean isUnattempted() {
        return isUnattempted;
    }

    @JsonProperty("isUnattempted")
    public void setIsUnattempted(boolean isUnattempted) {
        this.isUnattempted = isUnattempted;
    }
}
