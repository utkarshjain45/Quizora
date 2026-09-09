import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  KeyRound,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  getGeminiApiKey,
  setGeminiApiKey,
  clearGeminiApiKey,
  isEnvApiKey,
} from "@/api/gemini";
import { toast } from "sonner";

interface GeminiApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export function GeminiApiKeyModal({
  isOpen,
  onClose,
  onKeySaved,
}: GeminiApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getGeminiApiKey());
      setTestSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isFromEnv = isEnvApiKey();
  const hasKey = apiKey.trim().length > 0;

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid Gemini API key");
      return;
    }
    setGeminiApiKey(apiKey.trim());
    toast.success("Gemini API key saved successfully!");
    onKeySaved?.();
    onClose();
  };

  const handleClear = () => {
    clearGeminiApiKey();
    setApiKey("");
    setTestSuccess(null);
    toast.info("Custom API key removed");
  };

  const handleTestKey = async () => {
    const keyToTest = apiKey.trim() || getGeminiApiKey();
    if (!keyToTest) {
      toast.error("Please enter an API key to test");
      return;
    }

    setTesting(true);
    setTestSuccess(null);

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
          keyToTest
        )}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: "ping" }] }],
          }),
        }
      );

      if (!res.ok) {
        // Fallback test to gemini-1.5-flash
        const fallbackRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(
            keyToTest
          )}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: "ping" }] }],
            }),
          }
        );

        if (!fallbackRes.ok) {
          const errData = await fallbackRes.json().catch(() => null);
          throw new Error(errData?.error?.message || "Invalid API key or network error");
        }
      }

      setTestSuccess(true);
      toast.success("Gemini API Key is valid and working!");
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setTestSuccess(false);
      toast.error(`Key validation failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card border-2 border-border shadow-2xl rounded-2xl p-6 sm:p-7 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Gemini API Key
              {hasKey && (
                <Badge
                  variant="outline"
                  className={`text-[11px] font-medium ${
                    isFromEnv
                      ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                      : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                  }`}
                >
                  {isFromEnv ? ".env Configured" : "Configured"}
                </Badge>
              )}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Provide a Google Gemini API key to enable AI-powered analysis of your wrong quiz answers.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-normal text-primary hover:underline flex items-center gap-1"
              >
                Get Free Gemini Key <ExternalLink className="h-3 w-3" />
              </a>
            </label>

            <div className="relative flex items-center">
              <KeyRound className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestSuccess(null);
                }}
                placeholder="AIzaSy..."
                className="pl-10 pr-10 font-mono text-sm py-2.5 h-11"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-muted-foreground hover:text-foreground p-1"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Validation feedback */}
          {testSuccess === true && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Key validated successfully! Ready for AI analysis.</span>
            </div>
          )}

          {testSuccess === false && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs font-medium border border-rose-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Key validation failed. Please verify the API key.</span>
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/60 space-y-1">
            <p className="font-medium text-foreground">💡 How your key is stored:</p>
            <p>
              Your key is saved locally in your browser's <code className="text-xs bg-muted px-1 py-0.5 rounded">localStorage</code> and is only sent directly to Google's official Gemini API endpoints.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {hasKey && !isFromEnv && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 gap-1.5 w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestKey}
              disabled={testing || !apiKey.trim()}
              className="gap-1.5 w-full sm:w-auto"
            >
              {testing ? "Testing..." : "Test Key"}
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="bg-primary hover:bg-primary/90 gap-1.5 w-full sm:w-auto"
            >
              Save Key
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
