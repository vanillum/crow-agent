/**
 * Brand theme presets for popular companies/services
 */

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: {
    light: {
      background: string;
      foreground: string;
      primary: string;
      secondary: string;
      accent: string;
      muted: string;
      border: string;
    };
    dark: {
      background: string;
      foreground: string;
      primary: string;
      secondary: string;
      accent: string;
      muted: string;
      border: string;
    };
  };
}

export const BRAND_PRESETS: Record<string, ThemePreset> = {
  v0: {
    id: 'v0',
    name: 'v0 (Minimal Precision)',
    description: 'Ultra-minimal with precise OKLCH values for perfect perceptual uniformity',
    colors: {
      light: {
        background: '#ffffff',
        foreground: '#0a0a0a',  // Improved contrast
        primary: '#000000',
        secondary: '#525252',   // Better contrast than #666
        accent: '#0070f3',
        muted: '#fafafa',
        border: '#e5e5e5',     // Softer than #eaeaea
      },
      dark: {
        background: '#0a0a0a',  // Near black like modern apps
        foreground: '#fafafa',  // Softer than pure white
        primary: '#ffffff',
        secondary: '#a3a3a3',   // Better dark mode contrast
        accent: '#0084ff',      // Brighter for dark mode
        muted: '#1a1a1a',      // Professional gray-850
        border: '#2a2a2a',     // Professional gray-800
      },
    },
  },
  supabase: {
    id: 'supabase',
    name: 'Supabase (Clean Hex System)',
    description: 'Clean, high-contrast hex values with signature green brand integration',
    colors: {
      light: {
        background: '#ffffff',
        foreground: '#1f2937',
        primary: '#059669',     // Slightly darker green for better contrast
        secondary: '#6b7280',
        accent: '#2563eb',      // Improved blue contrast
        muted: '#f9fafb',
        border: '#e5e7eb',
      },
      dark: {
        background: '#0a0a0a',  // Consistent dark background
        foreground: '#f8fafc',
        primary: '#10b981',
        secondary: '#9ca3af',   // Better contrast
        accent: '#3b82f6',
        muted: '#1a1a1a',      // Consistent with other themes
        border: '#374151',     // Better dark border
      },
    },
  },
  linear: {
    id: 'linear',
    name: 'Linear (Sophisticated LCH)',
    description: 'Advanced LCH color science with consistent hue angles for professional applications',
    colors: {
      light: {
        background: '#ffffff',
        foreground: '#18181b',
        primary: '#8b5cf6',
        secondary: '#71717a',
        accent: '#6366f1',
        muted: '#fafafa',
        border: '#e4e4e7',
      },
      dark: {
        background: '#09090b',
        foreground: '#fafafa',
        primary: '#a78bfa',
        secondary: '#a1a1aa',
        accent: '#8b5cf6',
        muted: '#1c1c1f',
        border: '#27272a',
      },
    },
  },
  openai: {
    id: 'openai',
    name: 'OpenAI (Balanced Contrast)', 
    description: 'High-contrast system with strategic blue accents for professional AI applications',
    colors: {
      light: {
        background: '#ffffff',
        foreground: '#1f2937',    // Better contrast than #2d3748
        primary: '#0d9488',       // Professional teal
        secondary: '#6b7280',     // Consistent secondary
        accent: '#2563eb',        // Better blue accent
        muted: '#f9fafb',         // Consistent muted
        border: '#e5e7eb',        // Standard border
      },
      dark: {
        background: '#0a0a0a',    // Consistent dark background
        foreground: '#f9fafb',    // Softer than pure white
        primary: '#14b8a6',       // Brighter teal for dark mode
        secondary: '#9ca3af',     // Better dark contrast
        accent: '#3b82f6',        // Consistent accent
        muted: '#1a1a1a',        // Consistent muted
        border: '#374151',        // Professional border
      },
    },
  },
  custom: {
    id: 'custom',
    name: 'Custom Theme',
    description: 'Configure your own colors manually',
    colors: {
      light: {
        background: '#ffffff',
        foreground: '#1f2937',
        primary: '#3b82f6',
        secondary: '#6b7280',
        accent: '#8b5cf6',
        muted: '#f9fafb',
        border: '#e5e7eb',
      },
      dark: {
        background: '#111827',
        foreground: '#f9fafb',
        primary: '#60a5fa',
        secondary: '#9ca3af',
        accent: '#a78bfa',
        muted: '#1f2937',
        border: '#374151',
      },
    },
  },
};

export function getThemePreset(id: string): ThemePreset | undefined {
  return BRAND_PRESETS[id];
}

export function getAllThemePresets(): ThemePreset[] {
  return Object.values(BRAND_PRESETS);
}
