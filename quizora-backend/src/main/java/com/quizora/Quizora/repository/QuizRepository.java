package com.quizora.Quizora.repository;

import com.quizora.Quizora.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    Optional<Quiz> findByCode(String code);
    Optional<Quiz> findByCodeAndIsActiveTrue(String code);
}

