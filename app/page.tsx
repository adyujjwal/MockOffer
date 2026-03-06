'use client';

import Link from "next/link";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { MockOfferLogo } from "../components/MockOfferLogo";

export default function Home() {
  const { isSignedIn } = useAuth();
  return (
    <div className="min-h-screen luxury-noir-theme">
      <div className="mx-auto max-w-7xl px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex justify-center mb-6 logo-container">
            <MockOfferLogo size="xl" />
          </div>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Master coding interviews with AI-powered mock sessions, real-time feedback, 
            and personalized analysis to land your dream job.
          </p>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="card-luxury border border-border rounded-2xl shadow-2xl p-8 lg:p-12 max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold heading mb-6">
              Practice Like It's the Real Thing
            </h2>
            <p className="text-lg text-muted mb-8">
              Get instant feedback on your code with our AI interviewer. Practice with real 
              LeetCode-style problems and receive detailed analysis on time complexity, 
              edge cases, and code quality.
            </p>
            
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button className="btn-luxury text-lg py-4 px-8 shadow-lg hover:shadow-xl">
                  Get Started
                </button>
              </SignInButton>
            ) : (
              <Link href="/dashboard">
                <button className="btn-luxury text-lg py-4 px-8 shadow-lg hover:shadow-xl">
                  Go to Dashboard
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card-luxury border border-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold heading mb-2">Timed Practice</h3>
            <p className="text-muted">Set custom timers or use the default 30-minute sessions to simulate real interview pressure.</p>
          </div>

          <div className="card-luxury border border-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold heading mb-2">Code Editor</h3>
            <p className="text-muted">Practice with a professional Monaco editor featuring syntax highlighting and auto-completion.</p>
          </div>

          <div className="card-luxury border border-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold heading mb-2">AI Feedback</h3>
            <p className="text-muted">Get intelligent analysis of your solutions with insights on optimization and best practices.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
