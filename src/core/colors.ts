/**
 * Comprehensive color mapping system for converting Tailwind classes to dark mode variants
 */

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
 * Transform a Tailwind class to include dark mode variant
 */
export function transformTailwindClass(className: string): string {
  return colorMappings[className] || className;
}

/**
 * Transform a string containing multiple Tailwind classes
 */
export function transformTailwindClasses(classString: string): string {
  const classes = classString.split(/\s+/).filter(Boolean);
  const transformedClasses = classes.map(transformTailwindClass);
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
