package com.quizora.Quizora.controller;

import com.quizora.Quizora.dao.*;
import com.quizora.Quizora.model.User;
import com.quizora.Quizora.service.QuizService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/quiz")
@AllArgsConstructor
public class QuizController {

    private final QuizService quizService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return (User) authentication.getPrincipal();
    }

    @PostMapping("/validate-code")
    public ResponseEntity<QuizResponse> validateQuizCode(@RequestBody QuizCodeRequest request) {
        QuizResponse quiz = quizService.getQuizByCode(request.getCode());
        return ResponseEntity.ok(quiz);
    }

    @GetMapping("/{quizCode}/attempt")
    public ResponseEntity<QuizAttemptResponse> getQuizAttempt(@PathVariable String quizCode) {
        User user = getCurrentUser();
        QuizAttemptResponse attempt = quizService.getQuizAttempt(quizCode, user);
        return ResponseEntity.ok(attempt);
    }

    @GetMapping("/{quizCode}/analysis")
    public ResponseEntity<QuizAnalysisResponse> getQuizAnalysis(@PathVariable String quizCode) {
        User user = getCurrentUser();
        QuizAnalysisResponse analysis = quizService.getQuizAnalysis(quizCode, user);
        return ResponseEntity.ok(analysis);
    }

    @GetMapping("/{quizCode}/has-attempted")
    public ResponseEntity<Boolean> hasAttemptedQuiz(@PathVariable String quizCode) {
        User user = getCurrentUser();
        boolean hasAttempted = quizService.hasAttemptedQuiz(quizCode, user);
        return ResponseEntity.ok(hasAttempted);
    }

    @PostMapping("/submit")
    public ResponseEntity<QuizSubmissionResponse> submitQuiz(@RequestBody QuizSubmissionRequest request) {
        User user = getCurrentUser();
        QuizSubmissionResponse response = quizService.submitQuiz(
                request.getQuizCode(),
                request.getAnswers(),
                user
        );
        return ResponseEntity.ok(response);
    }
}

