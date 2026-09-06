import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { validateQuizCode, hasAttemptedQuiz } from "@/api/apis";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function QuizCodeEntry() {
  const [quizCode, setQuizCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate("/signin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quizCode.trim()) {
      toast.error("Please enter a quiz code");
      return;
    }

    setLoading(true);
    try {
      const response = await validateQuizCode({ code: quizCode });
      if (response.data) {
        try {
          const hasAttempted = await hasAttemptedQuiz(quizCode);
          if (hasAttempted.data) {
            navigate(`/quiz/${quizCode}/result`);
          } else {
            navigate(`/quiz/${quizCode}/take`);
          }
        } catch (attemptError) {
          navigate(`/quiz/${quizCode}/take`);
        }
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Invalid quiz code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-background via-background to-secondary/30">
      <div className="flex-1 flex justify-center items-center p-6">
      <Card className="w-full max-w-md shadow-lg border-2 border-border bg-card">
        <CardHeader>
          <CardTitle>Enter Quiz Code</CardTitle>
          <CardDescription>
            Enter the quiz code provided by your instructor to start the quiz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quizCode">Quiz Code</Label>
                <Input
                  id="quizCode"
                  type="text"
                  placeholder="Enter quiz code"
                  value={quizCode}
                  onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Loading..." : "Start Quiz"}
          </Button>
        </CardFooter>
      </Card>
      </div>
    </div>
  );
}

