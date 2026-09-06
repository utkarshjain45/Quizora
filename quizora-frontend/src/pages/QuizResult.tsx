import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { getQuizAttempt, getQuizAnalysis } from "@/api/apis";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import type { QuizAttemptResponse, QuizAnalysisResponse } from "@/types/quiz";
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Award,
  BookOpen,
} from "lucide-react";

export function QuizResult() {
  const { quizCode } = useParams<{ quizCode: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [attempt, setAttempt] = useState<QuizAttemptResponse | null>(null);
  const [analysis, setAnalysis] = useState<QuizAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(
    location.pathname.endsWith("/analysis")
  );
  const [filter, setFilter] = useState<"all" | "wrong" | "correct" | "unattempted">("all");

  const analysisRef = useRef<HTMLDivElement>(null);

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

    const fetchData = async () => {
      try {
        // Fetch basic attempt first
        const attemptRes = await getQuizAttempt(quizCode);
        setAttempt(attemptRes.data);

        // Also fetch full analysis for review
        try {
          const analysisRes = await getQuizAnalysis(quizCode);
          setAnalysis(analysisRes.data);
        } catch (analysisErr) {
          console.warn("Analysis not available yet or error fetching:", analysisErr);
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to load quiz result. Please try again."
        );
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizCode, isAuthenticated, navigate]);

  const handleToggleAnalysis = async () => {
    if (!showAnalysis && !analysis && quizCode) {
      setAnalysisLoading(true);
      try {
        const analysisRes = await getQuizAnalysis(quizCode);
        setAnalysis(analysisRes.data);
      } catch (error: any) {
        toast.error("Failed to load test analysis. Please try again.");
        setAnalysisLoading(false);
        return;
      } finally {
        setAnalysisLoading(false);
      }
    }

    const nextState = !showAnalysis;
    setShowAnalysis(nextState);

    if (nextState) {
      setTimeout(() => {
        analysisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="text-lg text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="text-center space-y-4">
          <p className="text-lg text-destructive">No attempt found</p>
          <Button onClick={() => navigate("/")} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const score = analysis?.score ?? attempt.score;
  const totalMarks = analysis?.totalMarks ?? attempt.totalMarks;
  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

  // Filter questions for test analysis
  const filteredQuestions = analysis?.questions.filter((q) => {
    if (filter === "wrong") return !q.isCorrect && !q.isUnattempted;
    if (filter === "correct") return q.isCorrect;
    if (filter === "unattempted") return q.isUnattempted;
    return true;
  }) ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/30 pb-16">
      <div className="container mx-auto max-w-4xl p-4 sm:p-6 space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
          {analysis?.quizTitle && (
            <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px] sm:max-w-md">
              {analysis.quizTitle}
            </span>
          )}
        </div>

        {/* Score Card */}
        <Card className="w-full shadow-lg border-2 border-border bg-card overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary/80 via-primary to-accent" />
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Quiz Results</CardTitle>
            <CardDescription className="text-base">
              {analysis?.quizTitle ? `Summary for "${analysis.quizTitle}"` : "You have completed this quiz"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-3 py-2">
              <div
                className={`text-6xl sm:text-7xl font-extrabold tracking-tight ${percentage >= 75
                    ? "text-emerald-600 dark:text-emerald-400"
                    : percentage >= 40
                      ? "text-primary"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
              >
                {percentage}%
              </div>
              <div className="text-2xl sm:text-3xl font-semibold">
                {score} / {totalMarks} <span className="text-lg text-muted-foreground font-normal">marks</span>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">
                You scored <span className="font-semibold text-foreground">{score}</span> out of{" "}
                <span className="font-semibold text-foreground">{totalMarks}</span> marks
              </p>
            </div>

            {/* Quick Metrics Badges if analysis is available */}
            {analysis && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="flex flex-col items-center p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-lg">
                    <CheckCircle2 className="h-5 w-5" />
                    {analysis.correctCount}
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5">Correct</span>
                </div>

                <div className="flex flex-col items-center p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center">
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold text-lg">
                    <XCircle className="h-5 w-5" />
                    {analysis.wrongCount}
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5">Wrong Answers</span>
                </div>

                <div className="flex flex-col items-center p-3 rounded-lg bg-secondary border border-border text-center">
                  <div className="flex items-center gap-1.5 text-foreground font-semibold text-lg">
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                    {analysis.unattemptedCount}
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5">Unattempted</span>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground text-center">
                Attempted on: {new Date(attempt.attemptedAt).toLocaleString()}
              </p>
            </div>

            {/* Buttons: Back to Dashboard & Analyze Test */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full sm:w-auto px-6"
              >
                Back to Dashboard
              </Button>
              <Button
                onClick={handleToggleAnalysis}
                disabled={analysisLoading}
                className="w-full sm:w-auto px-6 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 shadow-md"
              >
                <BarChart3 className="h-4 w-4" />
                {analysisLoading
                  ? "Loading Analysis..."
                  : showAnalysis
                    ? "Hide Test Analysis"
                    : "Analyze Test"}
                {showAnalysis ? (
                  <ChevronUp className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Analysis Section */}
        {showAnalysis && (
          <div ref={analysisRef} className="space-y-6 pt-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  Test Analysis & Review
                </h2>
                <p className="text-sm text-muted-foreground">
                  Review your answers and see where you made mistakes
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-secondary rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === "all"
                      ? "bg-background text-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  All ({analysis?.totalQuestions ?? 0})
                </button>

                <button
                  type="button"
                  onClick={() => setFilter("wrong")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${filter === "wrong"
                      ? "bg-rose-500 text-white shadow-sm font-semibold"
                      : "text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                    }`}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Wrong ({analysis?.wrongCount ?? 0})
                </button>

                <button
                  type="button"
                  onClick={() => setFilter("correct")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${filter === "correct"
                      ? "bg-emerald-600 text-white shadow-sm font-semibold"
                      : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Correct ({analysis?.correctCount ?? 0})
                </button>

                {(analysis?.unattemptedCount ?? 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilter("unattempted")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${filter === "unattempted"
                        ? "bg-amber-600 text-white shadow-sm font-semibold"
                        : "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                      }`}
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    Unattempted ({analysis?.unattemptedCount ?? 0})
                  </button>
                )}
              </div>
            </div>

            {/* Questions List */}
            {filteredQuestions.length === 0 ? (
              <Card className="bg-card border-2 border-border p-8 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <p className="text-lg font-medium">
                  {filter === "wrong"
                    ? "Great job! You have no wrong answers."
                    : filter === "correct"
                      ? "No correct answers found."
                      : filter === "unattempted"
                        ? "No unattempted questions."
                        : "No questions to display."}
                </p>
                <Button variant="outline" size="sm" onClick={() => setFilter("all")}>
                  Show All Questions
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredQuestions.map((q, index) => {
                  // Find original question index in full list
                  const originalIndex =
                    analysis?.questions.findIndex((orig) => orig.questionId === q.questionId) ?? index;

                  return (
                    <Card
                      key={q.questionId}
                      className={`border-2 shadow-sm transition-all overflow-hidden ${q.isCorrect
                          ? "border-emerald-500/30 bg-card"
                          : q.isUnattempted
                            ? "border-amber-500/30 bg-card"
                            : "border-rose-500/40 bg-card ring-1 ring-rose-500/10"
                        }`}
                    >
                      <CardHeader className="pb-3 border-b bg-muted/20">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base">
                              Question {originalIndex + 1}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({q.points} {q.points === 1 ? "point" : "points"})
                            </span>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {q.isCorrect ? (
                              <Badge
                                variant="outline"
                                className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 gap-1.5 py-1"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                Correct (+{q.points})
                              </Badge>
                            ) : q.isUnattempted ? (
                              <Badge
                                variant="outline"
                                className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 gap-1.5 py-1"
                              >
                                <HelpCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                Not Attempted (0 pts)
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30 gap-1.5 py-1 font-semibold"
                              >
                                <XCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                                Incorrect (0 pts)
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-base font-semibold text-foreground mt-3">
                          {q.questionText}
                        </p>
                      </CardHeader>

                      <CardContent className="pt-4 space-y-2.5">
                        {q.options.map((option, optIdx) => {
                          const isUserSelected = q.selectedOption === optIdx;
                          const isCorrectOption = q.correctAnswerIndex === optIdx;

                          let optionStyles =
                            "border-border bg-background hover:bg-muted/30 text-foreground";
                          let badgeContent = null;

                          if (isCorrectOption && isUserSelected) {
                            // User selected correctly
                            optionStyles =
                              "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-medium";
                            badgeContent = (
                              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white gap-1 text-[11px]">
                                <Check className="h-3 w-3" />
                                Your Answer (Correct)
                              </Badge>
                            );
                          } else if (isCorrectOption) {
                            // This is the correct answer, but user didn't pick it
                            optionStyles =
                              "border-emerald-500/70 bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 font-medium";
                            badgeContent = (
                              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white gap-1 text-[11px]">
                                <Check className="h-3 w-3" />
                                Correct Answer
                              </Badge>
                            );
                          } else if (isUserSelected) {
                            // User picked this, and it is WRONG
                            optionStyles =
                              "border-rose-500 bg-rose-500/10 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 font-medium";
                            badgeContent = (
                              <Badge className="bg-rose-600 hover:bg-rose-600 text-white gap-1 text-[11px]">
                                <X className="h-3 w-3" />
                                Your Answer (Incorrect)
                              </Badge>
                            );
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`flex items-center justify-between p-3.5 border-2 rounded-lg transition-all ${optionStyles}`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isCorrectOption
                                      ? "bg-emerald-600 text-white"
                                      : isUserSelected
                                        ? "bg-rose-600 text-white"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="text-sm leading-relaxed">{option}</span>
                              </div>
                              {badgeContent && <div className="ml-3 shrink-0">{badgeContent}</div>}
                            </div>
                          );
                        })}

                        {/* Unattempted hint */}
                        {q.isUnattempted && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 italic pt-1">
                            * You skipped this question. The correct answer is highlighted above.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex justify-between items-center border-t pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Back to Top
              </Button>
              <Button
                variant="default"
                onClick={() => navigate("/")}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
