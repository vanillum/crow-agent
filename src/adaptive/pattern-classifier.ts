/**
 * Design Pattern Recognition System
 * Enhances existing project analysis with design pattern intelligence
 * Works with existing crow-agent framework detection
 */

import natural from 'natural';
import kmeans from 'ml-kmeans';
import chroma from 'chroma-js';

export interface DesignFeatures {
  framework: string;
  componentCount: number;
  colorComplexity: number;
  spacingPatterns: number;
  typographyVariance: number;
  componentComplexity: number;
}

export interface ArchetypeRecommendations {
  darkModeStrategy: string;
  backgroundApproach: string;
  colorTreatment: string;
  contrastLevel: string;
}

export interface DesignSystemAnalysis {
  archetype: string;
  confidence: number;
  features: DesignFeatures;
  recommendations: ArchetypeRecommendations;
}

/**
 * Enhances existing project analysis with design pattern intelligence
 * Works with existing crow-agent framework detection
 */
export class PatternClassifier {
  private archetypes: string[] = ['corporate', 'modern', 'developer', 'creative'];

  /**
   * Enhance existing crow-agent analysis with archetype detection
   * @param existingAnalysis - Current crow-agent project analysis
   */
  enhanceProjectAnalysis(existingAnalysis: any): any {
    const features = this.extractDesignFeatures(existingAnalysis);
    const archetype = this.classifyArchetype(features);
    
    return {
      // Preserve existing analysis
      ...existingAnalysis,
      
      // Add design intelligence
      designSystem: {
        archetype,
        confidence: this.calculateConfidence(features, archetype),
        features,
        recommendations: this.getArchetypeRecommendations(archetype)
      }
    };
  }

  private extractDesignFeatures(analysis: any): DesignFeatures {
    // Safely extract color data
    const colorData = analysis.colors;
    const colors = Array.isArray(colorData) ? colorData : 
                   (colorData?.originalAnalysis ? colorData.originalAnalysis : []);
    
    return {
      // From existing analysis
      framework: analysis.framework || 'unknown',
      componentCount: analysis.componentFiles?.length || 0,
      
      // New feature extraction
      colorComplexity: this.analyzeColorComplexity(colors),
      spacingPatterns: this.analyzeSpacingPatterns(analysis.classes || []),
      typographyVariance: this.analyzeTypography(analysis.classes || []),
      componentComplexity: this.analyzeComponentComplexity(analysis.componentFiles || [])
    };
  }

  private classifyArchetype(features: DesignFeatures): string {
    const scores = {
      corporate: this.scoreCorporate(features),
      modern: this.scoreModern(features),
      developer: this.scoreDeveloper(features),
      creative: this.scoreCreative(features)
    };

    return Object.keys(scores).reduce((a, b) => 
      scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b
    );
  }

  private scoreCorporate(features: DesignFeatures): number {
    let score = 0;
    
    // Corporate indicators
    if (features.colorComplexity < 0.3) score += 0.25; // Limited palette
    if (features.spacingPatterns > 0.7) score += 0.25;  // Consistent spacing
    if (features.typographyVariance < 0.4) score += 0.25; // Conservative typography
    if (features.componentComplexity < 0.5) score += 0.25; // Simple components
    
    return score;
  }

  private scoreModern(features: DesignFeatures): number {
    let score = 0;
    
    // Modern/tech indicators  
    if (features.colorComplexity >= 0.3 && features.colorComplexity <= 0.6) score += 0.25;
    if (features.spacingPatterns > 0.8) score += 0.25; // Very systematic
    if (features.framework === 'react' || features.framework === 'nextjs') score += 0.25;
    if (features.componentCount > 10) score += 0.25; // Component-heavy
    
    return score;
  }

  private scoreDeveloper(features: DesignFeatures): number {
    let score = 0;
    
    // Developer tool indicators
    if (features.colorComplexity > 0.6) score += 0.25; // Rich color usage
    if (features.componentComplexity > 0.6) score += 0.25; // Complex components
    if (features.framework === 'vue' || features.framework === 'nuxt') score += 0.1;
    
    // Look for dev-tool specific patterns
    score += this.scoreDevToolPatterns(features) * 0.4;
    
    return Math.min(score, 1.0);
  }

  private scoreCreative(features: DesignFeatures): number {
    let score = 0;
    
    // Creative indicators
    if (features.colorComplexity > 0.7) score += 0.3; // Rich color palette
    if (features.typographyVariance > 0.6) score += 0.3; // Varied typography
    if (features.componentComplexity > 0.5) score += 0.2; // Complex layouts
    if (features.componentCount > 15) score += 0.2; // Many components
    
    return score;
  }

  private scoreDevToolPatterns(features: DesignFeatures): number {
    // Look for patterns common in developer tools
    let score = 0;
    
    // High component count suggests complex interface
    if (features.componentCount > 20) score += 0.3;
    
    // Complex components suggest advanced functionality
    if (features.componentComplexity > 0.7) score += 0.4;
    
    // Rich color usage in developer tools
    if (features.colorComplexity > 0.5) score += 0.3;
    
    return Math.min(score, 1.0);
  }

  private calculateConfidence(features: DesignFeatures, archetype: string): number {
    const scores = {
      corporate: this.scoreCorporate(features),
      modern: this.scoreModern(features),
      developer: this.scoreDeveloper(features),
      creative: this.scoreCreative(features)
    };

    const selectedScore = scores[archetype as keyof typeof scores];
    const maxOtherScore = Math.max(...Object.entries(scores)
      .filter(([key]) => key !== archetype)
      .map(([, score]) => score));
    
    // Confidence is the difference between selected and best alternative
    return Math.min(selectedScore - maxOtherScore + 0.5, 1.0);
  }

  private analyzeColorComplexity(colors: string[]): number {
    if (colors.length === 0) return 0;
    
    // Analyze color diversity and saturation
    const uniqueHues = new Set();
    const saturations: number[] = [];
    
    colors.forEach(color => {
      try {
        const chromaColor = chroma(color);
        const hsl = chromaColor.hsl();
        if (!isNaN(hsl[0])) uniqueHues.add(Math.floor(hsl[0] / 30)); // Group by 30° segments
        saturations.push(hsl[1] || 0);
      } catch {
        // Ignore invalid colors
      }
    });
    
    const hueComplexity = uniqueHues.size / 12; // Normalize to 0-1
    const saturationVariance = this.calculateVariance(saturations);
    
    return Math.min((hueComplexity + saturationVariance) / 2, 1.0);
  }

  private analyzeSpacingPatterns(classes: string[]): number {
    // Analyze consistency of spacing classes
    const spacingClasses = classes.filter(cls => 
      /^(m|p|gap|space)[lrtbxy]?-\d+/.test(cls)
    );
    
    if (spacingClasses.length === 0) return 0;
    
    // Extract spacing values
    const spacingValues = spacingClasses.map(cls => {
      const match = cls.match(/-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });
    
    // Higher consistency = lower variance
    const variance = this.calculateVariance(spacingValues);
    return Math.max(1 - variance / 100, 0); // Normalize and invert
  }

  private analyzeTypography(classes: string[]): number {
    // Analyze typography variety
    const textClasses = classes.filter(cls => 
      /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)/.test(cls) ||
      /^font-(thin|light|normal|medium|semibold|bold|extrabold|black)/.test(cls)
    );
    
    if (textClasses.length === 0) return 0;
    
    const uniqueTypes = new Set(textClasses);
    return Math.min(uniqueTypes.size / 10, 1.0); // Normalize to 0-1
  }

  private analyzeComponentComplexity(componentFiles: any[]): number {
    if (componentFiles.length === 0) return 0;
    
    // Analyze average component size and complexity
    const complexities = componentFiles.map(file => {
      const content = file.content || '';
      const lines = content.split('\n').length;
      const jsxElements = (content.match(/<[^>]+>/g) || []).length;
      
      // Simple complexity metric
      return (lines + jsxElements) / 100; // Normalize
    });
    
    const avgComplexity = complexities.reduce((a, b) => a + b, 0) / complexities.length;
    return Math.min(avgComplexity, 1.0);
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  getArchetypeRecommendations(archetype: string): ArchetypeRecommendations {
    const recommendations: Record<string, ArchetypeRecommendations> = {
      corporate: {
        darkModeStrategy: 'conservative-professional',
        backgroundApproach: 'subtle-elevation',
        colorTreatment: 'brand-preservation',
        contrastLevel: 'high'
      },
      modern: {
        darkModeStrategy: 'systematic-scaling',
        backgroundApproach: 'layered-surfaces',
        colorTreatment: 'perceptual-uniform',
        contrastLevel: 'optimal'
      },
      developer: {
        darkModeStrategy: 'brand-centric',
        backgroundApproach: 'brand-influenced',
        colorTreatment: 'enhanced-vibrancy',
        contrastLevel: 'high'
      },
      creative: {
        darkModeStrategy: 'artistic-adaptation',
        backgroundApproach: 'creative-surfaces',
        colorTreatment: 'expressive-enhancement',
        contrastLevel: 'dynamic'
      }
    };

    return recommendations[archetype] || recommendations.modern;
  }
}
