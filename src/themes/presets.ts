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
  vercel: {
    id: 'vercel',
    name: 'Vercel',
    description: 'Clean black and white aesthetic with subtle grays',
    colors: {
      light: {
        background: '#ffffff',
        foreground: '#000000',
        primary: '#000000',
        secondary: '#666666',
        accent: '#0070f3',
        muted: '#fafafa',
        border: '#eaeaea',
      },
      dark: {
        background: '#000000',
        foreground: '#ffffff',
        primary: '#ffffff',
        secondary: '#888888',
        accent: '#0070f3',
        muted: '#111111',
        border: '#333333',
      },
    },
  },
  supabase: {
    id: 'supabase',
    name: 'Supabase',
    description: 'Green-focused theme with modern gradients',
    colors: {
      light: {
        background: '#ffffff',
        foreground: '#1f2937',
        primary: '#10b981',
        secondary: '#6b7280',
        accent: '#3b82f6',
        muted: '#f9fafb',
        border: '#e5e7eb',
      },
      dark: {
        background: '#0f172a',
        foreground: '#f8fafc',
        primary: '#10b981',
        secondary: '#94a3b8',
        accent: '#3b82f6',
        muted: '#1e293b',
        border: '#334155',
      },
    },
  },
  linear: {
    id: 'linear',
    name: 'Linear',
    description: 'Purple and blue gradient theme with clean typography',
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
    name: 'OpenAI',
    description: 'Teal and warm theme inspired by ChatGPT',
    colors: {
      light: {
        background: '#ffffff',
        foreground: '#2d3748',
        primary: '#10a37f',
        secondary: '#718096',
        accent: '#3182ce',
        muted: '#f7fafc',
        border: '#e2e8f0',
      },
      dark: {
        background: '#1a202c',
        foreground: '#f7fafc',
        primary: '#10a37f',
        secondary: '#a0aec0',
        accent: '#3182ce',
        muted: '#2d3748',
        border: '#4a5568',
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
