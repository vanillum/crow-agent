'use client';

import React, { useState, useEffect } from 'react';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'switch';
}

export function ThemeToggle({ className = '', size = 'md', variant = 'button' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme);
    updateTheme(initialTheme);
  }, []);

  const updateTheme = (newTheme: 'light' | 'dark') => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    updateTheme(newTheme);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          relative inline-flex items-center h-6 rounded-full w-11 transition-colors
          bg-gray-200 dark:bg-gray-700 
          focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2
          ${className}
        `}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        role="switch"
        aria-checked={theme === 'dark'}
      >
        <span
          className={`
            inline-block w-4 h-4 transform transition-transform bg-white dark:bg-gray-300 rounded-full
            ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}
          `}
        >
          <span className="sr-only">
            {theme === 'light' ? '☀️' : '🌙'}
          </span>
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center justify-center rounded-lg border transition-colors
        bg-white dark:bg-gray-800 
        border-gray-200 dark:border-gray-700
        text-gray-900 dark:text-gray-100
        hover:bg-gray-50 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2
        ${sizeClasses[size]}
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span role="img" aria-hidden="true">
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
    </button>
  );
}

export default ThemeToggle;
