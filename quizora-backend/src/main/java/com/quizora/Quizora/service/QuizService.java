package com.quizora.Quizora.service;

import com.quizora.Quizora.dao.*;
import com.quizora.Quizora.model.Question;
import com.quizora.Quizora.model.Quiz;
import com.quizora.Quizora.model.QuizAttempt;
import com.quizora.Quizora.model.User;
import com.quizora.Quizora.repository.QuizAttemptRepository;
import com.quizora.Quizora.repository.QuizRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    public QuizResponse getQuizByCode(String code) {
        Quiz quiz = quizRepository.findByCodeAndIsActiveTrue(code)
                .orElseThrow(() -> new RuntimeException("Quiz not found or inactive"));

        List<QuestionResponse> questionResponses = quiz.getQuestions().stream()
                .map(question -> QuestionResponse.builder()
                        .id(question.getId())
                        .questionText(question.getQuestionText())
                        .options(question.getOptions())
                        .build())
                .collect(Collectors.toList());

        return QuizResponse.builder()
                .id(quiz.getId())
                .code(quiz.getCode())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .questions(questionResponses)
                .build();
    }

    @Transactional
    public QuizSubmissionResponse submitQuiz(String quizCode, Map<java.util.UUID, Integer> answers, User user) {
        Quiz quiz = quizRepository.findByCodeAndIsActiveTrue(quizCode)
                .orElseThrow(() -> new RuntimeException("Quiz not found or inactive"));

        boolean isRetake = quizAttemptRepository.existsByUserAndQuiz(user, quiz);

        int score = 0;
        int totalMarks = 0;

        for (Question question : quiz.getQuestions()) {
            totalMarks += question.getPoints();
            Integer selectedAnswer = answers.get(question.getId());
            if (selectedAnswer != null && selectedAnswer.equals(question.getCorrectAnswerIndex())) {
                score += question.getPoints();
            }
        }

        QuizAttempt attempt = quizAttemptRepository.findByUserAndQuiz(user, quiz)
                .orElse(QuizAttempt.builder()
                        .user(user)
                        .quiz(quiz)
                        .build());

        attempt.setScore(score);
        attempt.setTotalMarks(totalMarks);
        quizAttemptRepository.save(attempt);

        return QuizSubmissionResponse.builder()
                .score(score)
                .totalMarks(totalMarks)
                .isRetake(isRetake)
                .build();
    }

    public QuizAttemptResponse getQuizAttempt(String quizCode, User user) {
        Quiz quiz = quizRepository.findByCode(quizCode)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        QuizAttempt attempt = quizAttemptRepository.findByUserAndQuiz(user, quiz)
                .orElseThrow(() -> new RuntimeException("No attempt found for this quiz"));

        return QuizAttemptResponse.builder()
                .score(attempt.getScore())
                .totalMarks(attempt.getTotalMarks())
                .attemptedAt(attempt.getAttemptedAt())
                .build();
    }

    public boolean hasAttemptedQuiz(String quizCode, User user) {
        Quiz quiz = quizRepository.findByCode(quizCode).orElse(null);
        if (quiz == null) {
            return false;
        }
        return quizAttemptRepository.existsByUserAndQuiz(user, quiz);
    }
}

