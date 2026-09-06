import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { SignIn } from "./pages/SignIn";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import { SignUp } from "./pages/SignUp";
import { QuizCodeEntry } from "./pages/QuizCodeEntry";
import { QuizTaking } from "./pages/QuizTaking";
import { QuizResult } from "./pages/QuizResult";
import { AdminCreateQuiz } from "./pages/AdminCreateQuiz";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/quiz/enter" element={<QuizCodeEntry />} />
          <Route path="/quiz/:quizCode/take" element={<QuizTaking />} />
          <Route path="/quiz/:quizCode/result" element={<QuizResult />} />
          <Route path="/admin/create-quiz" element={<AdminCreateQuiz />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
