export interface Question {
  id: string;
  questionText: string;
  options: string[];
}

export interface Quiz {
  id: string;
  code: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface QuizCodeRequest {
  code: string;
}

export interface QuizSubmissionRequest {
  quizCode: string;
  answers: Record<string, number>;
}

export interface QuizSubmissionResponse {
  score: number;
  totalMarks: number;
  isRetake: boolean;
}

export interface QuizAttemptResponse {
  score: number;
  totalMarks: number;
  attemptedAt: string;
}

export interface CreateQuizQuestionRequest {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  points?: number;
}

export interface CreateQuizRequest {
  code: string;
  title: string;
  description: string;
  questions: CreateQuizQuestionRequest[];
}

export interface QuestionAnalysis {
  questionId: string;
  questionText: string;
  options: string[];
  selectedOption: number | null;
  correctAnswerIndex: number;
  points: number;
  isCorrect: boolean;
  isUnattempted: boolean;
}

export interface QuizAnalysisResponse {
  quizCode: string;
  quizTitle: string;
  quizDescription: string;
  score: number;
  totalMarks: number;
  attemptedAt: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  questions: QuestionAnalysis[];
}

