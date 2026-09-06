import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { validateQuizCode, submitQuiz, hasAttemptedQuiz } from "@/api/apis";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { Quiz, Question } from "@/types/quiz";

export function QuizTaking() {
  const { quizCode } = useParams<{ quizCode: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
      return;
    }

    if (!quizCode) {
      toast.error("Invalid quiz code");
      navigate("/");
      return;
    }

    const fetchQuiz = async () => {
      try {
        try {
          const hasAttempted = await hasAttemptedQuiz(quizCode);
          if (hasAttempted.data) {
            navigate(`/quiz/${quizCode}/result`);
            return;
          }
        } catch (attemptError) {}

        const response = await validateQuizCode({ code: quizCode });
        setQuiz(response.data);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to load quiz. Please try again."
        );
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizCode, isAuthenticated, navigate]);

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    const unansweredQuestions = quiz.questions.filter(
      (q) => answers[q.id] === undefined
    );

    if (unansweredQuestions.length > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredQuestions.length} unanswered question(s). Do you want to submit anyway?`
      );
      if (!confirmSubmit) {
        return;
      }
    }

    setSubmitting(true);
    try {
      await submitQuiz({
        quizCode: quiz.code,
        answers,
      });

      toast.success("Quiz submitted successfully!");
      navigate(`/quiz/${quizCode}/result`);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to submit quiz. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/30">
        <p className="text-lg text-muted-foreground">Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/30">
        <p className="text-lg text-destructive">Quiz not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/30">
    <div className="container mx-auto py-8 max-w-4xl px-4">
      <Card className="mb-6 shadow-md border-2 border-border bg-card">
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          {quiz.description && (
            <CardDescription>{quiz.description}</CardDescription>
          )}
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {quiz.questions.map((question: Question, index: number) => (
          <Card key={question.id} className="bg-card border-2 border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">
                Question {index + 1} of {quiz.questions.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-base font-medium">{question.questionText}</p>
              <div className="space-y-3">
                {question.options.map((option: string, optionIndex: number) => (
                  <label
                    key={optionIndex}
                    className="flex items-center space-x-3 p-3 border rounded-md cursor-pointer hover:bg-accent transition-colors"
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={optionIndex}
                      checked={answers[question.id] === optionIndex}
                      onChange={() => handleAnswerChange(question.id, optionIndex)}
                      className="w-4 h-4"
                    />
                    <span className="flex-1">{option}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Quiz"}
        </Button>
      </div>
    </div>
    </div>
  );
}

