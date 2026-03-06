'use client';

import { useState, useEffect } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { MockOfferLogo } from '../../components/MockOfferLogo';
import { InterviewSetupModal } from '../../components/InterviewSetupModal';

interface InterviewHistory {
  id: string;
  timestamp: number;
  problemTitle: string;
  code: string;
  feedback: string;
  timeSpent: number;
  completed: boolean;
  company?: string;
  role?: string;
  experience?: number;
}

// History Feedback Display Component
function HistoryFeedbackDisplay({ feedback }: { feedback: string }) {
  // Extract time complexity
  const timeComplexity = feedback.match(/\*\*Time Complexity:\*\*\s*([^\n*]+)/)?.[1]?.trim() || 'Not analyzed';
  const spaceComplexity = feedback.match(/\*\*Space Complexity:\*\*\s*([^\n*]+)/)?.[1]?.trim() || 'Not analyzed';
  
  // Extract correctness
  const isCorrect = feedback.includes('✅');
  
  // Extract code quality score
  const codeQualityScore = feedback.match(/Code Quality \(Score: (\d+)\/10\)/)?.[1] || '?';
  
  // Extract optimized code
  const optimizedCodeMatch = feedback.match(/```(?:javascript|typescript|python|java|cpp|csharp|go|rust)?\n([\s\S]*?)```/);
  const optimizedCode = optimizedCodeMatch?.[1]?.trim() || '';

  // Extract edge cases
  const edgeCasesSection = feedback.match(/## Edge Cases to Consider:([\s\S]*?)(?=$)/)?.[1] || '';
  const edgeCases = (edgeCasesSection.match(/- ([^\n]+)/g) || [])
    .map(item => item.replace(/^- /, '').trim())
    .filter(item => item.length > 0);

  // Extract code quality improvements
  const codeQualitySection = feedback.match(/## Code Quality \(Score: \d+\/10\):([\s\S]*?)(?=## Optimization|$)/)?.[1] || '';
  const improvements = (codeQualitySection.match(/- ([^\n]+)/g) || [])
    .map(item => item.replace(/^- /, '').trim())
    .filter(item => item.length > 0);

  // Extract optimization suggestions
  const optimizationSection = feedback.match(/## Optimization Suggestions:([\s\S]*?)(?=### Optimized|## Edge Cases|$)/)?.[1] || '';
  const suggestions = (optimizationSection.match(/- ([^\n]+)/g) || [])
    .map(item => item.replace(/^- /, '').trim())
    .filter(item => item.length > 0);

  return (
    <div className="space-y-4">
      {/* Complexity Analysis */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-1">Time Complexity</div>
          <div className="text-sm font-mono text-blue-300">{timeComplexity}</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
          <div className="text-xs uppercase tracking-wider text-purple-400 font-semibold mb-1">Space Complexity</div>
          <div className="text-sm font-mono text-purple-300">{spaceComplexity}</div>
        </div>
      </div>

      {/* Correctness */}
      <div className={`rounded-lg p-3 border ${isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
        <div className="flex items-center space-x-2">
          {isCorrect ? (
            <>
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-400 font-semibold text-sm">Solution is Correct!</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-400 font-semibold text-sm">Issues Found</span>
            </>
          )}
        </div>
      </div>

      {/* Code Quality */}
      <div className="bg-secondary/30 border border-border rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs uppercase tracking-wider text-accent font-semibold">Code Quality</div>
          <div className="flex items-center space-x-1">
            <span className="text-xl font-bold text-accent">{codeQualityScore}</span>
            <span className="text-muted text-sm">/10</span>
          </div>
        </div>
        <div className="w-full bg-primary rounded-full h-1.5">
          <div 
            className="bg-gradient-to-r from-accent to-yellow-400 h-1.5 rounded-full"
            style={{ width: `${(parseInt(codeQualityScore) || 0) * 10}%` }}
          />
        </div>
        {improvements.length > 0 && (
          <ul className="mt-3 space-y-1">
            {improvements.slice(0, 3).map((improvement, idx) => (
              <li key={idx} className="text-xs text-muted flex items-start space-x-1">
                <span className="text-accent">•</span>
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Optimization Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-secondary/30 border border-border rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-cyan-500/10">
            <div className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">Optimization Suggestions</div>
          </div>
          <div className="p-3">
            <ul className="space-y-1">
              {suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-xs text-muted flex items-start space-x-1">
                  <svg className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Optimized Solution */}
      {optimizedCode && (
        <div className="bg-secondary/30 border border-border rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-accent/10">
            <div className="text-xs uppercase tracking-wider text-accent font-semibold">Optimized Solution</div>
          </div>
          <div className="p-3">
            <pre className="bg-primary/50 p-3 rounded-lg overflow-x-auto text-xs font-mono text-green-300 border border-border max-h-48">
              <code>{optimizedCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Edge Cases */}
      {edgeCases.length > 0 && (
        <div className="bg-secondary/30 border border-border rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-orange-500/10">
            <div className="text-xs uppercase tracking-wider text-orange-400 font-semibold">Edge Cases</div>
          </div>
          <div className="p-3">
            <ul className="space-y-1">
              {edgeCases.map((edgeCase, idx) => (
                <li key={idx} className="text-xs text-muted flex items-start space-x-1">
                  <svg className="w-3 h-3 text-orange-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{edgeCase}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useUser();
  const [pastInterviews, setPastInterviews] = useState<InterviewHistory[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<InterviewHistory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get user-specific localStorage key
  const getStorageKey = () => {
    return user?.id ? `mockoffer_interviews_${user.id}` : 'mockoffer_interviews';
  };

  useEffect(() => {
    // Load past interviews from localStorage (user-specific)
    if (user) {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        try {
          const interviews = JSON.parse(stored);
          setPastInterviews(interviews.sort((a: InterviewHistory, b: InterviewHistory) => b.timestamp - a.timestamp));
        } catch (error) {
          console.error('Error loading past interviews:', error);
        }
      }
    }
  }, [user]);

  const handleDeleteAllSessions = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    localStorage.removeItem(getStorageKey());
    setPastInterviews([]);
    setSelectedInterview(null);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  return (
    <div className="min-h-screen luxury-noir-theme">
      {/* Navigation */}
      <nav className="nav-luxury shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <MockOfferLogo size="sm" />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <UserButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold heading mb-4">
            Welcome to Your Interview Dashboard
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Ready to practice? Start a mock coding interview session and get AI-powered feedback on your performance.
          </p>
        </div>

        {/* Quick Start Card */}
        <div className="max-w-2xl mx-auto">
          <div className="card-luxury rounded-xl shadow-lg p-8 border border-border">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-semibold heading mb-4">
                Start Your Mock Interview
              </h2>
              
              <p className="text-muted mb-8">
                Begin with a coding challenge, set your timer, and get ready for AI-powered feedback
                on your problem-solving approach and code quality.
              </p>

              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-luxury text-base font-medium"
              >
                Start Interview Session
              </button>
            </div>
          </div>
        </div>

        {/* Past Interviews Section */}
        {pastInterviews.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-semibold heading">
                Your Interview History
              </h3>
              <button
                onClick={handleDeleteAllSessions}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-all duration-300 hover:shadow-luxury-glow flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete All Sessions</span>
              </button>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Interviews List */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold heading mb-4">Recent Sessions</h4>
                <div className="space-y-3">
                  {pastInterviews.slice(0, 5).map((interview) => (
                    <div
                      key={interview.id}
                      onClick={() => setSelectedInterview(interview)}
                      className={`card-luxury p-4 cursor-pointer transition-all duration-300 ${
                        selectedInterview?.id === interview.id 
                          ? 'border-accent/50 shadow-luxury-glow' 
                          : 'hover:border-accent/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold heading text-sm">{interview.problemTitle}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          interview.completed 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        }`}>
                          {interview.completed ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                      <div className="text-sm text-muted space-y-1">
                        <p>{formatDate(interview.timestamp)}</p>
                        <p>Time: {formatTime(interview.timeSpent)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Interview Details */}
              <div>
                {selectedInterview ? (
                  <div className="card-luxury p-6">
                    {/* Header with Close Button */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-semibold heading mb-2">{selectedInterview.problemTitle}</h4>
                        <div className="flex items-center flex-wrap gap-3 text-sm text-muted">
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(selectedInterview.timestamp)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{formatTime(selectedInterview.timeSpent)}</span>
                          </span>
                          {selectedInterview.company && (
                            <span className="flex items-center space-x-1">
                              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span>{selectedInterview.company}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedInterview(null);
                        }}
                        className="p-2 hover:bg-secondary/50 rounded-lg transition-colors group cursor-pointer"
                        title="Close"
                      >
                        <svg className="w-5 h-5 text-muted group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Code Solution */}
                    <div className="mb-6">
                      <div className="bg-secondary/30 border border-border rounded-lg overflow-hidden">
                        <div className="px-4 py-2 border-b border-border bg-primary/30 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            <span className="text-sm font-semibold text-accent uppercase tracking-wider">Your Solution</span>
                          </div>
                          <span className="text-xs text-muted bg-secondary px-2 py-1 rounded">Code</span>
                        </div>
                        <div className="p-4 overflow-x-auto max-h-64">
                          <pre className="text-sm text-green-300 font-mono whitespace-pre-wrap">
                            <code>{selectedInterview.code || '// No code submitted'}</code>
                          </pre>
                        </div>
                      </div>
                    </div>

                    {/* AI Feedback */}
                    {selectedInterview.feedback && (
                      <div>
                        <div className="flex items-center space-x-2 mb-4">
                          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                          <h5 className="font-semibold heading text-lg">AI Analysis</h5>
                        </div>
                        <HistoryFeedbackDisplay feedback={selectedInterview.feedback} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="card-luxury p-8 text-center">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-muted">Select an interview to view details and feedback</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      
      <InterviewSetupModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={cancelDelete}
        >
          <div 
            className="card-luxury rounded-xl shadow-2xl border border-border max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold heading">Delete All Sessions?</h3>
                  <p className="text-sm text-muted mt-1">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-muted mb-6">
                Are you sure you want to delete all {pastInterviews.length} interview session{pastInterviews.length !== 1 ? 's' : ''}? 
                All your code submissions and AI feedback will be permanently removed.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-white border border-border rounded-lg transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-red-500/50"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}