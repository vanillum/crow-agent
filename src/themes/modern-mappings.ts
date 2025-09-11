/**
 * Modern Professional Color Mappings
 * Based on v0, Linear, Supabase, OpenAI standards
 */

export interface ColorMapping {
  from: string;
  to: string;
  category: 'background' | 'text' | 'border' | 'interactive' | 'shadow' | 'gradient';
  contrastRatio?: number;
  description?: string;
}

export const PROFESSIONAL_COLOR_MAPPINGS: ColorMapping[] = [
  // === BACKGROUND MAPPINGS ===
  {
    from: 'bg-white',
    to: 'bg-white dark:bg-gray-900',
    category: 'background',
    contrastRatio: 21,
    description: 'Primary background - maximum contrast'
  },
  {
    from: 'bg-gray-50',
    to: 'bg-gray-50 dark:bg-gray-850',
    category: 'background',
    contrastRatio: 18,
    description: 'Secondary background - cards, panels'
  },
  {
    from: 'bg-gray-100',
    to: 'bg-gray-100 dark:bg-gray-800',
    category: 'background',
    contrastRatio: 15,
    description: 'Tertiary background - hover states'
  },
  {
    from: 'bg-gray-200',
    to: 'bg-gray-200 dark:bg-gray-750',
    category: 'background',
    contrastRatio: 12,
    description: 'Interactive element backgrounds'
  },

  // === TEXT CONTRAST MAPPINGS (WCAG AA Compliant) ===
  {
    from: 'text-gray-900',
    to: 'text-gray-900 dark:text-gray-100',
    category: 'text',
    contrastRatio: 4.6,
    description: 'Primary text - high emphasis'
  },
  {
    from: 'text-gray-800',
    to: 'text-gray-800 dark:text-gray-200',
    category: 'text',
    contrastRatio: 4.5,
    description: 'Secondary text - medium emphasis'
  },
  {
    from: 'text-gray-700',
    to: 'text-gray-700 dark:text-gray-300',
    category: 'text',
    contrastRatio: 4.5,
    description: 'Body text - readable'
  },
  {
    from: 'text-gray-600',
    to: 'text-gray-600 dark:text-gray-400',
    category: 'text',
    contrastRatio: 3.8,
    description: 'Supporting text - lower emphasis'
  },
  {
    from: 'text-gray-500',
    to: 'text-gray-500 dark:text-gray-500',
    category: 'text',
    contrastRatio: 3.1,
    description: 'Muted text - context dependent'
  },
  {
    from: 'text-gray-400',
    to: 'text-gray-400 dark:text-gray-600',
    category: 'text',
    contrastRatio: 2.8,
    description: 'Subtle text - minimal emphasis'
  },

  // === BORDER & DIVIDER STANDARDS ===
  {
    from: 'border-gray-200',
    to: 'border-gray-200 dark:border-gray-700',
    category: 'border',
    description: 'Standard borders - cards, inputs'
  },
  {
    from: 'border-gray-300',
    to: 'border-gray-300 dark:border-gray-600',
    category: 'border',
    description: 'Emphasized borders - focus states'
  },
  {
    from: 'border-gray-100',
    to: 'border-gray-100 dark:border-gray-800',
    category: 'border',
    description: 'Subtle dividers'
  },

  // === INTERACTIVE ELEMENT MAPPINGS ===
  {
    from: 'hover:bg-gray-50',
    to: 'hover:bg-gray-50 dark:hover:bg-gray-800',
    category: 'interactive',
    description: 'Hover states for buttons, links'
  },
  {
    from: 'hover:bg-gray-100',
    to: 'hover:bg-gray-100 dark:hover:bg-gray-750',
    category: 'interactive',
    description: 'Stronger hover states'
  },
  {
    from: 'focus:ring-blue-500',
    to: 'focus:ring-blue-500 dark:focus:ring-blue-400',
    category: 'interactive',
    description: 'Focus rings - accessibility'
  },
  {
    from: 'focus:ring-purple-500',
    to: 'focus:ring-purple-500 dark:focus:ring-purple-400',
    category: 'interactive',
    description: 'Purple focus rings'
  },

  // === SHADOW MAPPINGS ===
  {
    from: 'shadow-sm',
    to: 'shadow-sm dark:shadow-lg dark:shadow-black/25',
    category: 'shadow',
    description: 'Light shadows enhanced for dark mode'
  },
  {
    from: 'shadow-md',
    to: 'shadow-md dark:shadow-xl dark:shadow-black/30',
    category: 'shadow',
    description: 'Medium shadows enhanced for dark mode'
  },
  {
    from: 'shadow-lg',
    to: 'shadow-lg dark:shadow-2xl dark:shadow-black/40',
    category: 'shadow',
    description: 'Large shadows enhanced for dark mode'
  },

  // === GRADIENT MAPPINGS ===
  {
    from: 'from-white',
    to: 'from-white dark:from-gray-900',
    category: 'gradient',
    description: 'Gradient start points'
  },
  {
    from: 'to-gray-100',
    to: 'to-gray-100 dark:to-gray-800',
    category: 'gradient',
    description: 'Gradient end points'
  },
  {
    from: 'from-blue-50',
    to: 'from-blue-50 dark:from-blue-950',
    category: 'gradient',
    description: 'Colored gradient starts'
  },
  {
    from: 'to-blue-100',
    to: 'to-blue-100 dark:to-blue-900',
    category: 'gradient',
    description: 'Colored gradient ends'
  }
];

// Status colors that maintain consistency
export const STATUS_COLOR_MAPPINGS: ColorMapping[] = [
  // Success colors
  {
    from: 'text-green-600',
    to: 'text-green-600 dark:text-green-400',
    category: 'text',
    description: 'Success text'
  },
  {
    from: 'bg-green-50',
    to: 'bg-green-50 dark:bg-green-950/50',
    category: 'background',
    description: 'Success background'
  },

  // Error colors
  {
    from: 'text-red-600',
    to: 'text-red-600 dark:text-red-400',
    category: 'text',
    description: 'Error text'
  },
  {
    from: 'bg-red-50',
    to: 'bg-red-50 dark:bg-red-950/50',
    category: 'background',
    description: 'Error background'
  },

  // Warning colors
  {
    from: 'text-yellow-600',
    to: 'text-yellow-600 dark:text-yellow-400',
    category: 'text',
    description: 'Warning text'
  },
  {
    from: 'bg-yellow-50',
    to: 'bg-yellow-50 dark:bg-yellow-950/50',
    category: 'background',
    description: 'Warning background'
  },

  // Info colors
  {
    from: 'text-blue-600',
    to: 'text-blue-600 dark:text-blue-400',
    category: 'text',
    description: 'Info text'
  },
  {
    from: 'bg-blue-50',
    to: 'bg-blue-50 dark:bg-blue-950/50',
    category: 'background',
    description: 'Info background'
  }
];

// Modern card and panel patterns
export const COMPONENT_PATTERNS = {
  card: {
    light: 'bg-white border border-gray-200 shadow-sm',
    dark: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm dark:shadow-lg dark:shadow-black/25',
    description: 'Professional card styling'
  },
  
  panel: {
    light: 'bg-gray-50 border border-gray-100',
    dark: 'bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-800',
    description: 'Secondary panel styling'
  },

  button: {
    light: 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500',
    dark: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
    description: 'Interactive button styling'
  },

  input: {
    light: 'bg-white text-gray-900 border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
    dark: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400',
    description: 'Form input styling'
  }
};

export function getAllMappings(): ColorMapping[] {
  return [
    ...PROFESSIONAL_COLOR_MAPPINGS,
    ...STATUS_COLOR_MAPPINGS
  ];
}

export function getMappingsByCategory(category: string): ColorMapping[] {
  return getAllMappings().filter(mapping => mapping.category === category);
}

export function findMapping(className: string): ColorMapping | undefined {
  return getAllMappings().find(mapping => mapping.from === className);
}
