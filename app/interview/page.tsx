'use client';

import { useState, useEffect, useRef } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import { useLoading } from '../../components/LoadingProvider';
import { LoadingButton } from '../../components/LoadingButton';
import { MockOfferLogo } from '../../components/MockOfferLogo';
import { AppBackground } from '../../components/ui/AppBackground';
import { AIOrb, AIStatusChip, AIStatus } from '../../components/ui/AIOrb';
import { FeedbackView } from '../../components/FeedbackView';
import {
  ArrowLeft, Play, Stop, Reset, Clock, Code, Send, Sparkle, X,
  Terminal, Braces,
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

  const handleLanguageChange = (newLanguage: string) => {
    const currentLangOption = languageOptions.find(l => l.value === language);

    // Check if code is essentially empty/default (just template or very minimal)
    const isCodeDefault = !code ||
      code === currentLangOption?.defaultCode ||
      code === currentProblem?.defaultCode ||
      (currentProblem?.languageTemplates && code === currentProblem.languageTemplates[language]) ||
      code.trim().length < 50;

    setLanguage(newLanguage);

    // If user hasn't written significant code, switch to new language template
    if (isCodeDefault) {
      // First try to use the AI-generated language template
      if (currentProblem?.languageTemplates && currentProblem.languageTemplates[newLanguage]) {
        setCode(currentProblem.languageTemplates[newLanguage]);
      } else {
        // Fallback to default language template
        const langOption = languageOptions.find(l => l.value === newLanguage);
        if (langOption) {
          setCode(langOption.defaultCode);
        }
      }
    }
  };

  // Load interview setup and generate AI question
  useEffect(() => {
    // Prevent double execution in React strict mode
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadInterviewQuestion = async () => {
      // Add a small delay to ensure localStorage is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      const setupData = localStorage.getItem('interview_setup');

      if (setupData) {
        try {
          const setup: InterviewSetup = JSON.parse(setupData);
          setInterviewSetup(setup);

          setIsLoadingQuestion(true);
          setLoading(true);
          setLoadingMessage('Generating personalized interview question...');

          try {
            // Call our API route to generate the question

            const response = await fetch('/api/ai/generate-question', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                company: setup.company.name,
                role: setup.role,
                experienceLevel: setup.experience
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`API error: ${errorData.error || response.statusText}`);
            }

            const question = await response.json() as Problem;

            // Check if we got an error response instead of a question
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
              languageTemplates: question.languageTemplates || {}
            };

            setCurrentProblem(normalizedQuestion);

            // Use the appropriate language template if available
            if (normalizedQuestion.languageTemplates && normalizedQuestion.languageTemplates[language]) {
              setCode(normalizedQuestion.languageTemplates[language]);
            } else {
              setCode(normalizedQuestion.defaultCode);
            }

            // Clean up setup data after successful AI generation
            if (question && question.id && question.id.startsWith('ai_')) {
              localStorage.removeItem('interview_setup');
            }

          } catch (aiError) {
            console.error('Failed to generate AI question:', aiError);
            setIsLoadingQuestion(false);
            setLoading(false);

            // Show error message and redirect to dashboard
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
        } catch (error) {
          console.error('Error loading interview setup:', error);
          setIsLoadingQuestion(false);
          setLoading(false);
        }
      } else {
        // No setup data found - redirect to dashboard
        setIsLoadingQuestion(false);
        setLoading(false);
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    };

    loadInterviewQuestion();
  }, [setLoadingMessage]);

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
      experience: interviewSetup?.experience || 0
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
          language: language
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
          <section className="card flex flex-col overflow-hidden xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:self-start">
            <div className="flex items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--color-line)' }}>
              <div className="flex items-center gap-2.5">
                <Code size={16} className="text-[color:var(--color-gold-bright)]" />
                <span className="text-sm font-semibold">Editor</span>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="field ml-1 cursor-pointer py-1.5 pl-2.5 pr-8 text-sm"
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
                <button
                  onClick={resetCode}
                  className="btn btn-ghost btn-sm"
                  aria-label="Reset code to starting template"
                  title="Reset to starting template"
                  disabled={isLoadingQuestion || !currentProblem}
                >
                  <Reset size={15} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <kbd
                  className="mono hidden rounded px-1.5 py-0.5 text-[11px] text-[color:var(--color-fg-subtle)] lg:inline-block"
                  style={{ background: 'var(--color-inset)', border: '1px solid var(--color-line)' }}
                >
                  ⌘↵
                </kbd>
                <LoadingButton
                  onClick={handleSubmit}
                  loadingText="Analyzing..."
                  variant="primary"
                  disabled={isGeneratingFeedback || isLoadingQuestion || !currentProblem}
                >
                <span className="flex items-center gap-1.5">
                  <Send size={15} />
                  Submit
                </span>
                </LoadingButton>
              </div>
            </div>

            <div
              className="h-[440px] sm:h-[520px] xl:h-[calc(100vh-9.5rem)]"
              style={{ background: 'var(--color-inset)' }}
            >
              <Editor
                height="100%"
                language={language}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                loading={
                  <div className="flex h-full items-center justify-center">
                    <span
                      className="h-7 w-7 animate-spin rounded-full border-2 border-t-transparent"
                      style={{ borderColor: 'var(--color-gold)', borderTopColor: 'transparent' }}
                    />
                  </div>
                }
                onMount={(editor, monaco) => {
                  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                    submitRef.current();
                  });
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  tabSize: 2,
                  padding: { top: 16 },
                  fontFamily: 'var(--font-mono), ui-monospace, monospace',
                  fontLigatures: true,
                }}
              />
            </div>
          </section>
        </div>
      </main>

      {/* Feedback drawer */}
      {showFeedback && (
        <div
          className="fixed inset-0 z-[80] flex justify-end bg-black/70 backdrop-blur-sm"
          onClick={() => !isGeneratingFeedback && setShowFeedback(false)}
        >
          <div
            className="animate-fade-up flex h-full w-full max-w-2xl flex-col border-l"
            style={{ background: 'var(--color-panel)', borderColor: 'var(--color-line)' }}
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
                    Reviewing correctness, complexity and code quality — just a moment.
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
