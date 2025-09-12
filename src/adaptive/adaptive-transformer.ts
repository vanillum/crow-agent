/**
 * Adaptive Transformer Integration Layer
 * Main integration point that enhances existing crow-agent functionality
 * Works as a middleware layer - existing functionality remains unchanged
 */

import { AdaptiveColorAnalyzer, ColorAnalysisResult } from './color-analyzer.js';
import { PatternClassifier, DesignSystemAnalysis } from './pattern-classifier.js';
import * as wcag from 'wcag-contrast';

export interface AdaptiveOptions {
  adaptive?: boolean;
  archetype?: 'corporate' | 'modern' | 'developer' | 'creative';
  brandColor?: string;
  validate?: boolean;
}

export interface ThemeValidation {
  accessibility: {
    contrastRatios: Record<string, number>;
    colorBlindness: boolean;
    score: number;
  };
  brandConsistency: {
    preservesBrand: boolean;
    score: number;
  };
  patternMaintenance: {
    maintainsHierarchy: boolean;
    score: number;
  };
}

export interface ValidationResult {
  score: number;
  validation: ThemeValidation;
  recommendations: string[];
  passed: boolean;
}

/**
 * Main integration point that enhances existing crow-agent functionality
 * Works as a middleware layer - existing functionality remains unchanged
 */
export class AdaptiveTransformer {
  private colorAnalyzer: AdaptiveColorAnalyzer;
  private patternClassifier: PatternClassifier;

  constructor() {
    this.colorAnalyzer = new AdaptiveColorAnalyzer();
    this.patternClassifier = new PatternClassifier();
  }

  /**
   * Enhance existing crow-agent analysis with adaptive intelligence
   * @param existingAnalysis - Output from current crow-agent analyzer
   * @param options - User options from CLI
   */
  async enhanceAnalysis(existingAnalysis: any, options: AdaptiveOptions = {}): Promise<any> {
    // Don't modify existing analysis if adaptive mode not requested
    if (!options.adaptive) {
      return existingAnalysis;
    }

    console.log('🧠 Applying adaptive intelligence...');

    // Extract colors from existing analysis for enhancement
    const existingColors = this.extractColorsFromAnalysis(existingAnalysis);

    // Enhance color analysis
    const enhancedColors = this.colorAnalyzer.enhanceColorAnalysis(
      existingColors,
      existingAnalysis
    );

    // Enhance pattern recognition  
    const enhancedAnalysis = this.patternClassifier.enhanceProjectAnalysis({
      ...existingAnalysis,
      colors: enhancedColors
    });

    // Override archetype if user specified
    if (options.archetype) {
      enhancedAnalysis.designSystem.archetype = options.archetype;
      enhancedAnalysis.designSystem.recommendations = 
        this.patternClassifier.getArchetypeRecommendations(options.archetype);
    }

    // Override brand color if user specified
    if (options.brandColor) {
      try {
        enhancedAnalysis.colors.brand.primary = {
          original: options.brandColor,
          chroma: (globalThis as any).chroma(options.brandColor),
          // Add other required properties...
        };
      } catch (error) {
        console.warn(`⚠️ Invalid brand color: ${options.brandColor}`);
      }
    }

    return enhancedAnalysis;
  }

  /**
   * Generate enhanced transformation mappings
   * Integrates with existing crow-agent transformation system
   */
  generateEnhancedMappings(enhancedAnalysis: any, existingMappings: Record<string, string>): Record<string, string> {
    const archetype = enhancedAnalysis.designSystem?.archetype || 'modern';
    
    // Get adaptive mappings
    const adaptiveMappings = enhancedAnalysis.colors?.adaptiveMappings || {};
    
    // Merge with existing mappings (existing takes precedence for conflicts)
    return {
      ...adaptiveMappings,
      ...existingMappings // Existing mappings override adaptive ones
    };
  }

  /**
   * Validate and provide feedback on generated theme
   */
  validateTheme(generatedTheme: Record<string, string>, enhancedAnalysis: any): ValidationResult {
    const validation: ThemeValidation = {
      accessibility: this.validateAccessibility(generatedTheme),
      brandConsistency: this.validateBrandConsistency(generatedTheme, enhancedAnalysis),
      patternMaintenance: this.validatePatterns(generatedTheme, enhancedAnalysis)
    };

    const overallScore = this.calculateOverallScore(validation);

    return {
      score: overallScore,
      validation,
      recommendations: this.generateRecommendations(validation),
      passed: overallScore >= 0.8
    };
  }

  private extractColorsFromAnalysis(analysis: any): string[] {
    // Extract colors from various places in the existing analysis
    const colors: string[] = [];
    
    // From component files
    if (analysis.componentFiles) {
      analysis.componentFiles.forEach((file: any) => {
        if (file.content) {
          // Extract hex colors and CSS color names
          const colorMatches = file.content.match(/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|hsl\([^)]+\)/g);
          if (colorMatches) {
            colors.push(...colorMatches);
          }
        }
      });
    }
    
    // From Tailwind classes (extract brand colors)
    const brandColorClasses = ['blue', 'red', 'green', 'purple', 'yellow', 'pink', 'indigo', 'cyan', 'teal', 'orange'];
    brandColorClasses.forEach(color => {
      colors.push(`#3b82f6`); // Default blue as example
    });
    
    return [...new Set(colors)]; // Remove duplicates
  }

  private validateAccessibility(theme: Record<string, string>): ThemeValidation['accessibility'] {
    // Implement WCAG validation using existing color analysis
    const contrastRatios: Record<string, number> = {};
    
    // Check common color combinations
    try {
      // This is a simplified implementation - would need proper color extraction
      contrastRatios['background-text'] = 4.5; // Placeholder
      contrastRatios['button-text'] = 3.0; // Placeholder
      
      const avgContrast = Object.values(contrastRatios).reduce((a, b) => a + b, 0) / Object.values(contrastRatios).length;
      
      return {
        contrastRatios,
        colorBlindness: true, // Placeholder - would implement actual color blindness testing
        score: avgContrast >= 4.5 ? 0.9 : (avgContrast >= 3.0 ? 0.7 : 0.4)
      };
    } catch {
      return {
        contrastRatios: {},
        colorBlindness: false,
        score: 0.5
      };
    }
  }

  private validateBrandConsistency(theme: Record<string, string>, enhancedAnalysis: any): ThemeValidation['brandConsistency'] {
    const brandColors = enhancedAnalysis.colors?.brand;
    
    if (!brandColors?.primary) {
      return { preservesBrand: true, score: 1.0 }; // No brand to preserve
    }
    
    // Check if brand colors are maintained in the theme
    const brandPreserved = Object.values(theme).some(mapping => 
      mapping.includes(brandColors.primary.original)
    );
    
    return {
      preservesBrand: brandPreserved,
      score: brandPreserved ? 0.9 : 0.6
    };
  }

  private validatePatterns(theme: Record<string, string>, enhancedAnalysis: any): ThemeValidation['patternMaintenance'] {
    // Validate that visual hierarchy is maintained
    const archetype = enhancedAnalysis.designSystem?.archetype;
    
    // Different archetypes have different hierarchy requirements
    const maintainsHierarchy = archetype !== 'creative'; // Creative allows more flexibility
    
    return {
      maintainsHierarchy,
      score: maintainsHierarchy ? 0.85 : 0.75
    };
  }

  private calculateOverallScore(validation: ThemeValidation): number {
    const weights = {
      accessibility: 0.5,
      brandConsistency: 0.3,
      patternMaintenance: 0.2
    };
    
    return (
      validation.accessibility.score * weights.accessibility +
      validation.brandConsistency.score * weights.brandConsistency +
      validation.patternMaintenance.score * weights.patternMaintenance
    );
  }

  private generateRecommendations(validation: ThemeValidation): string[] {
    const recommendations: string[] = [];
    
    if (validation.accessibility.score < 0.8) {
      recommendations.push('Consider increasing contrast ratios for better accessibility');
    }
    
    if (!validation.brandConsistency.preservesBrand) {
      recommendations.push('Brand colors may not be well preserved in dark mode');
    }
    
    if (!validation.patternMaintenance.maintainsHierarchy) {
      recommendations.push('Visual hierarchy could be better maintained');
    }
    
    return recommendations;
  }
}
