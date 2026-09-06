package com.quizora.Quizora.dao;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuizSubmissionRequest {
    private String quizCode;
    private Map<UUID, Integer> answers;
}

