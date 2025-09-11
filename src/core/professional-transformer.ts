/**
 * Professional-grade transformer for modern dark mode implementations
 * Based on v0, Linear, Supabase, OpenAI standards
 */

import { ComponentFile } from './scanner.js';
import { getAllMappings, findMapping, COMPONENT_PATTERNS } from '../themes/modern-mappings.js';
import { ThemePreset, getThemePreset } from '../themes/presets.js';

export interface ProfessionalTransformationOptions {
  themePreset?: string;
  preserveOriginalClasses?: boolean;
  includeTransitions?: boolean;
  accessibilityMode?: boolean;
  optimizeForPerformance?: boolean;
  enforceContrast?: boolean;
}

export interface ProfessionalTransformationResult {
  originalContent: string;
  transformedContent: string;
  appliedMappings: Array<{
    from: string;
    to: string;
    category: string;
    line: number;
    context: string;
  }>;
  contrastWarnings: Array<{
    className: string;
    ratio: number;
    required: number;
    line: number;
  }>;
  accessibilityImprovements: Array<{
    type: 'aria-label' | 'focus-ring' | 'keyboard-nav' | 'screen-reader';
    suggestion: string;
    line: number;
  }>;
  qualityScore: number;
}

export class ProfessionalTransformer {
  private options: ProfessionalTransformationOptions;
  private themePreset?: ThemePreset;
  private mappings = getAllMappings();

  constructor(options: ProfessionalTransformationOptions = {}) {
    this.options = {
      preserveOriginalClasses: false,
      includeTransitions: true,
      accessibilityMode: true,
      optimizeForPerformance: true,
      enforceContrast: true,
      ...options
    };

    if (options.themePreset) {
      this.themePreset = getThemePreset(options.themePreset);
    }
  }

  async transformFile(file: ComponentFile): Promise<ProfessionalTransformationResult> {
    const lines = file.content?.split('\n') || [];
    const result: ProfessionalTransformationResult = {
      originalContent: file.content || '',
      transformedContent: '',
      appliedMappings: [],
      contrastWarnings: [],
      accessibilityImprovements: [],
      qualityScore: 0
    };

    let transformedLines = [...lines];

    // 1. Apply professional color mappings
    transformedLines = this.applyColorMappings(transformedLines, result);

    // 2. Add transitions if enabled
    if (this.options.includeTransitions) {
      transformedLines = this.addTransitions(transformedLines, result);
    }

    // 3. Enhance accessibility if enabled
    if (this.options.accessibilityMode) {
      transformedLines = this.enhanceAccessibility(transformedLines, result);
    }

    // 4. Apply component patterns
    transformedLines = this.applyComponentPatterns(transformedLines, result);

    // 5. Validate contrast ratios
    if (this.options.enforceContrast) {
      this.validateContrast(transformedLines, result);
    }

    // 6. Calculate quality score
    result.qualityScore = this.calculateQualityScore(result);

    result.transformedContent = transformedLines.join('\n');
    return result;
  }

  private applyColorMappings(lines: string[], result: ProfessionalTransformationResult): string[] {
    return lines.map((line, lineIndex) => {
      let transformedLine = line;
      
      // Find className attributes
      const classRegex = /className\s*=\s*["'`]([^"'`]+)["'`]/g;
      let match;

      while ((match = classRegex.exec(line)) !== null) {
        const classString = match[1];
        const classes = classString.split(/\s+/);
        
        let transformedClasses = classes.map(className => {
          const mapping = findMapping(className);
          if (mapping) {
            result.appliedMappings.push({
              from: mapping.from,
              to: mapping.to,
              category: mapping.category,
              line: lineIndex + 1,
              context: line.trim()
            });

            return mapping.to;
          }
          return className;
        });

        // Apply theme-specific customizations
        if (this.themePreset) {
          transformedClasses = this.applyThemePresetCustomizations(transformedClasses);
        }

        const newClassString = transformedClasses.join(' ');
        transformedLine = transformedLine.replace(match[0], `className="${newClassString}"`);
      }

      return transformedLine;
    });
  }

  private applyThemePresetCustomizations(classes: string[]): string[] {
    if (!this.themePreset) return classes;

    // Apply theme-specific color replacements
    return classes.map(className => {
      // Replace generic colors with theme-specific ones
      if (className.includes('blue-') && this.themePreset) {
        switch (this.themePreset.id) {
          case 'linear':
            return className.replace('blue-', 'purple-');
          case 'supabase':
            return className.replace('blue-', 'green-');
          case 'openai':
            return className.replace('blue-', 'teal-');
          default:
            return className;
        }
      }
      return className;
    });
  }

  private addTransitions(lines: string[], result: ProfessionalTransformationResult): string[] {
    const transitionClasses = 'transition-colors duration-200 ease-out';
    
    return lines.map(line => {
      // Add transitions to interactive elements
      if (line.includes('hover:') || line.includes('focus:') || line.includes('active:')) {
        if (!line.includes('transition')) {
          return line.replace(
            /className\s*=\s*["'`]([^"'`]+)["'`]/,
            (match, classString) => `className="${classString} ${transitionClasses}"`
          );
        }
      }
      return line;
    });
  }

  private enhanceAccessibility(lines: string[], result: ProfessionalTransformationResult): string[] {
    return lines.map((line, lineIndex) => {
      let enhancedLine = line;

      // Add aria-labels to buttons without them
      if (line.includes('<button') && !line.includes('aria-label')) {
        result.accessibilityImprovements.push({
          type: 'aria-label',
          suggestion: 'Add aria-label for screen readers',
          line: lineIndex + 1
        });
      }

      // Add focus rings to interactive elements
      if ((line.includes('hover:') || line.includes('cursor-pointer')) && !line.includes('focus:ring')) {
        enhancedLine = enhancedLine.replace(
          /className\s*=\s*["'`]([^"'`]+)["'`]/,
          (match, classString) => `className="${classString} focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2"`
        );
        
        result.accessibilityImprovements.push({
          type: 'focus-ring',
          suggestion: 'Added focus ring for keyboard navigation',
          line: lineIndex + 1
        });
      }

      return enhancedLine;
    });
  }

  private applyComponentPatterns(lines: string[], result: ProfessionalTransformationResult): string[] {
    return lines.map(line => {
      // Detect common patterns and apply professional styling
      
      // Card pattern detection
      if (line.includes('bg-white') && line.includes('border') && line.includes('shadow')) {
        const cardPattern = COMPONENT_PATTERNS.card.dark;
        return line.replace(
          /className\s*=\s*["'`]([^"'`]+)["'`]/,
          (match, classString) => {
            // Smart merge with existing classes
            const existingClasses = classString.split(' ');
            const patternClasses = cardPattern.split(' ');
            const mergedClasses = [...new Set([...existingClasses, ...patternClasses])];
            return `className="${mergedClasses.join(' ')}"`;
          }
        );
      }

      return line;
    });
  }

  private validateContrast(lines: string[], result: ProfessionalTransformationResult): void {
    lines.forEach((line, lineIndex) => {
      // Simplified contrast validation - in real implementation would use proper color calculations
      const hasLowContrast = line.includes('text-gray-400') && line.includes('bg-white');
      
      if (hasLowContrast) {
        result.contrastWarnings.push({
          className: 'text-gray-400 on bg-white',
          ratio: 2.9,
          required: 4.5,
          line: lineIndex + 1
        });
      }
    });
  }

  private calculateQualityScore(result: ProfessionalTransformationResult): number {
    let score = 100;

    // Deduct points for contrast warnings
    score -= result.contrastWarnings.length * 10;

    // Add points for mappings applied
    score += Math.min(result.appliedMappings.length * 2, 20);

    // Add points for accessibility improvements
    score += result.accessibilityImprovements.length * 5;

    return Math.max(0, Math.min(100, score));
  }
}

// Convenience function for backward compatibility
export async function professionalTransformFile(
  file: ComponentFile, 
  options: ProfessionalTransformationOptions = {}
): Promise<ProfessionalTransformationResult> {
  const transformer = new ProfessionalTransformer(options);
  return transformer.transformFile(file);
}

// Enhanced transform multiple files
export async function professionalTransformFiles(
  files: ComponentFile[], 
  options: ProfessionalTransformationOptions = {}
): Promise<{
  results: ProfessionalTransformationResult[];
  summary: {
    totalFiles: number;
    totalMappings: number;
    averageQualityScore: number;
    contrastIssues: number;
    accessibilityImprovements: number;
  };
}> {
  const transformer = new ProfessionalTransformer(options);
  const results = await Promise.all(
    files.map(file => transformer.transformFile(file))
  );

  const summary = {
    totalFiles: results.length,
    totalMappings: results.reduce((sum, r) => sum + r.appliedMappings.length, 0),
    averageQualityScore: Math.round(
      results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length
    ),
    contrastIssues: results.reduce((sum, r) => sum + r.contrastWarnings.length, 0),
    accessibilityImprovements: results.reduce((sum, r) => sum + r.accessibilityImprovements.length, 0)
  };

  return { results, summary };
}
