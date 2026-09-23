'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useLoading } from '../../components/LoadingProvider';
import { LoadingButton } from '../../components/LoadingButton';
import { MockOfferLogo } from '../../components/MockOfferLogo';
import { AppBackground } from '../../components/ui/AppBackground';
import { AIOrb, AIStatusChip, AIStatus } from '../../components/ui/AIOrb';
import { FeedbackView } from '../../components/FeedbackView';
import {
  ArrowLeft, Play, Stop, Reset, Clock, Code, Send, Sparkle, X,
  Terminal, Bulb, Plus, Minus, Copy, Download, Maximize, Minimize, Cog, Check,
} from '../../components/ui/icons';

interface InterviewSetup {
  company: { id: string; name: string };
  experience: number;
  role: string;
  timestamp: number;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  defaultCode: string;
  company?: string;
  experienceLevel?: string;
  role?: string;
  languageTemplates?: Record<string, string>;
}

interface CaseResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

interface RunResult {
  stdout?: string;
  stderr: string;
  code: number | null;
  compileOutput?: string;
  error?: string;
  results?: CaseResult[];
}

const FILE_EXT: Record<string, string> = {
  javascript: 'js', typescript: 'ts', python: 'py', java: 'java',
  cpp: 'cpp', csharp: 'cs', go: 'go', rust: 'rs',
};

const EDITOR_PREFS_KEY = 'mockoffer_editor_prefs';
const ACTIVE_SESSION_KEY = 'mockoffer_active_session';
const draftKey = (problemId: string, lang: string) => `mockoffer_draft_${problemId}_${lang}`;

export default function InterviewPage() {
  const { user } = useUser();
  const { setLoading, setLoadingMessage } = useLoading();
  const [interviewSetup, setInterviewSetup] = useState<InterviewSetup | null>(null);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [customTime, setCustomTime] = useState(30);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [initialTimeLeft, setInitialTimeLeft] = useState(30 * 60);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const hasLoadedRef = useRef(false);

  // --- Editor preferences (persisted to localStorage) ---
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('on');
  const [minimap, setMinimap] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- Editor status ---
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [copied, setCopied] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // --- Hints ---
  const [hints, setHints] = useState<string[]>([]);
  const [isHintLoading, setIsHintLoading] = useState(false);

  // --- Run ---
  const [showRunConsole, setShowRunConsole] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [runMode, setRunMode] = useState<'examples' | 'raw'>('examples');
  const [stdin, setStdin] = useState('');

  // Language options for the code editor
  const languageOptions = [
    { value: 'javascript', label: 'JavaScript', defaultCode: 'function solution() {\n    // Write your solution here\n    \n}' },
    { value: 'typescript', label: 'TypeScript', defaultCode: 'function solution(): void {\n    // Write your solution here\n    \n}' },
    { value: 'python', label: 'Python', defaultCode: 'def solution():\n    # Write your solution here\n    pass' },
    { value: 'java', label: 'Java', defaultCode: 'class Solution {\n    public void solve() {\n        // Write your solution here\n    }\n}' },
    { value: 'cpp', label: 'C++', defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}' },
    { value: 'csharp', label: 'C#', defaultCode: 'using System;\n\npublic class Solution {\n    public void Solve() {\n        // Write your solution here\n    }\n}' },
    { value: 'go', label: 'Go', defaultCode: 'package main\n\nfunc solution() {\n    // Write your solution here\n}' },
    { value: 'rust', label: 'Rust', defaultCode: 'fn solution() {\n    // Write your solution here\n}' },
  ];

  const readDraft = (problemId: string, lang: string): string | null => {
    try {
      return localStorage.getItem(draftKey(problemId, lang));
    } catch {
      return null;
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    // Prefer a saved draft for the target language.
    const draft = currentProblem ? readDraft(currentProblem.id, newLanguage) : null;

    const currentLangOption = languageOptions.find((l) => l.value === language);

    // Check if code is essentially empty/default (just template or very minimal)
    const isCodeDefault = !code ||
      code === currentLangOption?.defaultCode ||
      code === currentProblem?.defaultCode ||
      (currentProblem?.languageTemplates && code === currentProblem.languageTemplates[language]) ||
      code.trim().length < 50;

    setLanguage(newLanguage);

    if (draft != null) {
      setCode(draft);
      return;
    }

    // If user hasn't written significant code, switch to new language template
    if (isCodeDefault) {
      if (currentProblem?.languageTemplates && currentProblem.languageTemplates[newLanguage]) {
        setCode(currentProblem.languageTemplates[newLanguage]);
      } else {
        const langOption = languageOptions.find((l) => l.value === newLanguage);
        if (langOption) {
          setCode(langOption.defaultCode);
        }
      }
    }
  };

  // Load editor preferences once.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(EDITOR_PREFS_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.fontSize === 'number') setFontSize(p.fontSize);
        if (p.wordWrap === 'on' || p.wordWrap === 'off') setWordWrap(p.wordWrap);
        if (typeof p.minimap === 'boolean') setMinimap(p.minimap);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Persist editor preferences.
  useEffect(() => {
    try {
      localStorage.setItem(EDITOR_PREFS_KEY, JSON.stringify({ fontSize, wordWrap, minimap }));
    } catch {
      /* ignore */
    }
  }, [fontSize, wordWrap, minimap]);

  // Load the interview: restore a persisted session on refresh, or generate a
  // fresh question when a new interview was just started.
  useEffect(() => {
    // Prevent double execution in React strict mode
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const applyProblem = (problem: Problem, setup: InterviewSetup | null) => {
      if (setup) setInterviewSetup(setup);
      setCurrentProblem(problem);
      const template =
        (problem.languageTemplates && problem.languageTemplates[language]) || problem.defaultCode;
      const draft = readDraft(problem.id, language);
      setCode(draft ?? template);
    };

    const loadInterviewQuestion = async () => {
      // Add a small delay to ensure localStorage is ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      const setupData = localStorage.getItem('interview_setup');

      let setup: InterviewSetup | null = null;
      try {
        setup = setupData ? (JSON.parse(setupData) as InterviewSetup) : null;
      } catch {
        setup = null;
      }

      let saved: { setup: InterviewSetup; problem: Problem } | null = null;
      try {
        const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
        saved = raw ? JSON.parse(raw) : null;
      } catch {
        saved = null;
      }

      // A brand-new interview is one whose setup differs from the saved session.
      const isNewStart = !!setup && (!saved || saved.setup?.timestamp !== setup.timestamp);

      // Refresh case: reuse the persisted problem so it survives a reload.
      if (!isNewStart && saved?.problem) {
        applyProblem(saved.problem, saved.setup);
        setIsLoadingQuestion(false);
        setLoading(false);
        // Consume any leftover setup so it can't trigger a regenerate later.
        if (setup) localStorage.removeItem('interview_setup');
        return;
      }

      if (isNewStart && setup) {
        setInterviewSetup(setup);
        setIsLoadingQuestion(true);
        setLoading(true);
        setLoadingMessage('MockOffer is checking past interview experiences...');

        try {
          const response = await fetch('/api/ai/generate-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              company: setup.company.name,
              role: setup.role,
              experienceLevel: setup.experience,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API error: ${errorData.error || response.statusText}`);
          }

          const question = await response.json() as Problem;

          if ('error' in question) {
            throw new Error((question as any).error);
          }

          // Ensure examples and constraints are always arrays
          const normalizedQuestion: Problem = {
            ...question,
            examples: Array.isArray(question.examples) && question.examples.length > 0
              ? question.examples
              : [{ input: 'See problem description', output: 'Expected output', explanation: 'Work through the problem' }],
            constraints: Array.isArray(question.constraints) ? question.constraints : [],
            languageTemplates: question.languageTemplates || {},
          };

          applyProblem(normalizedQuestion, setup);

          // Persist the active session so a refresh restores the same question,
          // then consume the one-shot setup.
          try {
            localStorage.setItem(
              ACTIVE_SESSION_KEY,
              JSON.stringify({ setup, problem: normalizedQuestion }),
            );
          } catch {
            /* ignore */
          }
          localStorage.removeItem('interview_setup');
        } catch (aiError) {
          console.error('Failed to generate AI question:', aiError);
          setIsLoadingQuestion(false);
          setLoading(false);

          alert(`Sorry, we couldn't generate a personalized interview question right now.
Error: ${aiError instanceof Error ? aiError.message : 'Unknown error'}

Please check your internet connection and try again.`);

          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
          return;
        }

        setIsLoadingQuestion(false);
        setLoading(false);
        return;
      }

      // Nothing to show - back to the dashboard.
      setIsLoadingQuestion(false);
      setLoading(false);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    };

    loadInterviewQuestion();
  }, [setLoadingMessage]);

  // Autosave the current code as a per-problem, per-language draft.
  useEffect(() => {
    if (!currentProblem || isLoadingQuestion) return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem(draftKey(currentProblem.id, language), code);
        setDraftSaved(true);
      } catch {
        /* ignore */
      }
    }, 600);
    return () => clearTimeout(id);
  }, [code, language, currentProblem, isLoadingQuestion]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      // Auto-submit when time runs out
      handleSubmit();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setLoading(true);
    setLoadingMessage('Setting up interview timer...');
    setTimeout(() => {
      setTimeLeft(customTime * 60);
      setInitialTimeLeft(customTime * 60);
      setSessionStartTime(Date.now());
      setIsTimerRunning(true);
      setLoading(false);
    }, 500);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setLoading(true);
    setLoadingMessage('Resetting timer...');
    setTimeout(() => {
      setIsTimerRunning(false);
      setTimeLeft(customTime * 60);
      setInitialTimeLeft(customTime * 60);
      setSessionStartTime(Date.now());
      setLoading(false);
    }, 300);
  };

  const saveInterviewToHistory = (feedback: string) => {
    if (!user) return; // Don't save if no user

    const timeSpent = initialTimeLeft - timeLeft;
    const interviewData = {
      id: `interview_${Date.now()}`,
      timestamp: sessionStartTime,
      problemTitle: currentProblem?.title || 'Unknown Problem',
      code: code,
      feedback: feedback,
      timeSpent: timeSpent,
      completed: true,
      company: interviewSetup?.company.name || 'General',
      role: interviewSetup?.role || 'Software Engineer',
      experience: interviewSetup?.experience || 0,
    };

    try {
      const storageKey = `mockoffer_interviews_${user.id}`;
      const existingInterviews = localStorage.getItem(storageKey);
      const interviews = existingInterviews ? JSON.parse(existingInterviews) : [];
      interviews.unshift(interviewData); // Add to beginning of array

      // Keep only last 20 interviews
      const limitedInterviews = interviews.slice(0, 20);

      localStorage.setItem(storageKey, JSON.stringify(limitedInterviews));
    } catch (error) {
      console.error('Error saving interview to localStorage:', error);
    }
  };

  const handleSubmit = async () => {
    if (!currentProblem) return;

    setIsGeneratingFeedback(true);
    setShowFeedback(true);

    try {
      // Generate AI-powered feedback via API route
      const response = await fetch('/api/ai/generate-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          problem: `${currentProblem.title}\n\n${currentProblem.description}`,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Feedback API error: ${response.status}`);
      }

      const feedbackResponse = await response.json();

      // Format the feedback for display
      const formattedFeedback = `
## AI Code Analysis

**Time Complexity:** ${feedbackResponse.timeComplexity}
**Space Complexity:** ${feedbackResponse.spaceComplexity}

## Correctness Analysis:
${feedbackResponse.correctness.isCorrect ? '✅ **Solution is correct!**' : '❌ **Issues found:**'}
${feedbackResponse.correctness.issues.length > 0 ? feedbackResponse.correctness.issues.map((issue: string) => `- ${issue}`).join('\n') : ''}

## Code Quality (Score: ${feedbackResponse.codeQuality.score}/10):
${feedbackResponse.codeQuality.improvements.map((improvement: string) => `- ${improvement}`).join('\n')}

## Optimization Suggestions:
${feedbackResponse.optimization.suggestions.map((suggestion: string) => `- ${suggestion}`).join('\n')}
${feedbackResponse.optimization.optimizedCode ? `

### Optimized Solution:
\`\`\`javascript
${feedbackResponse.optimization.optimizedCode}
\`\`\`` : ''}

## Edge Cases to Consider:
${feedbackResponse.edgeCases.map((edgeCase: string) => `- ${edgeCase}`).join('\n')}
      `.trim();

      setFeedback(formattedFeedback);

      // Save interview to localStorage
      saveInterviewToHistory(formattedFeedback);
    } catch (error) {
      console.error('Error generating feedback:', error);
      const fallbackFeedback = `
## Code Analysis

**Analysis Error:** Unable to generate detailed feedback at this time.

**General Tips:**
- Review your solution for correctness
- Consider time and space complexity
- Think about edge cases
- Test with the provided examples

Please try again or check your internet connection.
      `.trim();

      setFeedback(fallbackFeedback);
      saveInterviewToHistory(fallbackFeedback);
    } finally {
      setIsGeneratingFeedback(false);

      // Stop the timer
      setIsTimerRunning(false);
    }
  };

  // Keep a live ref to handleSubmit so the editor keyboard shortcut always
  // calls the latest version (avoids submitting stale code).
  const submitRef = useRef(handleSubmit);
  submitRef.current = handleSubmit;

  // Restore the starting template for the current language.
  const resetCode = () => {
    if (currentProblem?.languageTemplates && currentProblem.languageTemplates[language]) {
      setCode(currentProblem.languageTemplates[language]);
    } else {
      const langOption = languageOptions.find((l) => l.value === language);
      setCode(langOption?.defaultCode ?? currentProblem?.defaultCode ?? '');
    }
    setDraftSaved(false);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const downloadCode = () => {
    const ext = FILE_EXT[language] || 'txt';
    const name = (currentProblem?.title || 'solution')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 40) || 'solution';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Run the code. In "examples" mode the server assembles a driver around the
  // candidate's function and runs it against each example; "raw" mode executes
  // the file as-is with optional stdin.
  const runCode = useCallback(async (mode: 'examples' | 'raw') => {
    if (!code.trim() || isRunning) return;
    setIsRunning(true);
    setRunResult(null);
    try {
      const res =
        mode === 'examples'
          ? await fetch('/api/run/harness', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ language, code, examples: currentProblem?.examples ?? [] }),
            })
          : await fetch('/api/run', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ language, code, stdin }),
            });
      const data = await res.json();
      if (!res.ok) {
        setRunResult({ stderr: '', code: null, error: data.error || 'Run failed' });
      } else {
        setRunResult(data as RunResult);
      }
    } catch {
      setRunResult({ stderr: '', code: null, error: 'Could not reach the run service.' });
    } finally {
      setIsRunning(false);
    }
  }, [code, language, stdin, isRunning, currentProblem]);

  const hasRunnableExamples = (currentProblem?.examples ?? []).some(
    (e) => e.input && e.input !== 'See problem description',
  );

  const openRunConsole = () => {
    setShowRunConsole(true);
    const mode: 'examples' | 'raw' = hasRunnableExamples ? 'examples' : 'raw';
    setRunMode(mode);
    runCode(mode);
  };

  // Request the next progressive hint (max 3).
  const getHint = async () => {
    if (isHintLoading || hints.length >= 3 || !currentProblem) return;
    setIsHintLoading(true);
    try {
      const res = await fetch('/api/ai/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: `${currentProblem.title}\n\n${currentProblem.description}`,
          code,
          language,
          level: hints.length + 1,
        }),
      });
      const data = await res.json();
      if (res.ok && data.hint) {
        setHints((prev) => [...prev, data.hint]);
      }
    } catch {
      /* ignore */
    } finally {
      setIsHintLoading(false);
    }
  };

  // Derived AI presence status for the interviewer indicator
  const aiStatus: AIStatus = isGeneratingFeedback
    ? 'evaluating'
    : isLoadingQuestion
    ? 'thinking'
    : isTimerRunning
    ? 'listening'
    : 'ready';

  const timerLow = isTimerRunning && timeLeft <= 60;
  const diffClass =
    currentProblem?.difficulty === 'Easy'
      ? 'diff-easy'
      : currentProblem?.difficulty === 'Hard'
      ? 'diff-hard'
      : 'diff-medium';

  const interviewerMessage = interviewSetup
    ? `I'm your interviewer for this ${interviewSetup.company.name} ${interviewSetup.role} round. Read the problem carefully, talk through your approach, then code when you're ready.`
    : "Read the problem carefully and think through your approach. Start the timer when you're ready, and submit for an honest review of your solution.";

  const langLabel = languageOptions.find((l) => l.value === language)?.label ?? language;
  const editorBusy = isLoadingQuestion || !currentProblem;
  const passedCount = runResult?.results?.filter((r) => r.passed).length ?? 0;

  const editorOptions: editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: minimap },
    fontSize,
    lineNumbers: 'on',
    automaticLayout: true,
    scrollBeyondLastLine: false,
    wordWrap: wordWrap,
    tabSize: 2,
    padding: { top: 16 },
    fontFamily: 'var(--font-mono), ui-monospace, monospace',
    fontLigatures: true,
  };

  return (
    <div className="relative flex min-h-screen flex-col">
      <AppBackground variant="app" />

      {/* Top bar */}
      <header className="sticky top-0 z-40">
        <div className="glass border-b">
          <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-2 sm:gap-4">
              <Link href="/dashboard" className="btn btn-ghost btn-sm -ml-2" aria-label="Back to dashboard">
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Exit</span>
              </Link>
              <Link href="/dashboard" aria-label="MockOffer home" className="shrink-0">
                <MockOfferLogo size={24} showCursor={false} />
              </Link>
              {interviewSetup && (
                <div className="hidden min-w-0 items-center gap-2 border-l pl-4 md:flex" style={{ borderColor: 'var(--color-line)' }}>
                  <span className="truncate text-sm text-[color:var(--color-fg-muted)]">
                    {interviewSetup.role} <span className="text-[color:var(--color-fg-subtle)]">at</span>{' '}
                    <span className="font-medium text-[color:var(--color-fg)]">{interviewSetup.company.name}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Timer + controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className="mono flex items-center gap-2 rounded-lg px-3 py-1.5 text-base font-semibold tabular-nums transition-colors sm:text-lg"
                style={{
                  background: 'var(--color-inset)',
                  border: `1px solid ${timerLow ? 'var(--color-danger)' : 'var(--color-line)'}`,
                  color: timerLow ? 'var(--color-danger)' : 'var(--color-fg)',
                }}
              >
                <Clock size={15} className={timerLow ? '' : 'text-[color:var(--color-fg-subtle)]'} />
                {formatTime(timeLeft)}
              </div>

              <div className="hidden items-center gap-1.5 sm:flex">
                {!isTimerRunning ? (
                  <button onClick={startTimer} className="btn btn-secondary btn-sm" aria-label="Start timer">
                    <Play size={15} />
                    <span className="hidden lg:inline">Start</span>
                  </button>
                ) : (
                  <button onClick={stopTimer} className="btn btn-secondary btn-sm" aria-label="Stop timer">
                    <Stop size={15} />
                    <span className="hidden lg:inline">Pause</span>
                  </button>
                )}
                <button onClick={resetTimer} className="btn btn-ghost btn-sm" aria-label="Reset timer">
                  <Reset size={15} />
                </button>
                <div className="flex items-center gap-1.5 pl-1">
                  <input
                    type="number"
                    value={customTime}
                    onChange={(e) => setCustomTime(Number(e.target.value))}
                    className="field w-14 px-2 py-1.5 text-center text-sm"
                    min="1"
                    max="120"
                    aria-label="Timer minutes"
                  />
                  <span className="text-xs text-[color:var(--color-fg-subtle)]">min</span>
                </div>
              </div>

              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'h-8 w-8 rounded-full ring-1 ring-[color:var(--color-line-strong)]',
                  },
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Workspace */}
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-4 sm:px-6 sm:py-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] xl:grid-cols-[280px_minmax(0,1fr)_minmax(0,1fr)]">
          {/* ── AI interviewer ── */}
          <aside className="xl:sticky xl:top-20 xl:self-start">
            <div className="card p-5">
              <div className="flex items-center gap-3">
                <AIOrb size={44} status={aiStatus} />
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold">AI Interviewer</h3>
                  <div className="mt-1">
                    <AIStatusChip status={aiStatus} />
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-xl p-4" style={{ background: 'var(--color-inset)', border: '1px solid var(--color-line)' }}>
                <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                  {interviewerMessage}
                </p>
              </div>

              {/* Hints */}
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="eyebrow flex items-center gap-1.5">
                    <Bulb size={13} className="text-[color:var(--color-gold-bright)]" />
                    Hints
                  </div>
                  <span className="mono text-xs text-[color:var(--color-fg-subtle)]">{hints.length}/3</span>
                </div>
                {hints.length > 0 && (
                  <ul className="mb-3 space-y-2">
                    {hints.map((h, i) => (
                      <li
                        key={i}
                        className="animate-fade-up rounded-lg p-3 text-sm leading-relaxed text-[color:var(--color-fg-muted)]"
                        style={{ background: 'rgba(230,178,74,0.06)', border: '1px solid rgba(230,178,74,0.18)' }}
                      >
                        <span className="mono mr-1.5 text-xs text-[color:var(--color-gold-bright)]">{i + 1}.</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={getHint}
                  disabled={isHintLoading || hints.length >= 3 || editorBusy}
                  className="btn btn-secondary btn-sm w-full justify-center"
                >
                  {isHintLoading ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: 'var(--color-gold)', borderRightColor: 'var(--color-gold)' }} />
                      Thinking…
                    </>
                  ) : hints.length >= 3 ? (
                    'No more hints'
                  ) : hints.length === 0 ? (
                    <>
                      <Bulb size={14} />
                      Stuck? Get a hint
                    </>
                  ) : (
                    <>
                      <Bulb size={14} />
                      Next hint
                    </>
                  )}
                </button>
                {hints.length > 0 && hints.length < 3 && (
                  <p className="mt-2 text-center text-xs text-[color:var(--color-fg-subtle)]">
                    Hints get more specific each time.
                  </p>
                )}
              </div>

              {currentProblem?.constraints && currentProblem.constraints.length > 0 && (
                <div className="mt-4">
                  <div className="eyebrow mb-2">Constraints</div>
                  <ul className="space-y-1.5">
                    {currentProblem.constraints.map((c, i) => (
                      <li key={i} className="flex gap-2 text-xs text-[color:var(--color-fg-subtle)]">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: 'var(--color-fg-faint)' }} />
                        <span className="mono">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>

          {/* ── Problem ── */}
          <section className="card overflow-hidden">
            {isLoadingQuestion ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center px-6 py-16 text-center">
                <AIOrb size={56} status="thinking" />
                <p className="mt-6 text-base font-medium">Preparing your problem</p>
                <p className="mt-1.5 max-w-xs text-sm text-[color:var(--color-fg-subtle)]">
                  Generating a fresh, on-pattern question tuned to your target role.
                </p>
              </div>
            ) : currentProblem ? (
              <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-6">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl font-semibold tracking-tight">{currentProblem.title}</h1>
                  <span className={`badge ${diffClass} shrink-0`}>{currentProblem.difficulty}</span>
                </div>

                <p className="mt-4 whitespace-pre-line leading-relaxed text-[color:var(--color-fg-muted)]">
                  {currentProblem.description}
                </p>

                <div className="mt-6">
                  <div className="eyebrow mb-3">Examples</div>
                  {currentProblem.examples && currentProblem.examples.length > 0 ? (
                    <div className="space-y-3">
                      {currentProblem.examples.map((example, index) => (
                        <div key={index} className="panel p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="mono text-xs text-[color:var(--color-fg-subtle)]">Example {index + 1}</span>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-gold-bright)]" style={{ letterSpacing: '0.08em' }}>
                                Input
                              </div>
                              <div className="mono overflow-x-auto rounded-lg p-3 text-sm text-[color:var(--color-fg)]" style={{ background: 'var(--color-inset)', border: '1px solid var(--color-line)' }}>
                                {example.input || 'No input provided'}
                              </div>
                            </div>
                            <div>
                              <div className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-success)', letterSpacing: '0.08em' }}>
                                Output
                              </div>
                              <div className="mono overflow-x-auto rounded-lg p-3 text-sm" style={{ background: 'rgba(88,201,139,0.06)', border: '1px solid rgba(88,201,139,0.25)', color: 'var(--color-success)' }}>
                                {example.output || 'No output provided'}
                              </div>
                            </div>
                            {example.explanation && (
                              <div>
                                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-fg-subtle)]" style={{ letterSpacing: '0.08em' }}>
                                  Explanation
                                </div>
                                <p className="text-sm italic text-[color:var(--color-fg-muted)]">{example.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="panel p-4 text-sm text-[color:var(--color-fg-subtle)]">
                      No examples available for this problem.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[400px] flex-col items-center justify-center px-6 py-16 text-center">
                <p className="text-[color:var(--color-fg-muted)]">No problem loaded.</p>
                <Link href="/dashboard" className="btn btn-secondary mt-4">Return to dashboard</Link>
              </div>
            )}
          </section>

          {/* ── Code editor ── */}
          <section
            className={
              isFullscreen
                ? 'card fixed inset-0 z-[85] flex flex-col rounded-none'
                : 'card flex flex-col overflow-hidden xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:self-start'
            }
          >
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2 border-b px-3 py-2.5" style={{ borderColor: 'var(--color-line)' }}>
              <div className="flex items-center gap-2">
                <Code size={16} className="hidden text-[color:var(--color-gold-bright)] sm:block" />
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="field cursor-pointer py-1.5 pl-2.5 pr-8 text-sm"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a2a4ac'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1.1rem',
                    appearance: 'none',
                  }}
                  aria-label="Language"
                >
                  {languageOptions.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>

                {/* Editor tools */}
                <div className="flex items-center">
                  <button onClick={copyCode} className="btn btn-ghost btn-sm px-2" title="Copy code" aria-label="Copy code" disabled={editorBusy}>
                    {copied ? <Check size={15} className="text-[color:var(--color-success)]" /> : <Copy size={15} />}
                  </button>
                  <button onClick={downloadCode} className="btn btn-ghost btn-sm px-2" title="Download code" aria-label="Download code" disabled={editorBusy}>
                    <Download size={15} />
                  </button>
                  <button onClick={resetCode} className="btn btn-ghost btn-sm px-2" title="Reset to starting template" aria-label="Reset code" disabled={editorBusy}>
                    <Reset size={15} />
                  </button>
                  <div className="relative">
                    <button onClick={() => setShowSettings((s) => !s)} className="btn btn-ghost btn-sm px-2" title="Editor settings" aria-label="Editor settings">
                      <Cog size={15} />
                    </button>
                    {showSettings && (
                      <>
                        <div className="fixed inset-0 z-[70]" onClick={() => setShowSettings(false)} />
                        <div
                          className="card animate-scale-in absolute left-0 top-full z-[71] mt-1.5 w-56 p-3"
                          style={{ background: 'var(--color-panel-2)' }}
                        >
                          <div className="mb-3">
                            <div className="mb-1.5 text-xs font-medium text-[color:var(--color-fg-muted)]">Font size</div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setFontSize((f) => Math.max(10, f - 1))} className="btn btn-secondary btn-sm px-2" aria-label="Decrease font size">
                                <Minus size={14} />
                              </button>
                              <span className="mono min-w-8 text-center text-sm">{fontSize}px</span>
                              <button onClick={() => setFontSize((f) => Math.min(24, f + 1))} className="btn btn-secondary btn-sm px-2" aria-label="Increase font size">
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                          <label className="mb-2 flex cursor-pointer items-center justify-between text-sm">
                            <span className="text-[color:var(--color-fg-muted)]">Word wrap</span>
                            <input
                              type="checkbox"
                              checked={wordWrap === 'on'}
                              onChange={(e) => setWordWrap(e.target.checked ? 'on' : 'off')}
                              className="h-4 w-4 accent-[color:var(--color-gold)]"
                            />
                          </label>
                          <label className="flex cursor-pointer items-center justify-between text-sm">
                            <span className="text-[color:var(--color-fg-muted)]">Minimap</span>
                            <input
                              type="checkbox"
                              checked={minimap}
                              onChange={(e) => setMinimap(e.target.checked)}
                              className="h-4 w-4 accent-[color:var(--color-gold)]"
                            />
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => setIsFullscreen((f) => !f)}
                    className="btn btn-ghost btn-sm px-2"
                    title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                    aria-label="Toggle fullscreen"
                  >
                    {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={openRunConsole}
                  className="btn btn-secondary btn-sm"
                  disabled={editorBusy || isRunning}
                  title="Run your code"
                >
                  <Play size={15} />
                  <span className="hidden sm:inline">Run</span>
                </button>
                <kbd
                  className="mono hidden rounded px-1.5 py-0.5 text-[11px] text-[color:var(--color-fg-subtle)] xl:inline-block"
                  style={{ background: 'var(--color-inset)', border: '1px solid var(--color-line)' }}
                >
                  ⌘↵
                </kbd>
                <LoadingButton
                  onClick={handleSubmit}
                  loadingText="Analyzing..."
                  variant="primary"
                  disabled={isGeneratingFeedback || editorBusy}
                >
                  <span className="flex items-center gap-1.5">
                    <Send size={15} />
                    Submit
                  </span>
                </LoadingButton>
              </div>
            </div>

            {/* Editor */}
            <div
              className={isFullscreen ? 'min-h-0 flex-1' : 'h-[380px] sm:h-[460px] xl:h-[calc(100vh-13rem)]'}
              style={{ background: 'var(--color-inset)' }}
            >
              <Editor
                height="100%"
                language={language}
                value={code}
                onChange={(value) => {
                  setCode(value || '');
                  setDraftSaved(false);
                }}
                theme="vs-dark"
                loading={
                  <div className="flex h-full items-center justify-center">
                    <span
                      className="h-7 w-7 animate-spin rounded-full border-2 border-t-transparent"
                      style={{ borderColor: 'var(--color-gold)', borderTopColor: 'transparent' }}
                    />
                  </div>
                }
                onMount={(ed, monaco) => {
                  editorRef.current = ed;
                  ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                    submitRef.current();
                  });
                  ed.onDidChangeCursorPosition((e) => {
                    setCursor({ line: e.position.lineNumber, column: e.position.column });
                  });
                }}
                options={editorOptions}
              />
            </div>

            {/* Status bar */}
            <div
              className="mono flex items-center justify-between gap-3 border-t px-3 py-1.5 text-[11px] text-[color:var(--color-fg-subtle)]"
              style={{ borderColor: 'var(--color-line)', background: 'var(--color-panel)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-[color:var(--color-fg-muted)]">{langLabel}</span>
                <span>Ln {cursor.line}, Col {cursor.column}</span>
                <span className="hidden sm:inline">{code.length} chars</span>
              </div>
              <span className="flex items-center gap-1.5">
                {draftSaved ? (
                  <>
                    <Check size={12} className="text-[color:var(--color-success)]" />
                    Draft saved
                  </>
                ) : (
                  'Saving…'
                )}
              </span>
            </div>
          </section>
        </div>
      </main>

      {/* Run console */}
      {showRunConsole && (
        <div
          className="fixed inset-0 z-[86] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          onClick={() => setShowRunConsole(false)}
        >
          <div
            className="card animate-scale-in flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Run console"
          >
            <div className="flex items-center justify-between gap-4 border-b p-4" style={{ borderColor: 'var(--color-line)' }}>
              <div className="flex items-center gap-2.5">
                <Terminal size={18} className="text-[color:var(--color-gold-bright)]" />
                <h2 className="text-base font-semibold">Run console</h2>
                <span className="mono text-xs text-[color:var(--color-fg-subtle)]">{langLabel}</span>
              </div>
              <button onClick={() => setShowRunConsole(false)} className="btn btn-ghost p-2" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {/* Mode toggle */}
            <div className="flex gap-1 border-b px-4 py-2" style={{ borderColor: 'var(--color-line)' }}>
              {(['examples', 'raw'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setRunMode(m);
                    setRunResult(null);
                    runCode(m);
                  }}
                  disabled={m === 'examples' && !hasRunnableExamples}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40"
                  style={
                    runMode === m
                      ? { background: 'var(--color-inset)', color: 'var(--color-fg)', border: '1px solid var(--color-line-strong)' }
                      : { color: 'var(--color-fg-subtle)', border: '1px solid transparent' }
                  }
                >
                  {m === 'examples' ? 'Against examples' : 'Raw + stdin'}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {runMode === 'examples' ? (
                <>
                  <p className="mb-3 text-xs text-[color:var(--color-fg-subtle)]">
                    Write only your function. We build the driver, call it on each example, and run it for real.
                    <span className="text-[color:var(--color-fg-faint)]"> Match is best-effort (whitespace-insensitive).</span>
                  </p>

                  {isRunning ? (
                    <div className="flex items-center gap-2 py-8 text-sm text-[color:var(--color-fg-subtle)]">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: 'var(--color-gold)', borderRightColor: 'var(--color-gold)' }} />
                      Building harness and running…
                    </div>
                  ) : runResult?.error ? (
                    <pre className="mono whitespace-pre-wrap text-sm text-[color:var(--color-danger)]">{runResult.error}</pre>
                  ) : runResult?.compileOutput ? (
                    <div>
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-danger)]">Compile error</div>
                      <pre className="mono max-h-40 overflow-auto whitespace-pre-wrap text-sm text-[color:var(--color-danger)]">{runResult.compileOutput}</pre>
                    </div>
                  ) : runResult?.results && runResult.results.length > 0 ? (
                    <>
                      <div className="mb-3 flex items-center gap-2">
                        <span
                          className="badge"
                          style={
                            passedCount === runResult.results.length
                              ? { background: 'rgba(88,201,139,0.12)', color: 'var(--color-success)', borderColor: 'rgba(88,201,139,0.3)' }
                              : { background: 'rgba(230,120,120,0.1)', color: 'var(--color-danger)', borderColor: 'rgba(230,120,120,0.3)' }
                          }
                        >
                          {passedCount}/{runResult.results.length} examples matched
                        </span>
                      </div>
                      <div className="space-y-3">
                        {runResult.results.map((r, i) => (
                          <div key={i} className="panel p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="mono text-xs text-[color:var(--color-fg-subtle)]">Example {i + 1}</span>
                              <span
                                className="flex items-center gap-1 text-xs font-medium"
                                style={{ color: r.passed ? 'var(--color-success)' : 'var(--color-danger)' }}
                              >
                                {r.passed ? <><Check size={13} /> matched</> : <><X size={13} /> differs</>}
                              </span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div>
                                <div className="mb-0.5 text-[11px] uppercase tracking-wide text-[color:var(--color-fg-subtle)]">Input</div>
                                <pre className="mono overflow-x-auto rounded p-2 text-xs" style={{ background: 'var(--color-inset)' }}>{r.input}</pre>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <div className="mb-0.5 text-[11px] uppercase tracking-wide text-[color:var(--color-fg-subtle)]">Expected</div>
                                  <pre className="mono overflow-x-auto rounded p-2 text-xs" style={{ background: 'var(--color-inset)' }}>{r.expected || '(none)'}</pre>
                                </div>
                                <div>
                                  <div className="mb-0.5 text-[11px] uppercase tracking-wide" style={{ color: r.passed ? 'var(--color-success)' : 'var(--color-danger)' }}>Your output</div>
                                  <pre className="mono overflow-x-auto rounded p-2 text-xs" style={{ background: 'var(--color-inset)', color: r.passed ? 'var(--color-success)' : 'var(--color-fg)' }}>{r.actual || '(no output)'}</pre>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {runResult.stderr ? (
                        <div className="mt-3">
                          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-danger)]">Stderr</div>
                          <pre className="mono max-h-32 overflow-auto whitespace-pre-wrap text-xs text-[color:var(--color-danger)]">{runResult.stderr}</pre>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-sm text-[color:var(--color-fg-subtle)]">Run to test your function against the examples.</p>
                  )}
                </>
              ) : (
                <>
                  <p className="mb-3 text-xs text-[color:var(--color-fg-subtle)]">
                    Runs your file as-is. Add a <span className="mono">print</span> / <span className="mono">main</span> to produce output.
                  </p>
                  <div className="mb-4">
                    <label className="mb-1.5 block text-xs font-medium text-[color:var(--color-fg-muted)]">Standard input (optional)</label>
                    <textarea
                      value={stdin}
                      onChange={(e) => setStdin(e.target.value)}
                      rows={2}
                      placeholder="Piped to your program's stdin"
                      className="field mono w-full resize-y text-sm"
                    />
                  </div>
                  <div className="panel overflow-hidden">
                    <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: 'var(--color-line)' }}>
                      <span className="eyebrow">Output</span>
                      {runResult?.code !== null && runResult?.code !== undefined && (
                        <span className="mono text-xs" style={{ color: runResult.code === 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                          exit {runResult.code}
                        </span>
                      )}
                    </div>
                    <div className="max-h-56 overflow-auto p-3">
                      {isRunning ? (
                        <div className="flex items-center gap-2 text-sm text-[color:var(--color-fg-subtle)]">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: 'var(--color-gold)', borderRightColor: 'var(--color-gold)' }} />
                          Running…
                        </div>
                      ) : runResult?.error ? (
                        <pre className="mono whitespace-pre-wrap text-sm text-[color:var(--color-danger)]">{runResult.error}</pre>
                      ) : runResult ? (
                        <div className="space-y-3">
                          {runResult.compileOutput ? (
                            <div>
                              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-danger)]">Compile</div>
                              <pre className="mono whitespace-pre-wrap text-sm text-[color:var(--color-danger)]">{runResult.compileOutput}</pre>
                            </div>
                          ) : null}
                          {runResult.stdout ? (
                            <pre className="mono whitespace-pre-wrap text-sm text-[color:var(--color-fg)]">{runResult.stdout}</pre>
                          ) : null}
                          {runResult.stderr ? (
                            <div>
                              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-danger)]">Stderr</div>
                              <pre className="mono whitespace-pre-wrap text-sm text-[color:var(--color-danger)]">{runResult.stderr}</pre>
                            </div>
                          ) : null}
                          {!runResult.stdout && !runResult.stderr && !runResult.compileOutput && (
                            <p className="text-sm text-[color:var(--color-fg-subtle)]">No output. Print something to see it here.</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-[color:var(--color-fg-subtle)]">Run to see output.</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 border-t p-4" style={{ borderColor: 'var(--color-line)' }}>
              <button onClick={() => setShowRunConsole(false)} className="btn btn-secondary flex-1">Close</button>
              <button onClick={() => runCode(runMode)} disabled={isRunning} className="btn btn-primary flex-1 justify-center">
                <Play size={15} />
                {isRunning ? 'Running…' : 'Run again'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback modal */}
      {showFeedback && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          onClick={() => !isGeneratingFeedback && setShowFeedback(false)}
        >
          <div
            className="card animate-scale-in flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="AI feedback"
          >
            <div className="flex items-start justify-between gap-4 border-b p-5" style={{ borderColor: 'var(--color-line)' }}>
              <div className="flex items-center gap-3">
                <Sparkle size={18} className="text-[color:var(--color-gold-bright)]" />
                <div>
                  <div className="eyebrow">Interview debrief</div>
                  <h2 className="mt-1 text-lg font-semibold">
                    {interviewSetup ? `${interviewSetup.company.name} feedback` : 'AI feedback'}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => !isGeneratingFeedback && setShowFeedback(false)}
                className="btn btn-ghost p-2"
                aria-label="Close"
                disabled={isGeneratingFeedback}
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {isGeneratingFeedback ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                  <AIOrb size={64} status="evaluating" />
                  <p className="mt-6 text-base font-medium">Analyzing your solution</p>
                  <p className="mt-1.5 max-w-xs text-sm text-[color:var(--color-fg-subtle)]">
                    Reviewing correctness, complexity and code quality. Just a moment.
                  </p>
                </div>
              ) : (
                <FeedbackView feedback={feedback} />
              )}
            </div>

            {!isGeneratingFeedback && (
              <div className="flex gap-3 border-t p-4" style={{ borderColor: 'var(--color-line)' }}>
                <button onClick={() => setShowFeedback(false)} className="btn btn-secondary flex-1">
                  Keep practicing
                </button>
                <Link href="/dashboard" className="btn btn-primary flex-1 justify-center">
                  Back to dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
