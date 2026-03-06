'use client';

import { useState, useEffect, useRef } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import { useLoading } from '../../components/LoadingProvider';
import { LoadingButton } from '../../components/LoadingButton';
import { MockOfferLogo } from '../../components/MockOfferLogo';

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

// Feedback Display Component
function FeedbackDisplay({ feedback }: { feedback: string }) {
  // Parse the feedback sections
  const parseSection = (text: string, startMarker: string, endMarker?: string): string => {
    const startIdx = text.indexOf(startMarker);
    if (startIdx === -1) return '';
    const contentStart = startIdx + startMarker.length;
    const endIdx = endMarker ? text.indexOf(endMarker, contentStart) : text.length;
    return text.substring(contentStart, endIdx !== -1 ? endIdx : text.length).trim();
  };

  // Extract time complexity
  const timeComplexity = feedback.match(/\*\*Time Complexity:\*\*\s*([^\n*]+)/)?.[1]?.trim() || 'Not analyzed';
  const spaceComplexity = feedback.match(/\*\*Space Complexity:\*\*\s*([^\n*]+)/)?.[1]?.trim() || 'Not analyzed';
  
  // Extract correctness
  const isCorrect = feedback.includes('✅');
  const correctnessIssues = feedback.match(/❌.*?Issues found:[\s\S]*?(?=##|$)/)?.[0] || '';
  
  // Extract code quality score
  const codeQualityScore = feedback.match(/Code Quality \(Score: (\d+)\/10\)/)?.[1] || '?';
  
  // Extract sections
  const optimizationSection = parseSection(feedback, '## Optimization Suggestions:', '## Edge Cases');
  const edgeCasesSection = parseSection(feedback, '## Edge Cases to Consider:');
  
  // Extract optimized code
  const optimizedCodeMatch = feedback.match(/```(?:javascript|typescript|python|java|cpp|csharp|go|rust)?\n([\s\S]*?)```/);
  const optimizedCode = optimizedCodeMatch?.[1]?.trim() || '';

  // Extract individual items from sections
  const extractListItems = (text: string): string[] => {
    const items = text.match(/- ([^\n]+)/g) || [];
    return items.map(item => item.replace(/^- /, '').trim()).filter(item => item.length > 0);
  };

  const edgeCases = extractListItems(edgeCasesSection);

  return (
    <div className="space-y-4">
      {/* Complexity Analysis */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-1">Time Complexity</div>
          <div className="text-lg font-mono text-blue-300">{timeComplexity}</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <div className="text-xs uppercase tracking-wider text-purple-400 font-semibold mb-1">Space Complexity</div>
          <div className="text-lg font-mono text-purple-300">{spaceComplexity}</div>
        </div>
      </div>

      {/* Correctness */}
      <div className={`rounded-lg p-4 border ${isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
        <div className="flex items-center space-x-2">
          {isCorrect ? (
            <>
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-400 font-semibold">Solution is Correct!</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-400 font-semibold">Issues Found</span>
            </>
          )}
        </div>
        {!isCorrect && correctnessIssues && (
          <div className="mt-2 text-sm text-red-300">{correctnessIssues}</div>
        )}
      </div>

      {/* Code Quality */}
      <div className="bg-secondary/30 border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-wider text-accent font-semibold">Code Quality</div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-accent">{codeQualityScore}</span>
            <span className="text-muted">/10</span>
          </div>
        </div>
        <div className="w-full bg-primary rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-accent to-yellow-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(parseInt(codeQualityScore) || 0) * 10}%` }}
          />
        </div>
      </div>

      {/* Optimized Solution */}
      {optimizedCode && (
        <div className="bg-secondary/30 border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-accent/10">
            <div className="text-xs uppercase tracking-wider text-accent font-semibold">Optimized Solution</div>
          </div>
          <div className="p-4">
            <pre className="bg-primary/50 p-4 rounded-lg overflow-x-auto text-sm font-mono text-green-300 border border-border">
              <code>{optimizedCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Edge Cases */}
      {edgeCases.length > 0 && (
        <div className="bg-secondary/30 border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-orange-500/10">
            <div className="text-xs uppercase tracking-wider text-orange-400 font-semibold">Edge Cases to Consider</div>
          </div>
          <div className="p-4">
            <ul className="space-y-2">
              {edgeCases.map((edgeCase, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-sm text-muted">{edgeCase}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'Medium': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'Hard': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen luxury-noir-theme">
      {/* Navigation */}
      <nav className="nav-luxury shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent/10 transition-colors group">
                  <svg className="w-5 h-5 text-muted group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="text-sm text-muted group-hover:text-accent transition-colors">Back</span>
                </Link>
                <Link href="/dashboard" className="flex items-center">
                  <MockOfferLogo size="sm" />
                </Link>
              </div>
                {interviewSetup && (
                  <div className="flex items-center space-x-4 bg-accent/10 px-4 py-2 rounded-lg border border-accent/30">
                    <div className="text-sm">
                      <span className="text-muted">Interviewing for:</span>
                      <div className="font-semibold text-accent">
                        {interviewSetup.role} at {interviewSetup.company.name}
                      </div>
                    </div>
                  </div>
                )}              <div className="flex items-center space-x-4">
                <div className="text-lg font-mono text-white">
                  {formatTime(timeLeft)}
                </div>
                <div className="flex space-x-2">
                  {!isTimerRunning ? (
                    <button
                      onClick={startTimer}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      Start
                    </button>
                  ) : (
                    <button
                      onClick={stopTimer}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Stop
                    </button>
                  )}
                  <button
                    onClick={resetTimer}
                    className="px-3 py-1 bg-secondary text-white rounded text-sm hover:bg-accent"
                  >
                    Reset
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={customTime}
                    onChange={(e) => setCustomTime(Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-border bg-input text-white rounded text-sm"
                    min="1"
                    max="120"
                  />
                  <span className="text-sm text-gray-300">min</span>
                </div>
              </div>
            </div>
            <UserButton />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Problem Description & AI Avatar */}
          <div className="space-y-6">
            {/* AI Avatar */}
            <div className="card-luxury rounded-lg shadow-sm border border-border p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold heading">AI Interviewer</h3>
                  <p className="text-sm text-muted">Here to guide you through the problem</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-secondary/30 rounded-lg border border-border">
                <p className="text-sm text-muted">
                  {interviewSetup 
                    ? `"Hello! I'm your AI interviewer for ${interviewSetup.company.name}. This question is commonly asked for ${interviewSetup.role} positions. Take your time to understand the problem and start coding when ready. Good luck!"`
                    : "Hello! I'm your AI interviewer. Take your time to read through the problem carefully. When you're ready, start coding and I'll provide feedback on your solution. Good luck!"
                  }
                </p>
              </div>
            </div>

            {/* Problem Description */}
            <div className="card-luxury rounded-lg shadow-sm border border-border p-6">
              {isLoadingQuestion ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted">Generating your personalized interview question...</p>
                  </div>
                </div>
              ) : currentProblem ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-semibold heading">{currentProblem.title}</h1>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentProblem.difficulty)}`}>
                      {currentProblem.difficulty}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-muted">{currentProblem.description}</p>
                
                <div>
                  <h3 className="font-semibold mb-2 heading">Examples:</h3>
                  {currentProblem.examples && currentProblem.examples.length > 0 ? (
                    currentProblem.examples.map((example, index) => (
                      <div key={index} className="bg-secondary/30 p-4 rounded-lg mb-3 border border-border">
                        <div className="mb-3">
                          <span className="text-xs uppercase tracking-wider text-accent font-semibold">Input</span>
                          <div className="mt-1 bg-primary/50 p-3 rounded-md border border-border font-mono text-sm text-high overflow-x-auto">
                            {example.input || 'No input provided'}
                          </div>
                        </div>
                        <div className="mb-3">
                          <span className="text-xs uppercase tracking-wider text-green-400 font-semibold">Output</span>
                          <div className="mt-1 bg-green-500/10 p-3 rounded-md border border-green-500/30 font-mono text-sm text-green-400 overflow-x-auto">
                            {example.output || 'No output provided'}
                          </div>
                        </div>
                        {example.explanation && (
                          <div>
                            <span className="text-xs uppercase tracking-wider text-muted font-semibold">Explanation</span>
                            <div className="mt-1 text-sm text-muted italic">
                              {example.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="bg-secondary/30 p-4 rounded-lg border border-border text-muted">
                      No examples available for this problem.
                    </div>
                  )}
                </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <p className="text-muted">No problem loaded. Please return to the dashboard.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="space-y-6">
            <div className="card-luxury rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="p-4 border-b border-border bg-secondary/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h2 className="font-semibold heading">Code Editor</h2>
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="px-3 py-1.5 bg-secondary border border-border rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer appearance-none pr-8 relative"
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23D4AF37'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.25rem' }}
                    >
                      {languageOptions.map((lang) => (
                        <option key={lang.value} value={lang.value} className="bg-secondary text-white">
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <LoadingButton
                    onClick={handleSubmit}
                    loadingText="Analyzing..."
                    variant="primary"
                    disabled={isGeneratingFeedback || isLoadingQuestion || !currentProblem}
                  >
                    Submit Solution
                  </LoadingButton>
                </div>
              </div>
              
              <div className="h-96">
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    tabSize: 2,
                    padding: { top: 16 }
                  }}
                />
              </div>
            </div>

            {/* Feedback Panel */}
            {showFeedback && (
              <div className="card-luxury rounded-lg shadow-sm border border-border overflow-hidden">
                <div className="p-4 border-b border-border bg-gradient-to-r from-accent/20 to-purple-500/20">
                  <h3 className="font-semibold flex items-center heading text-lg">
                    <svg className="w-5 h-5 mr-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {interviewSetup ? `${interviewSetup.company.name} AI Feedback` : 'AI Feedback'}
                  </h3>
                </div>
                
                {isGeneratingFeedback ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent/20 border-t-accent"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-8 h-8 text-accent animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-6 text-center">
                      <p className="text-lg font-semibold text-high mb-2">Analyzing Your Solution</p>
                      <p className="text-sm text-muted">AI is reviewing your code for complexity, correctness, and optimization...</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    <FeedbackDisplay feedback={feedback} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}