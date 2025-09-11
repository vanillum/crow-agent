/**
 * Theme Validation and Quality Assessment
 */

import { ThemePreset, getAllThemePresets } from './presets.js';
import { validateTheme, THEME_QUALITY_RULES, THEME_IMPROVEMENT_SUGGESTIONS } from './rules.js';

export interface ThemeValidationResult {
  theme: ThemePreset;
  score: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  passed: boolean;
  issues: Array<{
    category: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    suggestion?: string;
  }>;
  suggestions: string[];
}

export function getGradeFromScore(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'B+';
  if (score >= 87) return 'B';
  if (score >= 83) return 'C+';
  if (score >= 80) return 'C';
  if (score >= 70) return 'D';
  return 'F';
}

export function validateAllThemes(): ThemeValidationResult[] {
  const themes = getAllThemePresets();
  return themes.map(theme => validateSingleTheme(theme));
}

export function validateSingleTheme(theme: ThemePreset): ThemeValidationResult {
  const validation = validateTheme(theme);
  const grade = getGradeFromScore(validation.score);
  
  const issues = validation.results
    .filter(result => !result.result.passed)
    .map(result => ({
      category: result.rule.category,
      severity: getSeverityFromCategory(result.rule.category),
      message: result.result.message || 'Validation failed',
      suggestion: result.result.suggestion
    }));

  const suggestions = generateSuggestions(theme, issues);

  return {
    theme,
    score: validation.score,
    grade,
    passed: validation.passed,
    issues,
    suggestions
  };
}

function getSeverityFromCategory(category: string): 'error' | 'warning' | 'info' {
  switch (category) {
    case 'contrast':
      return 'error';
    case 'color':
    case 'semantic':
      return 'warning';
    default:
      return 'info';
  }
}

function generateSuggestions(theme: ThemePreset, issues: any[]): string[] {
  const suggestions: string[] = [];
  
  // Add category-specific suggestions based on issues
  const categories = new Set(issues.map(issue => issue.category));
  
  if (categories.has('contrast')) {
    suggestions.push(...THEME_IMPROVEMENT_SUGGESTIONS.accessibility);
  }
  
  if (categories.has('color') || categories.has('harmony')) {
    suggestions.push(...THEME_IMPROVEMENT_SUGGESTIONS.color);
  }
  
  if (categories.has('animation')) {
    suggestions.push(...THEME_IMPROVEMENT_SUGGESTIONS.interaction);
  }
  
  // Always add technical suggestions
  suggestions.push(...THEME_IMPROVEMENT_SUGGESTIONS.technical);
  
  return [...new Set(suggestions)]; // Remove duplicates
}

export function generateThemeQualityReport(): string {
  const results = validateAllThemes();
  
  let report = '🎨 Theme Quality Report\n';
  report += '=' .repeat(50) + '\n\n';
  
  results.forEach(result => {
    report += `Theme: ${result.theme.name}\n`;
    report += `Score: ${result.score}% (${result.grade})\n`;
    report += `Status: ${result.passed ? '✅ PASSED' : '❌ NEEDS IMPROVEMENT'}\n`;
    
    if (result.issues.length > 0) {
      report += '\nIssues:\n';
      result.issues.forEach(issue => {
        const icon = issue.severity === 'error' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🔵';
        report += `  ${icon} ${issue.message}\n`;
        if (issue.suggestion) {
          report += `     💡 ${issue.suggestion}\n`;
        }
      });
    }
    
    if (result.suggestions.length > 0) {
      report += '\nSuggestions:\n';
      result.suggestions.slice(0, 3).forEach(suggestion => {
        report += `  • ${suggestion}\n`;
      });
    }
    
    report += '\n' + '-'.repeat(40) + '\n\n';
  });
  
  return report;
}

// Advanced theme improvement functions
export function suggestColorAdjustments(theme: ThemePreset): {
  adjustments: Array<{
    color: string;
    current: string;
    suggested: string;
    reason: string;
  }>;
} {
  const adjustments: Array<{
    color: string;
    current: string;
    suggested: string;
    reason: string;
  }> = [];
  
  // This would contain sophisticated color adjustment logic
  // For now, just a placeholder structure
  
  return { adjustments };
}

export function generateAccessibilityReport(theme: ThemePreset): {
  wcagLevel: 'AA' | 'AAA' | 'FAIL';
  issues: string[];
  fixes: string[];
} {
  // Sophisticated accessibility analysis would go here
  return {
    wcagLevel: 'AA',
    issues: [],
    fixes: []
  };
}
