'use client';

import React, { createContext, useContext, useState } from 'react';
import { AIOrb } from './ui/AIOrb';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessageState] = useState('Loading...');

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const setLoadingMessage = (message: string) => {
    setLoadingMessageState(message);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, loadingMessage, setLoadingMessage }}>
      {children}
      {isLoading && <GlobalLoader message={loadingMessage} />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

function GlobalLoader({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md">
      <div className="card animate-scale-in relative flex w-[min(22rem,90vw)] flex-col items-center gap-6 overflow-hidden px-10 py-9 text-center">
        {/* soft aurora wash behind the orb */}
        <div className="bg-aurora" aria-hidden="true" />

        {/* Animated AI presence: breathing core with orbiting particle */}
        <div className="relative flex items-center justify-center">
          {/* expanding sonar rings */}
          <span
            className="absolute rounded-full border"
            style={{
              width: 96,
              height: 96,
              borderColor: 'rgba(230,178,74,0.35)',
              animation: 'sonar 2.4s ease-out infinite',
            }}
          />
          <span
            className="absolute rounded-full border"
            style={{
              width: 96,
              height: 96,
              borderColor: 'rgba(230,178,74,0.25)',
              animation: 'sonar 2.4s ease-out 1.2s infinite',
            }}
          />
          <AIOrb size={72} status="thinking" />
        </div>

        <div className="relative flex flex-col items-center gap-3">
          <p className="text-sm font-medium leading-relaxed text-[color:var(--color-fg)]">
            {message}
          </p>
          {/* animated typing dots */}
          <span className="inline-flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block rounded-full"
                style={{
                  width: 5,
                  height: 5,
                  background: 'var(--color-gold)',
                  animation: `typing-dot 1.2s ease-in-out ${i * 0.18}s infinite`,
                }}
              />
            ))}
          </span>
          {/* indeterminate scanning bar */}
          <span
            className="mt-1 block h-[3px] w-40 overflow-hidden rounded-full"
            style={{ background: 'var(--color-elevated)' }}
          >
            <span
              className="block h-full w-1/2 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--color-gold-bright), transparent)',
                animation: 'scan 1.5s ease-in-out infinite',
              }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}