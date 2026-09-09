export interface QuestionAiAnalysis {
  questionId: string;
  conceptOrTopic?: string;
  correctAnswerExplanation: string;
  whyChosenWasWrong: string;
  keyTakeaway: string;
}

export interface QuizAiAnalysisResult {
  overallFeedback: string;
  recommendations: string[];
  questions: Record<string, QuestionAiAnalysis>;
  analyzedAt: string;
}

export interface WrongQuestionItem {
  questionId: string;
  questionText: string;
  options: string[];
  selectedOptionIndex: number;
  selectedOptionText: string;
  correctOptionIndex: number;
  correctOptionText: string;
  points: number;
}
