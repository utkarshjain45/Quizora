package com.quizora.Quizora.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizora.Quizora.dao.CreateQuizRequest;
import com.quizora.Quizora.dao.QuizResponse;
import com.quizora.Quizora.service.AdminQuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/admin/quiz")
@RequiredArgsConstructor
public class AdminQuizController {

    private final AdminQuizService adminQuizService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuizResponse> createQuiz(@RequestBody CreateQuizRequest request) {
        return ResponseEntity.ok(adminQuizService.createQuiz(request));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuizResponse> uploadQuiz(@RequestParam("file") MultipartFile file) throws IOException {
        CreateQuizRequest request = objectMapper.readValue(file.getInputStream(), CreateQuizRequest.class);
        return ResponseEntity.ok(adminQuizService.createQuiz(request));
    }
}


