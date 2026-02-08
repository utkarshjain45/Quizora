package com.quizora.Quizora.controller;

import com.quizora.Quizora.dao.AuthResponse;
import com.quizora.Quizora.dao.SignInRequest;
import com.quizora.Quizora.dao.SignUpRequest;
import com.quizora.Quizora.service.AuthService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@AllArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> createUser(@RequestBody SignUpRequest signUpRequest){
        return ResponseEntity.ok(authService.createUser(signUpRequest));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody SignInRequest signInRequest){
        return ResponseEntity.ok(authService.authenticateUser(signInRequest));
    }
}
