'use client';

import React, { createContext, useContext, useState } from 'react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="card animate-scale-in flex flex-col items-center gap-5 px-10 py-8">
        <span className="relative inline-flex h-12 w-12 items-center justify-center">
          <span
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: "var(--color-line-strong)" }}
          />
          <span
            className="absolute inset-0 animate-spin rounded-full border-2 border-transparent"
            style={{ borderTopColor: "var(--color-gold)" }}
          />
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: "var(--color-gold)", animation: "breathe 2s ease-in-out infinite" }}
          />
        </span>
        <p className="text-sm font-medium text-[color:var(--color-fg-muted)]">{message}</p>
      </div>
    </div>
  );
}