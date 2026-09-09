import type { QuestionAiAnalysis, QuizAiAnalysisResult, WrongQuestionItem } from "@/types/ai";
import type { QuestionAnalysis } from "@/types/quiz";

const GEMINI_STORAGE_KEY = "quizora_gemini_api_key";

export function getGeminiApiKey(): string {
  const customKey = localStorage.getItem(GEMINI_STORAGE_KEY);
  if (customKey && customKey.trim().length > 0) {
    return customKey.trim();
  }
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === "string" && envKey.trim().length > 0) {
    return envKey.trim();
  }
  return "";
}

export function setGeminiApiKey(key: string): void {
  if (!key || key.trim().length === 0) {
    localStorage.removeItem(GEMINI_STORAGE_KEY);
  } else {
    localStorage.setItem(GEMINI_STORAGE_KEY, key.trim());
  }
}

export function clearGeminiApiKey(): void {
  localStorage.removeItem(GEMINI_STORAGE_KEY);
}

export function hasGeminiApiKey(): boolean {
  return getGeminiApiKey().length > 0;
}

export function isEnvApiKey(): boolean {
  const customKey = localStorage.getItem(GEMINI_STORAGE_KEY);
  if (customKey && customKey.trim().length > 0) {
    return false;
  }
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  return Boolean(envKey && typeof envKey === "string" && envKey.trim().length > 0);
}

/**
 * Filters and formats only the questions where the user made an error
 * (strictly wrong answers: attempted, but not correct).
 */
export function extractWrongQuestions(questions: QuestionAnalysis[]): WrongQuestionItem[] {
  return questions
    .filter((q) => {
      // Must not be correct and must not be unattempted
      const isCorrect = q.isCorrect ?? q.correct ?? false;
      const isUnattempted = q.isUnattempted ?? q.unattempted ?? (q.selectedOption === null || q.selectedOption === undefined);
      return !isCorrect && !isUnattempted && q.selectedOption !== null && q.selectedOption !== undefined;
    })
    .map((q) => {
      const selectedIndex = q.selectedOption ?? -1;
      const correctIndex = q.correctAnswerIndex;
      return {
        questionId: q.questionId,
        questionText: q.questionText,
        options: q.options,
        selectedOptionIndex: selectedIndex,
        selectedOptionText: selectedIndex >= 0 && selectedIndex < q.options.length ? q.options[selectedIndex] : "Unknown",
        correctOptionIndex: correctIndex,
        correctOptionText: correctIndex >= 0 && correctIndex < q.options.length ? q.options[correctIndex] : "Unknown",
        points: q.points ?? 1,
      };
    });
}

/**
 * Calls the Google Gemini API to analyze ONLY the wrong answers and explain the correct answers.
 */
export async function analyzeWrongAnswersWithGemini(
  wrongQuestions: WrongQuestionItem[],
  quizTitle: string
): Promise<QuizAiAnalysisResult> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_KEY_MISSING: Please configure your Gemini API Key first.");
  }

  if (wrongQuestions.length === 0) {
    return {
      overallFeedback: "Great job! You have no wrong answers to analyze.",
      recommendations: ["Keep up the great work!", "Try more advanced topics to challenge yourself."],
      questions: {},
      analyzedAt: new Date().toISOString(),
    };
  }

  const prompt = `
You are an expert tutor providing academic analysis of a student's quiz performance.
Quiz Title: "${quizTitle || "Quiz"}"

CRITICAL INSTRUCTION:
Analyze ONLY the wrong answers provided below. Do not invent any other questions.
For every wrong question, thoroughly explain why the correct answer is right, analyze what mistake or misconception led to the student's selected wrong answer, and give a memorable key takeaway.

Wrong Questions Data:
${JSON.stringify(
  wrongQuestions.map((q, idx) => ({
    questionNumber: idx + 1,
    questionId: q.questionId,
    questionText: q.questionText,
    allOptions: q.options.map((opt, i) => `${String.fromCharCode(65 + i)}: ${opt}`),
    studentChose: `${String.fromCharCode(65 + q.selectedOptionIndex)}: ${q.selectedOptionText}`,
    correctAnswer: `${String.fromCharCode(65 + q.correctOptionIndex)}: ${q.correctOptionText}`,
  })),
  null,
  2
)}

Return a strict, valid JSON object matching this schema:
{
  "overallFeedback": "A concise 2-3 sentence diagnostic summary explaining common patterns or gaps observed across these specific wrong answers.",
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "questions": {
    "<questionId>": {
      "questionId": "<exact questionId from input>",
      "conceptOrTopic": "Name of the core concept or topic being tested",
      "correctAnswerExplanation": "Comprehensive explanation of why the correct answer is true, the underlying formula, logic, or concept.",
      "whyChosenWasWrong": "Detailed analysis of why the student's chosen option is wrong, identifying the likely trap, confusion, or misconception that caused them to choose it.",
      "keyTakeaway": "A 1-2 sentence actionable tip or rule of thumb to remember for future questions on this concept."
    }
  }
}
`;

  // Try gemini-2.0-flash, fallback to gemini-1.5-flash
  const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error?.message || `HTTP error ${response.status}: ${response.statusText}`;

        if (response.status === 400 && errorMessage.toLowerCase().includes("api_key")) {
          throw new Error("INVALID_API_KEY: The provided Gemini API Key is invalid. Please check and re-enter your key.");
        }
        if (response.status === 429) {
          throw new Error("RATE_LIMIT: Gemini API rate limit exceeded. Please wait a moment or try another API key.");
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error("Empty response received from Gemini API.");
      }

      // Clean up markdown block fences if any
      let cleaned = rawText.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```\s*/i, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(cleaned) as {
        overallFeedback?: string;
        recommendations?: string[];
        questions?: Record<string, Partial<QuestionAiAnalysis>>;
      };

      // Validate & structure result
      const questionsMap: Record<string, QuestionAiAnalysis> = {};
      if (parsed.questions && typeof parsed.questions === "object") {
        for (const [key, value] of Object.entries(parsed.questions)) {
          const item = (value || {}) as Partial<QuestionAiAnalysis>;
          questionsMap[item.questionId || key] = {
            questionId: item.questionId || key,
            conceptOrTopic: item.conceptOrTopic || "Concept Review",
            correctAnswerExplanation: item.correctAnswerExplanation || "No explanation provided.",
            whyChosenWasWrong: item.whyChosenWasWrong || "Incorrect choice.",
            keyTakeaway: item.keyTakeaway || "Review this topic carefully.",
          };
        }
      }

      return {
        overallFeedback: parsed.overallFeedback || "AI analysis of your mistakes completed.",
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        questions: questionsMap,
        analyzedAt: new Date().toISOString(),
      };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      lastError = error;
      // If it was an invalid key or rate limit, no need to retry with another model
      if (error.message.includes("INVALID_API_KEY") || error.message.includes("RATE_LIMIT")) {
        throw error;
      }
      console.warn(`Attempt with ${model} failed, trying next model if available...`, error);
    }
  }

  throw lastError || new Error("Failed to generate AI analysis with Gemini.");
}
