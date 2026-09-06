import type { SignInRequest, SignUpRequest } from "@/types/auth";
import type {
  Quiz,
  QuizCodeRequest,
  QuizSubmissionRequest,
  QuizSubmissionResponse,
  QuizAttemptResponse,
  QuizAnalysisResponse,
  CreateQuizRequest,
} from "@/types/quiz";
import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.VITE_APP_API_URL });

api.interceptors.request.use((config) => {
  if (config.url?.startsWith("/api/v1/auth")) {
    return config;
  }

  const userSession = localStorage.getItem("userSession");
  if (userSession) {
    const { token } = JSON.parse(userSession);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const signIn = (signInRequest: SignInRequest) =>
  api.post("/api/v1/auth/login", signInRequest);

export const signUp = (signUpRequest: SignUpRequest) =>
  api.post("/api/v1/auth/signup", signUpRequest);

export const getUserData = () => api.get("/api/v1/users/me");

export const validateQuizCode = (request: QuizCodeRequest) =>
  api.post<Quiz>("/api/v1/quiz/validate-code", request);

export const submitQuiz = (request: QuizSubmissionRequest) =>
  api.post<QuizSubmissionResponse>("/api/v1/quiz/submit", request);

export const getQuizAttempt = (quizCode: string) =>
  api.get<QuizAttemptResponse>(`/api/v1/quiz/${quizCode}/attempt`);

export const getQuizAnalysis = (quizCode: string) =>
  api.get<QuizAnalysisResponse>(`/api/v1/quiz/${quizCode}/analysis`);

export const hasAttemptedQuiz = (quizCode: string) =>
  api.get<boolean>(`/api/v1/quiz/${quizCode}/has-attempted`);

export const createQuiz = (request: CreateQuizRequest) =>
  api.post<Quiz>("/api/v1/admin/quiz/create", request);

export const uploadQuizFile = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post<Quiz>("/api/v1/admin/quiz/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
