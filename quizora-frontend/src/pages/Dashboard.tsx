import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { QuizCodeEntry } from "./QuizCodeEntry";
import { Landing } from "./Landing";

const Dashboard = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Landing />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <QuizCodeEntry />
      </main>
    </div>
  );
};

export default Dashboard;
