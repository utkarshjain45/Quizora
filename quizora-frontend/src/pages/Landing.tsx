import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/40">
      <header className="border-b border-border/60 bg-card/70 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-2xl tracking-tight text-primary">
            Quizora
          </span>
          <nav className="flex items-center gap-2">
            <Link to="/signin">
              <Button variant="ghost" className="text-foreground">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button className="shadow-sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground max-w-2xl mb-5 leading-tight">
          Take quizzes. Track scores. Get better.
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mb-12 leading-relaxed">
          Enter a quiz code from your instructor, answer the questions, and see your results. Simple and fast.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/signup">
            <Button size="lg" className="text-base px-8 shadow-md hover:shadow-lg transition-shadow">
              Create account
            </Button>
          </Link>
          <Link to="/signin">
            <Button size="lg" variant="outline" className="text-base border-2">
              Sign In
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-sm text-muted-foreground bg-card/30">
        <div className="container mx-auto px-4">Quizora — Quiz platform</div>
      </footer>
    </div>
  );
}
