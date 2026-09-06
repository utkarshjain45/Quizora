package com.quizora.Quizora.service;

import com.quizora.Quizora.dao.AuthResponse;
import com.quizora.Quizora.dao.SignInRequest;
import com.quizora.Quizora.dao.SignUpRequest;
import com.quizora.Quizora.model.User;
import com.quizora.Quizora.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse createUser(SignUpRequest signUpRequest){
        User user = User.builder()
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .password(passwordEncoder.encode(signUpRequest.getPassword()))
                .build();
        userRepository.save(user);
        String token = jwtService.generateToken(user);
        return new AuthResponse(token);
    }

    public AuthResponse authenticateUser(SignInRequest signInRequest){
        User user = userRepository.findByEmail(signInRequest.getEmail()).orElseThrow();
        if (user == null){
            return new AuthResponse("User Not Found");
        }
        String token = jwtService.generateToken(user);
        return new AuthResponse(token);
    }
}
