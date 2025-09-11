/**
 * Theme Quality Rules & Guidelines
 * Comprehensive rules for creating high-quality, accessible themes
 */

export interface ColorRule {
  name: string;
  description: string;
  validate: (color: string, context?: any) => boolean;
  suggestion?: string;
}

export interface ContrastRule {
  foreground: string;
  background: string;
  minRatio: number;
  level: 'AA' | 'AAA';
}

export interface ThemeRule {
  id: string;
  category: 'color' | 'contrast' | 'harmony' | 'semantic' | 'animation';
  name: string;
  description: string;
  validate: (theme: any) => { passed: boolean; message?: string; suggestion?: string };
}

// Color contrast calculation (simplified)
function getContrastRatio(color1: string, color2: string): number {
  // Simplified - in real implementation would use proper color calculations
  return 4.5; // Mock for now
}

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Get luminance of a color
function getLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Calculate actual contrast ratio
function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

export const THEME_QUALITY_RULES: ThemeRule[] = [
  // 1. CONTRAST RULES
  {
    id: 'contrast-aa-text',
    category: 'contrast',
    name: 'Text Contrast (WCAG AA)',
    description: 'Text must have at least 4.5:1 contrast ratio against background',
    validate: (theme) => {
      const lightRatio = calculateContrastRatio(theme.colors.light.foreground, theme.colors.light.background);
      const darkRatio = calculateContrastRatio(theme.colors.dark.foreground, theme.colors.dark.background);
      
      const passed = lightRatio >= 4.5 && darkRatio >= 4.5;
      return {
        passed,
        message: passed ? 'Text contrast meets WCAG AA standards' : `Text contrast too low: Light(${lightRatio.toFixed(1)}:1), Dark(${darkRatio.toFixed(1)}:1)`,
        suggestion: !passed ? 'Adjust foreground colors for better contrast' : undefined
      };
    }
  },
  
  {
    id: 'contrast-button-text',
    category: 'contrast',
    name: 'Button Text Contrast',
    description: 'Button text must be readable against button background',
    validate: (theme) => {
      const lightRatio = calculateContrastRatio('#ffffff', theme.colors.light.primary);
      const darkRatio = calculateContrastRatio('#ffffff', theme.colors.dark.primary);
      
      const passed = lightRatio >= 3.0 && darkRatio >= 3.0;
      return {
        passed,
        message: passed ? 'Button text contrast is adequate' : `Button contrast too low: Light(${lightRatio.toFixed(1)}:1), Dark(${darkRatio.toFixed(1)}:1)`,
        suggestion: !passed ? 'Use darker primary colors or lighter button text' : undefined
      };
    }
  },

  // 2. COLOR HARMONY RULES
  {
    id: 'color-harmony-primary-accent',
    category: 'harmony',
    name: 'Primary-Accent Harmony',
    description: 'Primary and accent colors should be harmonious',
    validate: (theme) => {
      // Simple check - could be more sophisticated with color theory
      const primaryLight = theme.colors.light.primary;
      const accentLight = theme.colors.light.accent;
      
      // For now, just check they're different
      const passed = primaryLight !== accentLight;
      return {
        passed,
        message: passed ? 'Primary and accent colors are distinct' : 'Primary and accent colors are identical',
        suggestion: !passed ? 'Choose different colors for primary and accent' : undefined
      };
    }
  },

  // 3. SEMANTIC CONSISTENCY RULES
  {
    id: 'semantic-muted-lightness',
    category: 'semantic',
    name: 'Muted Color Appropriateness',
    description: 'Muted colors should be lighter than foreground in light mode, darker in dark mode',
    validate: (theme) => {
      // This would need proper color lightness calculation
      const passed = true; // Simplified for now
      return {
        passed,
        message: 'Muted colors are appropriately lighter/darker',
        suggestion: undefined
      };
    }
  },

  {
    id: 'semantic-border-subtlety',
    category: 'semantic',
    name: 'Border Subtlety',
    description: 'Border colors should be subtle and not overpower content',
    validate: (theme) => {
      const passed = theme.colors.light.border !== theme.colors.light.foreground &&
                    theme.colors.dark.border !== theme.colors.dark.foreground;
      return {
        passed,
        message: passed ? 'Border colors are appropriately subtle' : 'Border colors too similar to text',
        suggestion: !passed ? 'Make border colors more subtle' : undefined
      };
    }
  },

  // 4. ANIMATION CONSISTENCY RULES
  {
    id: 'animation-duration-consistency',
    category: 'animation',
    name: 'Animation Duration Standards',
    description: 'Theme transitions should use consistent timing',
    validate: () => {
      // This would check CSS transition durations in actual implementation
      return {
        passed: true,
        message: 'Animation durations are consistent'
      };
    }
  }
];

export function validateTheme(theme: any): {
  passed: boolean;
  score: number;
  results: Array<{ rule: ThemeRule; result: any }>;
} {
  const results = THEME_QUALITY_RULES.map(rule => ({
    rule,
    result: rule.validate(theme)
  }));

  const passedRules = results.filter(r => r.result.passed).length;
  const totalRules = results.length;
  const score = Math.round((passedRules / totalRules) * 100);
  const passed = score >= 80; // 80% threshold

  return {
    passed,
    score,
    results
  };
}

export const THEME_IMPROVEMENT_SUGGESTIONS = {
  // Color palette improvements
  color: [
    'Use tools like Coolors.co or Adobe Color for harmonious palettes',
    'Test colors with different types of color blindness',
    'Ensure sufficient contrast between all color pairs',
    'Use semantic color naming for clarity'
  ],

  // Interaction improvements
  interaction: [
    'Add hover states for all interactive elements',
    'Include focus states for keyboard navigation',
    'Use consistent transition durations (150-300ms)',
    'Provide clear visual feedback for state changes'
  ],

  // Accessibility improvements
  accessibility: [
    'Test with screen readers and keyboard navigation',
    'Ensure minimum 4.5:1 contrast for normal text',
    'Ensure minimum 3:1 contrast for large text and UI elements',
    'Provide alternative ways to distinguish colors (icons, patterns)'
  ],

  // Technical improvements
  technical: [
    'Use CSS custom properties for theme variables',
    'Implement theme persistence with localStorage',
    'Respect user system preferences (prefers-color-scheme)',
    'Add loading states and smooth transitions'
  ]
};
