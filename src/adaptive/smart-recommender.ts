/**
 * Smart Theme Recommendation System
 * Analyzes brand colors and project context to recommend optimal themes
 */

import chroma from 'chroma-js';
import { BrandExtractor, BrandColorProfile } from './brand-extractor.js';
import { PatternClassifier } from './pattern-classifier.js';
import { getAllThemePresets, ThemePreset } from '../themes/presets.js';

export interface ThemeScore {
  themeId: string;
  themeName: string;
  score: number;
  reasoning: string[];
  brandMatch: number;
  archetypeMatch: number;
  accessibilityScore: number;
}

export interface SmartRecommendation {
  recommended: ThemeScore;
  alternatives: ThemeScore[];
  brandProfile: BrandColorProfile;
  archetype: string;
  confidence: number;
  reasoning: string[];
}

export class SmartThemeRecommender {
  private brandExtractor: BrandExtractor;
  private patternClassifier: PatternClassifier;

  constructor() {
    this.brandExtractor = new BrandExtractor();
    this.patternClassifier = new PatternClassifier();
  }

  /**
   * Generate smart theme recommendation based on project analysis
   */
  async recommendTheme(projectPath: string, existingAnalysis: any): Promise<SmartRecommendation> {
    console.log('🧠 Analyzing project for perfect theme match...');
    
    // Extract brand colors
    const brandProfile = await this.brandExtractor.extractBrandColors(projectPath);
    
    // Get archetype
    const enhancedAnalysis = this.patternClassifier.enhanceProjectAnalysis(existingAnalysis);
    const archetype = enhancedAnalysis.designSystem.archetype;
    
    // Score all available themes
    const themes = getAllThemePresets();
    const scores = themes.map(theme => this.scoreTheme(theme, brandProfile, archetype));
    
    // Sort by score
    scores.sort((a, b) => b.score - a.score);
    
    return {
      recommended: scores[0],
      alternatives: scores.slice(1, 4),
      brandProfile,
      archetype,
      confidence: scores[0].score,
      reasoning: this.generateOverallReasoning(scores[0], brandProfile, archetype)
    };
  }

  private scoreTheme(theme: ThemePreset, brandProfile: BrandColorProfile, archetype: string): ThemeScore {
    const brandMatch = this.scoreBrandCompatibility(theme, brandProfile);
    const archetypeMatch = this.scoreArchetypeCompatibility(theme, archetype);
    const accessibilityScore = this.scoreAccessibility(theme);
    
    // Weighted scoring
    const score = (
      brandMatch * 0.4 +           // 40% brand compatibility
      archetypeMatch * 0.35 +      // 35% archetype fit
      accessibilityScore * 0.25    // 25% accessibility
    );
    
    return {
      themeId: theme.id,
      themeName: theme.name,
      score,
      reasoning: this.generateReasoningForTheme(theme, brandMatch, archetypeMatch, accessibilityScore),
      brandMatch,
      archetypeMatch,
      accessibilityScore
    };
  }

  private scoreBrandCompatibility(theme: ThemePreset, brandProfile: BrandColorProfile): number {
    if (!brandProfile.primary) return 0.7; // No brand colors detected, neutral score
    
    const primaryColor = brandProfile.primary.color;
    const primaryHue = chroma(primaryColor).get('hsl.h') || 0;
    
    // Theme-specific brand compatibility scoring
    switch (theme.id) {
      case 'v0':
        // v0 is purely monochromatic, doesn't work well with brand colors
        return brandProfile.primary.saturation < 0.3 ? 0.9 : 0.4;
        
      case 'linear':
        // Linear works great with purple/blue brands (270-300° hue range)
        if (primaryHue >= 240 && primaryHue <= 300) return 0.95;
        if (primaryHue >= 200 && primaryHue <= 340) return 0.8;
        return 0.6;
        
      case 'supabase':
        // Supabase is optimized for green brands (120-160° hue range)
        if (primaryHue >= 120 && primaryHue <= 160) return 0.95;
        if (primaryHue >= 100 && primaryHue <= 180) return 0.8;
        return 0.5; // Poor match for non-green brands
        
      case 'openai':
        // OpenAI works well with blue/teal brands (180-240° hue range)
        if (primaryHue >= 180 && primaryHue <= 240) return 0.95;
        if (primaryHue >= 160 && primaryHue <= 260) return 0.8;
        return 0.7;
        
      default:
        return 0.5;
    }
  }

  private scoreArchetypeCompatibility(theme: ThemePreset, archetype: string): number {
    // Theme-archetype compatibility matrix
    const compatibility: Record<string, Record<string, number>> = {
      'v0': {
        'corporate': 0.95, // Perfect for minimal corporate
        'modern': 0.8,     // Good for clean modern
        'developer': 0.6,  // Too minimal for dev tools
        'creative': 0.3    // Too restrictive for creative
      },
      'linear': {
        'corporate': 0.7,  // Sophisticated but maybe too advanced
        'modern': 0.95,    // Perfect for modern SaaS
        'developer': 0.9,  // Great for dev tools
        'creative': 0.8    // Good for creative with structure
      },
      'supabase': {
        'corporate': 0.8,  // Professional and clean
        'modern': 0.85,    // Good for modern apps
        'developer': 0.9,  // Excellent for dev tools
        'creative': 0.7    // Decent for creative
      },
      'openai': {
        'corporate': 0.75, // Professional but distinctive
        'modern': 0.9,     // Great for AI/tech
        'developer': 0.95, // Perfect for dev tools
        'creative': 0.6    // Less flexible for creative
      }
    };
    
    return compatibility[theme.id]?.[archetype] || 0.5;
  }

  private scoreAccessibility(theme: ThemePreset): number {
    // Simplified accessibility scoring based on color contrast
    try {
      const lightBg = chroma(theme.colors.light.background);
      const lightText = chroma(theme.colors.light.foreground);
      const darkBg = chroma(theme.colors.dark.background);
      const darkText = chroma(theme.colors.dark.foreground);
      
      const lightContrast = chroma.contrast(lightBg, lightText);
      const darkContrast = chroma.contrast(darkBg, darkText);
      
      // WCAG AA requires 4.5:1 for normal text
      const lightScore = Math.min(lightContrast / 4.5, 1.0);
      const darkScore = Math.min(darkContrast / 4.5, 1.0);
      
      return (lightScore + darkScore) / 2;
    } catch {
      return 0.7; // Default score if calculation fails
    }
  }

  private generateReasoningForTheme(theme: ThemePreset, brandMatch: number, archetypeMatch: number, accessibilityScore: number): string[] {
    const reasoning: string[] = [];
    
    if (brandMatch > 0.8) {
      reasoning.push('Excellent brand color preservation');
    } else if (brandMatch > 0.6) {
      reasoning.push('Good brand color compatibility');
    } else {
      reasoning.push('Limited brand color support');
    }
    
    if (archetypeMatch > 0.8) {
      reasoning.push('Perfect archetype alignment');
    } else if (archetypeMatch > 0.6) {
      reasoning.push('Good design pattern fit');
    } else {
      reasoning.push('Moderate archetype compatibility');
    }
    
    if (accessibilityScore > 0.9) {
      reasoning.push('Excellent accessibility (WCAG AA+)');
    } else if (accessibilityScore > 0.7) {
      reasoning.push('Good accessibility compliance');
    } else {
      reasoning.push('Meets basic accessibility standards');
    }
    
    return reasoning;
  }

  private generateOverallReasoning(bestTheme: ThemeScore, brandProfile: BrandColorProfile, archetype: string): string[] {
    const reasoning: string[] = [];
    
    if (brandProfile.primary) {
      reasoning.push(`Detected primary brand color: ${brandProfile.primary.color}`);
      reasoning.push(`Brand color usage: ${brandProfile.primary.usage} occurrences`);
    }
    
    reasoning.push(`Project archetype: ${archetype}`);
    reasoning.push(`Recommended theme: ${bestTheme.themeName}`);
    reasoning.push(`Overall compatibility: ${(bestTheme.score * 100).toFixed(1)}%`);
    
    return reasoning;
  }

  /**
   * Quick brand color analysis for CLI display
   */
  async quickBrandAnalysis(projectPath: string): Promise<{
    hasStrongBrand: boolean;
    primaryColor?: string;
    colorCount: number;
    temperature: 'warm' | 'cool' | 'neutral';
  }> {
    const brandProfile = await this.brandExtractor.extractBrandColors(projectPath);
    
    return {
      hasStrongBrand: brandProfile.confidence > 0.6,
      primaryColor: brandProfile.primary?.color,
      colorCount: brandProfile.palette.length,
      temperature: brandProfile.temperature
    };
  }
}
