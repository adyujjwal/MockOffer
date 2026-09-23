'use client';

import React, { useState } from 'react';

interface LoadingButtonProps {
  onClick: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function LoadingButton({ 
  onClick, 
  children, 
  className = '', 
  loadingText = 'Loading...',
  disabled = false,
  variant = 'primary'
}: LoadingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const baseClasses = 'btn';

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger'
  };

  const handleClick = async () => {
    if (isLoading || disabled) return;

    setIsLoading(true);
    try {
      await onClick();
    } catch (error) {
      console.error('Button action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Usage example:
// <LoadingButton 
//   onClick={handleSubmit}
//   loadingText="Analyzing..."
//   variant="primary"
// >
//   Submit Solution
// </LoadingButton>