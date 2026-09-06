import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { getQuizAttempt } from "@/api/apis";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { QuizAttemptResponse } from "@/types/quiz";

export function QuizResult() {
  const { quizCode } = useParams<{ quizCode: string }>();
  const [attempt, setAttempt] = useState<QuizAttemptResponse | null>(null);
  const [loading, setLoading] = useState(true);
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

    const fetchAttempt = async () => {
      try {
        const response = await getQuizAttempt(quizCode);
        setAttempt(response.data);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to load quiz result. Please try again."
        );
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchAttempt();
  }, [quizCode, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="text-center">
          <p className="text-lg">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="text-center">
          <p className="text-lg text-destructive">No attempt found</p>
        </div>
      </div>
    );
  }

  const percentage = attempt.totalMarks > 0 
    ? Math.round((attempt.score / attempt.totalMarks) * 100) 
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/30">
      <div className="flex-1 flex justify-center items-center p-6">
      <Card className="w-full max-w-2xl shadow-lg border-2 border-border bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Quiz Results</CardTitle>
          <CardDescription>
            You have already attempted this quiz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <div className="text-6xl font-bold text-primary">{percentage}%</div>
            <div className="text-2xl">
              {attempt.score} / {attempt.totalMarks}
            </div>
            <p className="text-muted-foreground">
              Score: {attempt.score} out of {attempt.totalMarks} marks
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground text-center">
              Attempted on: {new Date(attempt.attemptedAt).toLocaleString()}
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={() => navigate("/")} className="w-full max-w-xs">
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

