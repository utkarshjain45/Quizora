package com.quizora.Quizora.service;

import com.quizora.Quizora.dao.CreateQuizRequest;
import com.quizora.Quizora.dao.QuizResponse;
import com.quizora.Quizora.model.Question;
import com.quizora.Quizora.model.Quiz;
import com.quizora.Quizora.repository.QuizRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AdminQuizService {

    private final QuizRepository quizRepository;

    public QuizResponse createQuiz(CreateQuizRequest request) {
        Quiz quiz = Quiz.builder()
                .code(request.getCode())
                .title(request.getTitle())
                .description(request.getDescription())
                .isActive(true)
                .build();

        if (request.getQuestions() != null) {
            for (CreateQuizRequest.QuestionRequest qReq : request.getQuestions()) {
                Question question = Question.builder()
                        .quiz(quiz)
                        .questionText(qReq.getQuestionText())
                        .options(qReq.getOptions())
                        .correctAnswerIndex(qReq.getCorrectAnswerIndex())
                        .points(qReq.getPoints() != null ? qReq.getPoints() : 1)
                        .build();
                quiz.getQuestions().add(question);
            }
        }

        quiz = quizRepository.save(quiz);

        QuizResponse response = QuizResponse.builder()
                .id(quiz.getId())
                .code(quiz.getCode())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .questions(quiz.getQuestions().stream()
                        .map(q -> com.quizora.Quizora.dao.QuestionResponse.builder()
                                .id(q.getId())
                                .questionText(q.getQuestionText())
                                .options(q.getOptions())
                                .build())
                        .collect(Collectors.toList()))
                .build();

        return response;
    }
}
