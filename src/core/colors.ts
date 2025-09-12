/**
 * Comprehensive color mapping system for converting Tailwind classes to dark mode variants
 */
import { getThemePreset } from '../themes/presets.js';

export interface ColorMapping {
  light: string;
  dark: string;
  category: 'background' | 'text' | 'border' | 'ring' | 'divide' | 'placeholder' | 'accent';
}

// Background color mappings
const backgroundMappings: Record<string, string> = {
  'bg-white': 'bg-white dark:bg-gray-900',
  'bg-gray-50': 'bg-gray-50 dark:bg-gray-800',
  'bg-gray-100': 'bg-gray-100 dark:bg-gray-800',
  'bg-gray-200': 'bg-gray-200 dark:bg-gray-700',
  'bg-gray-300': 'bg-gray-300 dark:bg-gray-600',
  'bg-gray-400': 'bg-gray-400 dark:bg-gray-500',
  'bg-gray-500': 'bg-gray-500 dark:bg-gray-400',
  'bg-gray-600': 'bg-gray-600 dark:bg-gray-300',
  'bg-gray-700': 'bg-gray-700 dark:bg-gray-200',
  'bg-gray-800': 'bg-gray-800 dark:bg-gray-100',
  'bg-gray-900': 'bg-gray-900 dark:bg-white',
  
  // Slate
  'bg-slate-50': 'bg-slate-50 dark:bg-slate-800',
  'bg-slate-100': 'bg-slate-100 dark:bg-slate-800',
  'bg-slate-200': 'bg-slate-200 dark:bg-slate-700',
  'bg-slate-300': 'bg-slate-300 dark:bg-slate-600',
  'bg-slate-800': 'bg-slate-800 dark:bg-slate-200',
  'bg-slate-900': 'bg-slate-900 dark:bg-slate-100',
  
  // Zinc
  'bg-zinc-50': 'bg-zinc-50 dark:bg-zinc-800',
  'bg-zinc-100': 'bg-zinc-100 dark:bg-zinc-800',
  'bg-zinc-200': 'bg-zinc-200 dark:bg-zinc-700',
  'bg-zinc-800': 'bg-zinc-800 dark:bg-zinc-200',
  'bg-zinc-900': 'bg-zinc-900 dark:bg-zinc-100',
  
  // Neutral
  'bg-neutral-50': 'bg-neutral-50 dark:bg-neutral-800',
  'bg-neutral-100': 'bg-neutral-100 dark:bg-neutral-800',
  'bg-neutral-200': 'bg-neutral-200 dark:bg-neutral-700',
  'bg-neutral-800': 'bg-neutral-800 dark:bg-neutral-200',
  'bg-neutral-900': 'bg-neutral-900 dark:bg-neutral-100',
};

// Text color mappings
const textMappings: Record<string, string> = {
  'text-black': 'text-black dark:text-white',
  'text-white': 'text-white dark:text-black',
  'text-gray-900': 'text-gray-900 dark:text-gray-100',
  'text-gray-800': 'text-gray-800 dark:text-gray-200',
  'text-gray-700': 'text-gray-700 dark:text-gray-300',
  'text-gray-600': 'text-gray-600 dark:text-gray-400',
  'text-gray-500': 'text-gray-500 dark:text-gray-400',
  'text-gray-400': 'text-gray-400 dark:text-gray-500',
  'text-gray-300': 'text-gray-300 dark:text-gray-600',
  'text-gray-200': 'text-gray-200 dark:text-gray-700',
  'text-gray-100': 'text-gray-100 dark:text-gray-800',
  
  // Slate
  'text-slate-900': 'text-slate-900 dark:text-slate-100',
  'text-slate-800': 'text-slate-800 dark:text-slate-200',
  'text-slate-700': 'text-slate-700 dark:text-slate-300',
  'text-slate-600': 'text-slate-600 dark:text-slate-400',
  'text-slate-500': 'text-slate-500 dark:text-slate-400',
  'text-slate-400': 'text-slate-400 dark:text-slate-500',
  'text-slate-300': 'text-slate-300 dark:text-slate-600',
  'text-slate-200': 'text-slate-200 dark:text-slate-700',
  'text-slate-100': 'text-slate-100 dark:text-slate-800',
  
  // Zinc
  'text-zinc-900': 'text-zinc-900 dark:text-zinc-100',
  'text-zinc-800': 'text-zinc-800 dark:text-zinc-200',
  'text-zinc-700': 'text-zinc-700 dark:text-zinc-300',
  'text-zinc-600': 'text-zinc-600 dark:text-zinc-400',
  'text-zinc-500': 'text-zinc-500 dark:text-zinc-400',
  'text-zinc-400': 'text-zinc-400 dark:text-zinc-500',
  'text-zinc-300': 'text-zinc-300 dark:text-zinc-600',
  'text-zinc-200': 'text-zinc-200 dark:text-zinc-700',
  'text-zinc-100': 'text-zinc-100 dark:text-zinc-800',
  
  // Neutral
  'text-neutral-900': 'text-neutral-900 dark:text-neutral-100',
  'text-neutral-800': 'text-neutral-800 dark:text-neutral-200',
  'text-neutral-700': 'text-neutral-700 dark:text-neutral-300',
  'text-neutral-600': 'text-neutral-600 dark:text-neutral-400',
  'text-neutral-500': 'text-neutral-500 dark:text-neutral-400',
  'text-neutral-400': 'text-neutral-400 dark:text-neutral-500',
  'text-neutral-300': 'text-neutral-300 dark:text-neutral-600',
  'text-neutral-200': 'text-neutral-200 dark:text-neutral-700',
  'text-neutral-100': 'text-neutral-100 dark:text-neutral-800',
};

// Border color mappings
const borderMappings: Record<string, string> = {
  'border-gray-200': 'border-gray-200 dark:border-gray-700',
  'border-gray-300': 'border-gray-300 dark:border-gray-600',
  'border-gray-400': 'border-gray-400 dark:border-gray-500',
  'border-gray-500': 'border-gray-500 dark:border-gray-400',
  'border-gray-600': 'border-gray-600 dark:border-gray-300',
  'border-gray-700': 'border-gray-700 dark:border-gray-200',
  
  // Slate
  'border-slate-200': 'border-slate-200 dark:border-slate-700',
  'border-slate-300': 'border-slate-300 dark:border-slate-600',
  'border-slate-400': 'border-slate-400 dark:border-slate-500',
  'border-slate-500': 'border-slate-500 dark:border-slate-400',
  'border-slate-600': 'border-slate-600 dark:border-slate-300',
  'border-slate-700': 'border-slate-700 dark:border-slate-200',
  
  // Zinc
  'border-zinc-200': 'border-zinc-200 dark:border-zinc-700',
  'border-zinc-300': 'border-zinc-300 dark:border-zinc-600',
  'border-zinc-700': 'border-zinc-700 dark:border-zinc-200',
  
  // Neutral
  'border-neutral-200': 'border-neutral-200 dark:border-neutral-700',
  'border-neutral-300': 'border-neutral-300 dark:border-neutral-600',
  'border-neutral-700': 'border-neutral-700 dark:border-neutral-200',
};

// Ring color mappings (for focus states)
const ringMappings: Record<string, string> = {
  'ring-gray-500': 'ring-gray-500 dark:ring-gray-400',
  'ring-blue-500': 'ring-blue-500 dark:ring-blue-400',
  'ring-indigo-500': 'ring-indigo-500 dark:ring-indigo-400',
  'ring-purple-500': 'ring-purple-500 dark:ring-purple-400',
  'ring-pink-500': 'ring-pink-500 dark:ring-pink-400',
  'ring-red-500': 'ring-red-500 dark:ring-red-400',
  'ring-orange-500': 'ring-orange-500 dark:ring-orange-400',
  'ring-amber-500': 'ring-amber-500 dark:ring-amber-400',
  'ring-yellow-500': 'ring-yellow-500 dark:ring-yellow-400',
  'ring-lime-500': 'ring-lime-500 dark:ring-lime-400',
  'ring-green-500': 'ring-green-500 dark:ring-green-400',
  'ring-emerald-500': 'ring-emerald-500 dark:ring-emerald-400',
  'ring-teal-500': 'ring-teal-500 dark:ring-teal-400',
  'ring-cyan-500': 'ring-cyan-500 dark:ring-cyan-400',
  'ring-sky-500': 'ring-sky-500 dark:ring-sky-400',
};

// Divide color mappings (for divide utilities)
const divideMappings: Record<string, string> = {
  'divide-gray-200': 'divide-gray-200 dark:divide-gray-700',
  'divide-gray-300': 'divide-gray-300 dark:divide-gray-600',
  'divide-slate-200': 'divide-slate-200 dark:divide-slate-700',
  'divide-slate-300': 'divide-slate-300 dark:divide-slate-600',
  'divide-zinc-200': 'divide-zinc-200 dark:divide-zinc-700',
  'divide-neutral-200': 'divide-neutral-200 dark:divide-neutral-700',
};

// Placeholder color mappings
const placeholderMappings: Record<string, string> = {
  'placeholder-gray-400': 'placeholder-gray-400 dark:placeholder-gray-500',
  'placeholder-gray-500': 'placeholder-gray-500 dark:placeholder-gray-400',
  'placeholder-slate-400': 'placeholder-slate-400 dark:placeholder-slate-500',
  'placeholder-zinc-400': 'placeholder-zinc-400 dark:placeholder-zinc-500',
  'placeholder-neutral-400': 'placeholder-neutral-400 dark:placeholder-neutral-500',
};

// Combined mappings
export const colorMappings: Record<string, string> = {
  ...backgroundMappings,
  ...textMappings,
  ...borderMappings,
  ...ringMappings,
  ...divideMappings,
  ...placeholderMappings,
};

/**
 * Convert hex color to Tailwind-compatible class approximation
 */
function hexToTailwindClass(hex: string, prefix: string): string {
  // This is a simplified mapping - in practice you might want more sophisticated color matching
  const colorMap: Record<string, string> = {
    // Blacks and whites
    '#000000': 'black',
    '#ffffff': 'white',
    '#0a0a0a': 'black',    // Vercel dark background should map to black
    '#fafafa': 'gray-50',
    '#1a1a1a': 'gray-800',
    '#2a2a2a': 'gray-700',
    // Grays
    '#525252': 'gray-500',
    '#a3a3a3': 'gray-400',
    '#e5e5e5': 'gray-300',
    // Vercel-specific
    '#0070f3': 'blue-500',
    '#0084ff': 'blue-400',
    // Supabase greens
    '#059669': 'green-600',
    '#10b981': 'green-500',
    // Linear purples
    '#8b5cf6': 'purple-500',
    '#a78bfa': 'purple-400',
    // OpenAI teals
    '#0d9488': 'teal-600',
    '#14b8a6': 'teal-500',
  };
  
  const tailwindColor = colorMap[hex.toLowerCase()];
  return tailwindColor ? `${prefix}-${tailwindColor}` : '';
}

/**
 * Get theme-specific color mapping for a Tailwind class
 */
function getThemeSpecificMapping(className: string, themeId: string): string | null {
  const theme = getThemePreset(themeId);
  if (!theme) return null;

  // Map common Tailwind classes to theme colors
  const themeColorMappings: Record<string, { light: string; dark: string }> = {
    // Background mappings
    'bg-white': { light: 'bg-white', dark: hexToTailwindClass(theme.colors.dark.background, 'bg') || 'bg-gray-900' },
    'bg-gray-50': { light: 'bg-gray-50', dark: hexToTailwindClass(theme.colors.dark.muted, 'bg') || 'bg-gray-800' },
    'bg-gray-100': { light: 'bg-gray-100', dark: hexToTailwindClass(theme.colors.dark.muted, 'bg') || 'bg-gray-800' },
    'bg-gray-900': { light: 'bg-gray-900', dark: hexToTailwindClass(theme.colors.dark.background, 'bg') || 'bg-white' },

    // Text mappings
    'text-black': { light: 'text-black', dark: hexToTailwindClass(theme.colors.dark.foreground, 'text') || 'text-white' },
    'text-white': { light: 'text-white', dark: hexToTailwindClass(theme.colors.dark.background, 'text') || 'text-black' },
    'text-gray-900': { light: 'text-gray-900', dark: hexToTailwindClass(theme.colors.dark.foreground, 'text') || 'text-gray-100' },
    'text-gray-600': { light: 'text-gray-600', dark: hexToTailwindClass(theme.colors.dark.secondary, 'text') || 'text-gray-400' },

    // Border mappings
    'border-gray-200': { light: 'border-gray-200', dark: hexToTailwindClass(theme.colors.dark.border, 'border') || 'border-gray-700' },
    'border-gray-300': { light: 'border-gray-300', dark: hexToTailwindClass(theme.colors.dark.border, 'border') || 'border-gray-600' },
  };

  const mapping = themeColorMappings[className];
  if (mapping) {
    // Professional theme-specific mappings using exact design system colors
    if (themeId === 'vercel') {
      // Legacy Vercel theme - pure black/white for strong contrast
      switch (className) {
        case 'bg-white':
          return 'bg-white dark:bg-black';
        case 'bg-gray-50':
        case 'bg-gray-100':
          return `${className} dark:bg-gray-900`;
        case 'bg-gray-900':
          return 'bg-gray-900 dark:bg-white';
        case 'text-black':
          return 'text-black dark:text-white';
        case 'text-white':
          return 'text-white dark:text-black';
        case 'text-gray-900':
          return 'text-gray-900 dark:text-gray-100';
        case 'text-gray-600':
          return 'text-gray-600 dark:text-gray-300';
        case 'border-gray-200':
          return 'border-gray-200 dark:border-gray-800';
        case 'border-gray-300':
          return 'border-gray-300 dark:border-gray-700';
      }
    }
    
    if (themeId === 'v0') {
      // Ultra-minimal with precise OKLCH values for perfect perceptual uniformity
      switch (className) {
        case 'bg-white':
          return 'bg-white dark:bg-[oklch(0.145 0 0)]';
        case 'bg-gray-50':
        case 'bg-gray-100':
          return `${className} dark:bg-[oklch(0.182 0 0)]`;
        case 'bg-gray-900':
          return 'bg-gray-900 dark:bg-[oklch(0.946 0 0)]';
        case 'text-gray-900':
          return 'text-gray-900 dark:text-[oklch(0.946 0 0)]';
        case 'text-gray-700':
          return 'text-gray-700 dark:text-[oklch(0.706 0 0)]';
        case 'text-gray-600':
          return 'text-gray-600 dark:text-[oklch(0.39 0 0)]';
        case 'border-gray-200':
          return 'border-gray-200 dark:border-[oklch(0.239 0 0)]';
      }
    }
    
    if (themeId === 'linear') {
      // Advanced LCH color science with consistent hue angles  
      switch (className) {
        case 'bg-white':
          return 'bg-white dark:bg-[lch(12.236 2.213 272.695)]';
        case 'bg-gray-50':
          return 'bg-gray-50 dark:bg-[lch(17.236 4.213 272.695)]';
        case 'bg-gray-100':
          return 'bg-gray-100 dark:bg-[lch(18.236 2.213 272.695)]';
        case 'bg-gray-200':
          return 'bg-gray-200 dark:bg-[lch(20.636 4.613 272.695)]';
        case 'text-gray-900':
          return 'text-gray-900 dark:text-[lch(91.024 1.106 272.695)]';
        case 'text-gray-700':
          return 'text-gray-700 dark:text-[lch(64.894 2.106 272.695)]';
        case 'text-gray-600':
          return 'text-gray-600 dark:text-[lch(64.094 1.106 272.695)]';
        case 'border-gray-200':
          return 'border-gray-200 dark:border-[lch(22.236 2.613 272.695)]';
      }
    }
    
    if (themeId === 'supabase') {
      // Clean hex system with signature green brand integration
      switch (className) {
        case 'bg-white':
          return 'bg-white dark:bg-[#171717]';
        case 'bg-gray-50':
          return 'bg-gray-50 dark:bg-[#1F1F1F]';
        case 'bg-gray-100':
          return 'bg-gray-100 dark:bg-[#212121]';
        case 'bg-gray-900':
          return 'bg-gray-900 dark:bg-[#FAFAFA]';
        case 'text-gray-900':
          return 'text-gray-900 dark:text-[#FAFAFA]';
        case 'text-gray-700':
          return 'text-gray-700 dark:text-[#B4B4B4]';
        case 'text-gray-600':
          return 'text-gray-600 dark:text-[#898989]';
        case 'border-gray-200':
          return 'border-gray-200 dark:border-[#313131]';
        case 'border-gray-300':
          return 'border-gray-300 dark:border-[#454545]';
      }
    }
    
    if (themeId === 'openai') {
      // High-contrast system with strategic blue accents
      switch (className) {
        case 'bg-white':
          return 'bg-white dark:bg-[#0D0D0D]';
        case 'bg-gray-50':
          return 'bg-gray-50 dark:bg-[#171717]';
        case 'bg-gray-100':
          return 'bg-gray-100 dark:bg-[#212121]';
        case 'bg-gray-900':
          return 'bg-gray-900 dark:bg-[#F3F3F3]';
        case 'text-gray-900':
          return 'text-gray-900 dark:text-[#F3F3F3]';
        case 'text-gray-700':
          return 'text-gray-700 dark:text-[#AFAFAF]';
        case 'text-gray-600':
          return 'text-gray-600 dark:text-[#424242]';
        case 'border-gray-200':
          return 'border-gray-200 dark:border-[#303030]';
        case 'border-gray-300':
          return 'border-gray-300 dark:border-[#424242]';
      }
    }
    
    return `${mapping.light} dark:${mapping.dark}`;
  }

  return null;
}

/**
 * Transform a Tailwind class to include dark mode variant
 */
export function transformTailwindClass(className: string, themeId?: string): string {
  // If a theme is specified, use theme-specific color mappings
  if (themeId) {
    const themeMapping = getThemeSpecificMapping(className, themeId);
    if (themeMapping) {
      return themeMapping;
    }
  }
  
  // Fall back to generic color mappings
  return colorMappings[className] || className;
}

/**
 * Transform an existing class string that may already have dark variants
 * This replaces existing dark variants with theme-specific ones
 */
export function transformExistingClasses(classString: string, themeId?: string): string {
  if (!themeId) {
    return classString;
  }

  const classes = classString.split(/\s+/).filter(Boolean);
  const transformedClasses: string[] = [];
  
  let i = 0;
  while (i < classes.length) {
    const cls = classes[i];
    
    // If this is a base class that might have a dark variant following it
    if (!cls.startsWith('dark:')) {
      const themeMapping = getThemeSpecificMapping(cls, themeId);
      if (themeMapping) {
        // Check if the next class is a dark variant of this class
        const nextClass = i + 1 < classes.length ? classes[i + 1] : null;
        if (nextClass && nextClass.startsWith('dark:')) {
          // Replace both the base class and its dark variant with theme-specific mapping
          transformedClasses.push(themeMapping);
          i += 2; // Skip both current and next class
          continue;
        } else {
          // Just add the theme mapping
          transformedClasses.push(themeMapping);
          i++;
          continue;
        }
      }
    }
    
    // For any class that doesn't have a theme mapping, keep it as-is
    transformedClasses.push(cls);
    i++;
  }
  
  return transformedClasses.join(' ');
}

/**
 * Transform a string containing multiple Tailwind classes
 */
export function transformTailwindClasses(classString: string, themeId?: string): string {
  // If there's a theme and the string might already have dark variants, use the new logic
  if (themeId && hasExistingDarkVariant(classString)) {
    return transformExistingClasses(classString, themeId);
  }
  
  // Otherwise, use the original logic
  const classes = classString.split(/\s+/).filter(Boolean);
  const transformedClasses = classes.map(cls => transformTailwindClass(cls, themeId));
  return transformedClasses.join(' ');
}

/**
 * Check if a class already has dark mode variant
 */
export function hasExistingDarkVariant(classString: string): boolean {
  return classString.includes('dark:');
}

/**
 * Get all classes that need dark mode transformation
 */
export function getTransformableClasses(): string[] {
  return Object.keys(colorMappings);
}

/**
 * Analyze what percentage of classes in a string are transformable
 */
export function analyzeClassTransformability(classString: string): {
  total: number;
  transformable: number;
  percentage: number;
  classes: {
    transformable: string[];
    nonTransformable: string[];
    alreadyHasDark: string[];
  };
} {
  const classes = classString.split(/\s+/).filter(Boolean);
  const transformableClasses: string[] = [];
  const nonTransformableClasses: string[] = [];
  const alreadyHasDarkClasses: string[] = [];

  for (const cls of classes) {
    if (cls.includes('dark:')) {
      alreadyHasDarkClasses.push(cls);
    } else if (colorMappings[cls]) {
      transformableClasses.push(cls);
    } else {
      nonTransformableClasses.push(cls);
    }
  }

  return {
    total: classes.length,
    transformable: transformableClasses.length,
    percentage: classes.length > 0 ? (transformableClasses.length / classes.length) * 100 : 0,
    classes: {
      transformable: transformableClasses,
      nonTransformable: nonTransformableClasses,
      alreadyHasDark: alreadyHasDarkClasses,
    },
  };
}
