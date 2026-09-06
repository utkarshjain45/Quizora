import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { createQuiz } from "@/api/apis";
import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { CreateQuizQuestionRequest, CreateQuizRequest } from "@/types/quiz";
import Navbar from "@/components/layout/Navbar";
import {
  UploadCloud,
  FileJson,
  Download,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  FileUp,
  PencilLine,
  Eye,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

const emptyQuestion = (): CreateQuizQuestionRequest => ({
  questionText: "",
  options: ["", ""],
  correctAnswerIndex: 0,
  points: 1,
});

interface ParsedQuizData {
  code: string;
  title: string;
  description: string;
  questions: CreateQuizQuestionRequest[];
}

export function AdminCreateQuiz() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Mode: 'manual' or 'upload'
  const [activeTab, setActiveTab] = useState<"manual" | "upload">("manual");

  // Form states (Manual Entry)
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<CreateQuizQuestionRequest[]>([emptyQuestion()]);
  const [loading, setLoading] = useState(false);

  // File Upload states
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [parsedQuiz, setParsedQuiz] = useState<ParsedQuizData | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreviewQuestions, setShowPreviewQuestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const manualImportInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthenticated) {
    navigate("/signin");
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-2 border-destructive/20 bg-card">
            <CardHeader>
              <CardTitle className="text-destructive">Access denied</CardTitle>
              <CardDescription>
                Only administrators can create quizzes. If you believe this is an error, contact your administrator.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // --- Manual Question Handlers ---
  const addQuestion = () => {
    setQuestions((q) => [...q, emptyQuestion()]);
  };

  const updateQuestion = (index: number, field: keyof CreateQuizQuestionRequest, value: unknown) => {
    setQuestions((q) => {
      const next = [...q];
      (next[index] as unknown as Record<string, unknown>)[field] = value;
      return next;
    });
  };

  const setOption = (qIndex: number, oIndex: number, value: string) => {
    setQuestions((q) => {
      const next = [...q];
      const opts = [...(next[qIndex].options || [])];
      opts[oIndex] = value;
      next[qIndex] = { ...next[qIndex], options: opts };
      return next;
    });
  };

  const addOption = (qIndex: number) => {
    setQuestions((q) => {
      const next = [...q];
      next[qIndex] = {
        ...next[qIndex],
        options: [...(next[qIndex].options || []), ""],
      };
      return next;
    });
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    setQuestions((q) => {
      const next = [...q];
      const opts = (next[qIndex].options || []).filter((_, i) => i !== oIndex);
      let nextCorrect = next[qIndex].correctAnswerIndex;
      if (nextCorrect >= opts.length) {
        nextCorrect = Math.max(0, opts.length - 1);
      }
      next[qIndex] = { ...next[qIndex], options: opts, correctAnswerIndex: nextCorrect };
      return next;
    });
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((q) => q.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) {
      toast.error("Code and title are required.");
      return;
    }
    const validQuestions = questions.filter(
      (q) => q.questionText.trim() && q.options.filter((o) => o.trim()).length >= 2
    );
    if (validQuestions.length === 0) {
      toast.error("Add at least one question with at least two options.");
      return;
    }
    setLoading(true);
    try {
      await createQuiz({
        code: code.trim().toUpperCase(),
        title: title.trim(),
        description: description.trim(),
        questions: validQuestions.map((q) => ({
          questionText: q.questionText.trim(),
          options: q.options.filter((o) => o.trim()).map((o) => o.trim()),
          correctAnswerIndex: q.correctAnswerIndex,
          points: q.points ?? 1,
        })),
      });
      toast.success("Quiz created successfully.");
      navigate("/");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(message || "Failed to create quiz. You may not have permission.");
    } finally {
      setLoading(false);
    }
  };

  // --- JSON File Parsing & Validation ---
  const validateAndParseJson = (rawContent: string): ParsedQuizData => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      throw new Error("Invalid JSON file syntax. Please verify the file is valid JSON.");
    }

    if (!parsed || typeof parsed !== "object") {
      throw new Error("JSON file must contain an object or array.");
    }

    let parsedCode = "";
    let parsedTitle = "";
    let parsedDescription = "";
    let rawQuestions: unknown[] = [];

    if (Array.isArray(parsed)) {
      rawQuestions = parsed;
    } else {
      const obj = parsed as Record<string, unknown>;
      if (typeof obj.code === "string") parsedCode = obj.code.trim().toUpperCase();
      if (typeof obj.title === "string") parsedTitle = obj.title.trim();
      if (typeof obj.description === "string") parsedDescription = obj.description.trim();

      if (Array.isArray(obj.questions)) {
        rawQuestions = obj.questions;
      } else {
        throw new Error("JSON object must include a 'questions' array.");
      }
    }

    if (rawQuestions.length === 0) {
      throw new Error("Quiz must contain at least one question.");
    }

    const validatedQuestions: CreateQuizQuestionRequest[] = rawQuestions.map((item, idx) => {
      if (!item || typeof item !== "object") {
        throw new Error(`Question ${idx + 1} is not a valid question object.`);
      }
      const q = item as Record<string, unknown>;
      if (typeof q.questionText !== "string" || !q.questionText.trim()) {
        throw new Error(`Question ${idx + 1} is missing a non-empty 'questionText'.`);
      }

      if (!Array.isArray(q.options) || q.options.length < 2) {
        throw new Error(`Question ${idx + 1} ('${q.questionText.slice(0, 20)}...'): must have at least 2 options.`);
      }

      const options = q.options.map((opt, optIdx) => {
        if (typeof opt !== "string" || !opt.trim()) {
          throw new Error(`Question ${idx + 1}, Option ${optIdx + 1}: option cannot be empty.`);
        }
        return opt.trim();
      });

      let correctIndex = 0;
      if (typeof q.correctAnswerIndex === "number") {
        if (q.correctAnswerIndex < 0 || q.correctAnswerIndex >= options.length) {
          throw new Error(
            `Question ${idx + 1}: 'correctAnswerIndex' (${q.correctAnswerIndex}) must be between 0 and ${
              options.length - 1
            }.`
          );
        }
        correctIndex = q.correctAnswerIndex;
      }

      let points = 1;
      if (typeof q.points === "number" && q.points > 0) {
        points = q.points;
      }

      return {
        questionText: q.questionText.trim(),
        options,
        correctAnswerIndex: correctIndex,
        points,
      };
    });

    return {
      code: parsedCode,
      title: parsedTitle,
      description: parsedDescription,
      questions: validatedQuestions,
    };
  };

  const processFile = (file: File, target: "uploadTab" | "directForm") => {
    if (!file.name.toLowerCase().endsWith(".json") && file.type !== "application/json") {
      const err = "Please upload a valid .json file.";
      if (target === "uploadTab") setUploadError(err);
      toast.error(err);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = validateAndParseJson(text);

        if (target === "uploadTab") {
          setUploadedFileName(file.name);
          setParsedQuiz(result);
          setUploadError(null);
          toast.success(`Loaded "${file.name}" with ${result.questions.length} questions.`);
        } else {
          // Direct populate into manual form
          if (result.code) setCode(result.code);
          if (result.title) setTitle(result.title);
          if (result.description) setDescription(result.description);
          setQuestions(result.questions);
          toast.success(`Imported ${result.questions.length} questions into form.`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to parse JSON file.";
        if (target === "uploadTab") {
          setUploadError(msg);
          setParsedQuiz(null);
          setUploadedFileName(file.name);
        }
        toast.error(msg);
      }
    };
    reader.onerror = () => {
      const msg = "Error reading file.";
      if (target === "uploadTab") setUploadError(msg);
      toast.error(msg);
    };
    reader.readAsText(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0], "uploadTab");
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0], "uploadTab");
    }
  };

  const handleManualImportChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0], "directForm");
    }
  };

  // Transfer parsed JSON to manual form
  const handleImportToManualForm = () => {
    if (!parsedQuiz) return;
    if (parsedQuiz.code) setCode(parsedQuiz.code);
    if (parsedQuiz.title) setTitle(parsedQuiz.title);
    if (parsedQuiz.description) setDescription(parsedQuiz.description);
    setQuestions(parsedQuiz.questions);
    setActiveTab("manual");
    toast.success("Imported to manual editor. You can now review, edit, or submit.");
  };

  // Create quiz directly from parsed JSON
  const handleCreateDirectly = async () => {
    if (!parsedQuiz) return;
    if (!parsedQuiz.code.trim()) {
      toast.error("Quiz code is required. Please fill in the Quiz Code.");
      return;
    }
    if (!parsedQuiz.title.trim()) {
      toast.error("Quiz title is required. Please fill in the Quiz Title.");
      return;
    }

    setLoading(true);
    try {
      const payload: CreateQuizRequest = {
        code: parsedQuiz.code.trim().toUpperCase(),
        title: parsedQuiz.title.trim(),
        description: parsedQuiz.description.trim(),
        questions: parsedQuiz.questions,
      };
      await createQuiz(payload);
      toast.success("Quiz created successfully from JSON!");
      navigate("/");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(message || "Failed to create quiz.");
    } finally {
      setLoading(false);
    }
  };

  // Download sample JSON template
  const downloadSampleTemplate = () => {
    const sample = {
      code: "QUIZ001",
      title: "Sample General Knowledge Quiz",
      description: "A quick quiz covering basic programming and knowledge concepts",
      questions: [
        {
          questionText: "What does JSON stand for?",
          options: [
            "JavaScript Object Notation",
            "JavaScript Oriented Notation",
            "Java Standard Object Network",
            "JavaScript Online Node",
          ],
          correctAnswerIndex: 0,
          points: 1,
        },
        {
          questionText: "Which HTTP status code signifies a successful creation of a resource?",
          options: ["200 OK", "201 Created", "204 No Content", "301 Moved Permanently"],
          correctAnswerIndex: 1,
          points: 2,
        },
        {
          questionText: "Which keyword is used to declare a block-scoped variable in modern JavaScript?",
          options: ["var", "let", "def", "dim"],
          correctAnswerIndex: 1,
          points: 1,
        },
      ],
    };

    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "quiz_sample_template.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Sample template downloaded!");
  };

  const totalPoints = parsedQuiz
    ? parsedQuiz.questions.reduce((sum, q) => sum + (q.points ?? 1), 0)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <Card className="border-2 shadow-lg bg-card">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                  Create a New Quiz
                </CardTitle>
                <CardDescription className="mt-1">
                  Create quizzes manually or import instantly by uploading a JSON file.
                </CardDescription>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center p-1 bg-muted rounded-xl border border-border self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("manual")}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "manual"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <PencilLine className="w-4 h-4" />
                  Manual Entry
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("upload")}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === "upload"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  Upload JSON
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* TAB 1: UPLOAD JSON */}
            {activeTab === "upload" && (
              <div className="space-y-6">
                {/* Information and sample download bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm">
                  <div className="flex items-start gap-2.5">
                    <FileJson className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-foreground">Import Quiz via JSON: </span>
                      <span className="text-muted-foreground">
                        Upload a file with quiz code, title, questions, options, and answer indices.
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadSampleTemplate}
                    className="shrink-0 flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Sample JSON
                  </Button>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                    isDragging
                      ? "border-primary bg-primary/10 scale-[1.01]"
                      : "border-border hover:border-primary/50 hover:bg-muted/40 bg-muted/20"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />

                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1 shadow-inner">
                    <UploadCloud className="w-7 h-7" />
                  </div>

                  <div>
                    <p className="text-base font-semibold text-foreground">
                      Click to choose or drag & drop your JSON file
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports standard Quizora JSON structure with questions and options (Max 5MB)
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-2 pointer-events-none"
                  >
                    <FileUp className="w-4 h-4 mr-1.5" /> Browse File
                  </Button>
                </div>

                {/* Error Banner */}
                {uploadError && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">Validation Error</p>
                      <p className="text-xs mt-0.5">{uploadError}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadError(null)}
                      className="h-7 text-xs text-destructive hover:bg-destructive/20"
                    >
                      Dismiss
                    </Button>
                  </div>
                )}

                {/* Parsed File Overview & Actions */}
                {parsedQuiz && !uploadError && (
                  <Card className="border-2 border-primary/30 bg-card overflow-hidden shadow-md">
                    <div className="bg-primary/10 px-5 py-3 border-b border-primary/20 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-semibold text-foreground text-sm">
                          {uploadedFileName ?? "Imported File"}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {parsedQuiz.questions.length} questions
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {totalPoints} total pts
                        </Badge>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setParsedQuiz(null);
                          setUploadedFileName(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="text-muted-foreground hover:text-destructive text-xs h-7"
                      >
                        Clear
                      </Button>
                    </div>

                    <CardContent className="p-5 space-y-4">
                      {/* Metadata Edit/Review */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="grid gap-1.5">
                          <Label htmlFor="parsed-code" className="text-xs font-medium">
                            Quiz Code <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="parsed-code"
                            value={parsedQuiz.code}
                            onChange={(e) =>
                              setParsedQuiz({ ...parsedQuiz, code: e.target.value.toUpperCase() })
                            }
                            placeholder="e.g. QUIZ001"
                            className="font-mono"
                          />
                        </div>

                        <div className="grid gap-1.5">
                          <Label htmlFor="parsed-title" className="text-xs font-medium">
                            Quiz Title <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="parsed-title"
                            value={parsedQuiz.title}
                            onChange={(e) =>
                              setParsedQuiz({ ...parsedQuiz, title: e.target.value })
                            }
                            placeholder="e.g. JavaScript Basics"
                          />
                        </div>

                        <div className="grid gap-1.5 sm:col-span-2">
                          <Label htmlFor="parsed-desc" className="text-xs font-medium">
                            Description (optional)
                          </Label>
                          <Input
                            id="parsed-desc"
                            value={parsedQuiz.description}
                            onChange={(e) =>
                              setParsedQuiz({ ...parsedQuiz, description: e.target.value })
                            }
                            placeholder="Short overview of the quiz"
                          />
                        </div>
                      </div>

                      {/* Preview Questions Toggle */}
                      <div className="pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">
                            Question Details ({parsedQuiz.questions.length})
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPreviewQuestions(!showPreviewQuestions)}
                            className="text-xs text-primary flex items-center gap-1.5 h-7"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {showPreviewQuestions ? "Hide Questions" : "Preview Questions"}
                          </Button>
                        </div>

                        {showPreviewQuestions && (
                          <div className="mt-3 space-y-3 max-h-72 overflow-y-auto pr-1">
                            {parsedQuiz.questions.map((q, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-lg bg-secondary/30 border border-border text-xs space-y-2"
                              >
                                <div className="flex justify-between items-start font-medium">
                                  <span>
                                    Q{idx + 1}. {q.questionText}
                                  </span>
                                  <Badge variant="outline" className="text-[10px]">
                                    {q.points ?? 1} pt
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2">
                                  {q.options.map((opt, optIdx) => (
                                    <div
                                      key={optIdx}
                                      className={`px-2 py-1 rounded text-[11px] flex items-center gap-1.5 ${
                                        optIdx === q.correctAnswerIndex
                                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-500/30"
                                          : "bg-background/80 text-muted-foreground border border-border/50"
                                      }`}
                                    >
                                      <span className="opacity-70 font-mono">
                                        {String.fromCharCode(65 + optIdx)}.
                                      </span>
                                      <span className="truncate">{opt}</span>
                                      {optIdx === q.correctAnswerIndex && (
                                        <CheckCircle2 className="w-3 h-3 ml-auto shrink-0 text-emerald-500" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-3 border-t border-border">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleImportToManualForm}
                          className="flex items-center justify-center gap-2"
                        >
                          <PencilLine className="w-4 h-4" />
                          Review & Edit in Form
                        </Button>
                        <Button
                          type="button"
                          onClick={handleCreateDirectly}
                          disabled={loading}
                          className="flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            "Creating Quiz…"
                          ) : (
                            <>
                              Create Quiz Directly <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Helpful schema hint */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground space-y-1.5">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-primary" /> Supported JSON Format
                  </div>
                  <p>
                    Your JSON file can either be a full quiz object or an array of questions.
                  </p>
                  <pre className="p-2.5 rounded-lg bg-background border border-border text-[11px] overflow-x-auto font-mono text-foreground/90">
{`{
  "code": "QUIZ001",
  "title": "JavaScript Basics",
  "description": "Optional short summary",
  "questions": [
    {
      "questionText": "What does JSON stand for?",
      "options": ["JavaScript Object Notation", "Java Option Notation"],
      "correctAnswerIndex": 0,
      "points": 1
    }
  ]
}`}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 2: MANUAL ENTRY (With quick JSON import button) */}
            {activeTab === "manual" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Quick import from JSON banner in manual mode */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileJson className="w-4 h-4 text-primary" />
                    <span>Have a JSON file ready? Import questions instantly into this form.</span>
                  </div>
                  <input
                    ref={manualImportInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleManualImportChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => manualImportInputRef.current?.click()}
                    className="h-7 text-xs flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" /> Import JSON
                  </Button>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="code">Quiz code (unique)</Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. QUIZ001"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Quiz title"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      Questions ({questions.length})
                    </Label>
                    <Button type="button" variant="secondary" size="sm" onClick={addQuestion}>
                      <Plus className="w-4 h-4 mr-1" /> Add question
                    </Button>
                  </div>
                  {questions.map((q, qIndex) => (
                    <Card key={qIndex} className="p-4 bg-secondary/30 border-border">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <Label className="text-sm font-semibold">Question {qIndex + 1}</Label>
                          {questions.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 h-7 text-xs"
                              onClick={() => removeQuestion(qIndex)}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                            </Button>
                          )}
                        </div>
                        <Input
                          placeholder="Question text"
                          value={q.questionText}
                          onChange={(e) => updateQuestion(qIndex, "questionText", e.target.value)}
                        />
                        <div className="grid gap-2">
                          <Label className="text-xs text-muted-foreground">
                            Options (select correct answer index below)
                          </Label>
                          {(q.options || []).map((opt, oIndex) => (
                            <div key={oIndex} className="flex gap-2 items-center">
                              <span className="text-xs font-mono text-muted-foreground w-4 text-center">
                                {String.fromCharCode(65 + oIndex)}.
                              </span>
                              <Input
                                placeholder={`Option ${oIndex + 1}`}
                                value={opt}
                                onChange={(e) => setOption(qIndex, oIndex, e.target.value)}
                              />
                              {oIndex === q.correctAnswerIndex ? (
                                <Badge variant="default" className="shrink-0 text-xs">
                                  ✓ Correct
                                </Badge>
                              ) : (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateQuestion(qIndex, "correctAnswerIndex", oIndex)}
                                  className="text-xs text-muted-foreground hover:text-foreground shrink-0 h-8"
                                >
                                  Mark correct
                                </Button>
                              )}
                              {(q.options || []).length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(qIndex, oIndex)}
                                  className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0 shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(qIndex)}
                            className="w-fit text-xs"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" /> Add option
                          </Button>
                        </div>
                        <div className="flex gap-4 items-center pt-1 border-t border-border/50">
                          <Label className="text-xs">Correct index (0-based):</Label>
                          <Input
                            type="number"
                            min={0}
                            max={Math.max(0, (q.options?.length ?? 1) - 1)}
                            value={q.correctAnswerIndex}
                            onChange={(e) =>
                              updateQuestion(
                                qIndex,
                                "correctAnswerIndex",
                                parseInt(e.target.value, 10) || 0
                              )
                            }
                            className="w-20 h-8 text-xs"
                          />
                          <Label className="text-xs">Points:</Label>
                          <Input
                            type="number"
                            min={1}
                            value={q.points ?? 1}
                            onChange={(e) =>
                              updateQuestion(
                                qIndex,
                                "points",
                                parseInt(e.target.value, 10) || 1
                              )
                            }
                            className="w-20 h-8 text-xs"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => navigate("/")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating…" : "Create quiz"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

