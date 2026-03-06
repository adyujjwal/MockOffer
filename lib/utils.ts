import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Timer utilities
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Code analysis utilities
export function analyzeCodeBasics(code: string) {
  const lines = code.split('\n').filter(line => line.trim() !== '');
  const functions = code.split('function').length - 1;
  const loops = (code.match(/for\s*\(|while\s*\(|\.map\(|\.forEach\(/g) || []).length;
  
  return {
    lineCount: lines.length,
    functionCount: functions,
    loopCount: loops,
    hasRecursion: code.includes('return') && (code.includes('function') || code.includes('=>')),
  };
}

// Problem difficulty utilities
export function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'text-green-600 bg-green-100 border-green-200';
    case 'medium':
      return 'text-orange-600 bg-orange-100 border-orange-200';
    case 'hard':
      return 'text-red-600 bg-red-100 border-red-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
}

// Session storage utilities
export function saveInterviewSession(data: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mockOffer_session', JSON.stringify(data));
  }
}

export function loadInterviewSession() {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('mockOffer_session');
    return data ? JSON.parse(data) : null;
  }
  return null;
}

export function clearInterviewSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mockOffer_session');
  }
}

// API utilities
export function handleAPIError(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

// Code language detection
export function detectLanguage(code: string): string {
  if (code.includes('function') || code.includes('=>') || code.includes('const') || code.includes('let')) {
    return 'javascript';
  }
  
  if (code.includes('def ') || code.includes('import ') || code.includes('from ')) {
    return 'python';
  }
  
  if (code.includes('public static') || code.includes('class ') && code.includes('{')) {
    return 'java';
  }
  
  if (code.includes('#include') || code.includes('int main')) {
    return 'cpp';
  }
  
  return 'javascript'; // default
}