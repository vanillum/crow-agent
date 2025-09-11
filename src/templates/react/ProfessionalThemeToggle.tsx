'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

interface ProfessionalThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'switch' | 'dropdown';
  showLabel?: boolean;
  position?: 'fixed' | 'relative';
  reduceMotion?: boolean;
  onThemeChange?: (theme: Theme) => void;
}

export function ProfessionalThemeToggle({
  className = '',
  size = 'md',
  variant = 'button',
  showLabel = false,
  position = 'relative',
  reduceMotion = false,
  onThemeChange
}: ProfessionalThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Respect user's motion preferences
  const prefersReducedMotion = reduceMotion || (
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const animationClasses = prefersReducedMotion 
    ? '' 
    : 'transition-all duration-200 ease-out';

  useEffect(() => {
    setMounted(true);
    
    // Get saved preference with better fallback logic
    const savedTheme = localStorage.getItem('theme') as Theme;
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = savedTheme || 'system';
    
    setTheme(initialTheme);
    updateResolvedTheme(initialTheme, systemPreference);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        updateResolvedTheme('system', e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  const updateResolvedTheme = useCallback((newTheme: Theme, systemPreference?: 'light' | 'dark') => {
    let resolvedMode: 'light' | 'dark';
    
    if (newTheme === 'system') {
      resolvedMode = systemPreference || (
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      );
    } else {
      resolvedMode = newTheme;
    }

    setResolvedTheme(resolvedMode);
    
    // Apply theme with proper class management
    const html = document.documentElement;
    if (resolvedMode === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // Announce theme change to screen readers
    const themeLabel = newTheme === 'system' ? `${resolvedMode} (system)` : newTheme;
    setAnnouncement(`Theme changed to ${themeLabel} mode`);
    
    // Clear announcement after screen readers have time to announce it
    setTimeout(() => setAnnouncement(''), 1000);
  }, []);

  const changeTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    updateResolvedTheme(newTheme, systemPreference);
    
    onThemeChange?.(newTheme);
    setIsDropdownOpen(false);
  }, [updateResolvedTheme, onThemeChange]);

  const cycleTheme = useCallback(() => {
    const themeOrder: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
    changeTheme(nextTheme);
  }, [theme, changeTheme]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (variant === 'dropdown') {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          setIsDropdownOpen(!isDropdownOpen);
          break;
        case 'Escape':
          setIsDropdownOpen(false);
          break;
        case 'ArrowDown':
        case 'ArrowUp':
          if (isDropdownOpen) {
            e.preventDefault();
            // Focus management for dropdown items would go here
          }
          break;
      }
    } else {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        cycleTheme();
      }
    }
  }, [variant, isDropdownOpen, cycleTheme]);

  if (!mounted) {
    // Prevent hydration mismatch with a consistent placeholder
    return (
      <div 
        className={`${sizeClasses[size].button} bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
        aria-hidden="true"
      />
    );
  }

  const sizeClasses = {
    sm: { button: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-sm', dropdown: 'w-32' },
    md: { button: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-base', dropdown: 'w-36' },
    lg: { button: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-lg', dropdown: 'w-40' },
  };

  const getThemeIcon = (themeType: Theme, isActive = false) => {
    const iconClasses = `${sizeClasses[size].icon} ${animationClasses} ${
      isActive ? 'scale-110' : ''
    }`;
    
    switch (themeType) {
      case 'light':
        return <Sun className={`${iconClasses} text-amber-500`} />;
      case 'dark':
        return <Moon className={`${iconClasses} text-blue-400`} />;
      case 'system':
        return <Monitor className={`${iconClasses} text-purple-500`} />;
    }
  };

  const getThemeLabel = (themeType: Theme): string => {
    switch (themeType) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';  
      case 'system': return 'System';
    }
  };

  const baseButtonClasses = `
    inline-flex items-center justify-center rounded-lg border
    bg-white dark:bg-gray-800 
    border-gray-200 dark:border-gray-700
    text-gray-900 dark:text-gray-100
    hover:bg-gray-50 dark:hover:bg-gray-750
    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2
    active:scale-95
    ${animationClasses}
    ${sizeClasses[size].button}
  `.trim();

  // Dropdown variant with full accessibility
  if (variant === 'dropdown') {
    return (
      <>
        {/* Screen reader announcements */}
        <div 
          aria-live="polite" 
          aria-atomic="true"
          className="sr-only"
        >
          {announcement}
        </div>

        <div className={`relative ${position === 'fixed' ? 'fixed top-4 right-4 z-50' : ''} ${className}`}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onKeyDown={handleKeyDown}
            className={`
              ${baseButtonClasses}
              ${sizeClasses[size].dropdown}
              ${isDropdownOpen ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
            `}
            aria-label={`Theme selector. Current theme: ${getThemeLabel(theme)}`}
            aria-haspopup="menu"
            aria-expanded={isDropdownOpen}
          >
            {getThemeIcon(theme, true)}
            {showLabel && (
              <span className={`ml-2 ${sizeClasses[size].text}`}>
                {getThemeLabel(theme)}
              </span>
            )}
          </button>

          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsDropdownOpen(false)}
                aria-hidden="true"
              />
              <div 
                className={`
                  absolute top-full mt-2 right-0 z-20 
                  bg-white dark:bg-gray-800 
                  border border-gray-200 dark:border-gray-700
                  rounded-lg shadow-lg py-1
                  ${animationClasses}
                  ${sizeClasses[size].dropdown}
                `}
                role="menu"
                aria-label="Theme options"
              >
                {(['light', 'dark', 'system'] as Theme[]).map((themeOption) => (
                  <button
                    key={themeOption}
                    onClick={() => changeTheme(themeOption)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 text-left
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none
                      ${theme === themeOption ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}
                      ${animationClasses}
                      ${sizeClasses[size].text}
                    `}
                    role="menuitem"
                    aria-current={theme === themeOption ? 'true' : 'false'}
                  >
                    {getThemeIcon(themeOption, theme === themeOption)}
                    <span>{getThemeLabel(themeOption)}</span>
                    {theme === themeOption && (
                      <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  // Switch variant with enhanced accessibility
  if (variant === 'switch') {
    return (
      <>
        <div aria-live="polite" className="sr-only">{announcement}</div>
        
        <div className={`flex items-center gap-3 ${className}`}>
          {showLabel && (
            <span className={`${sizeClasses[size].text} text-gray-700 dark:text-gray-300 ${animationClasses}`}>
              {getThemeLabel(theme)}
            </span>
          )}
          <button
            onClick={cycleTheme}
            onKeyDown={handleKeyDown}
            className={`
              relative inline-flex items-center h-6 rounded-full w-12 
              bg-gray-200 dark:bg-gray-700 
              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2
              ${animationClasses}
            `}
            role="switch"
            aria-checked={resolvedTheme === 'dark'}
            aria-label={`Theme toggle switch. Current: ${getThemeLabel(theme)}. Click to change theme.`}
          >
            <span
              className={`
                inline-block w-5 h-5 transform rounded-full
                bg-white dark:bg-gray-200 shadow-sm
                flex items-center justify-center
                ${animationClasses}
                ${theme === 'light' ? 'translate-x-0.5' : 
                  theme === 'dark' ? 'translate-x-6.5' : 
                  'translate-x-3.5'}
              `}
            >
              {theme === 'system' ? (
                <Monitor className="w-3 h-3 text-purple-500" />
              ) : theme === 'light' ? (
                <Sun className="w-3 h-3 text-amber-500" />
              ) : (
                <Moon className="w-3 h-3 text-blue-400" />
              )}
            </span>
          </button>
        </div>
      </>
    );
  }

  // Default button variant
  return (
    <>
      <div aria-live="polite" className="sr-only">{announcement}</div>
      
      <div className={`flex items-center gap-2 ${position === 'fixed' ? 'fixed top-4 right-4 z-50' : ''} ${className}`}>
        <button
          onClick={cycleTheme}
          onKeyDown={handleKeyDown}
          className={`${baseButtonClasses} hover:scale-105`}
          aria-label={`Theme toggle. Current: ${getThemeLabel(theme)}. Next: ${
            theme === 'light' ? 'Dark' : theme === 'dark' ? 'System' : 'Light'
          }`}
          title={`Current: ${getThemeLabel(theme)} → Click for ${
            theme === 'light' ? 'Dark' : theme === 'dark' ? 'System' : 'Light'
          }`}
        >
          {getThemeIcon(theme, true)}
        </button>
        
        {showLabel && (
          <span className={`${sizeClasses[size].text} text-gray-600 dark:text-gray-400 ${animationClasses}`}>
            {getThemeLabel(theme)}
          </span>
        )}
      </div>
    </>
  );
}

export default ProfessionalThemeToggle;
