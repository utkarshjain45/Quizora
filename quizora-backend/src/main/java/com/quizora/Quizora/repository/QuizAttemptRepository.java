package com.quizora.Quizora.repository;

import com.quizora.Quizora.model.QuizAttempt;
import com.quizora.Quizora.model.Quiz;
import com.quizora.Quizora.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {
    Optional<QuizAttempt> findByUserAndQuiz(User user, Quiz quiz);
    boolean existsByUserAndQuiz(User user, Quiz quiz);
}

