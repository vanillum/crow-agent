/**
 * Adaptive Color Analysis System
 * Enhances existing color analysis with brand intelligence
 * Works alongside current crow-agent color mapping system
 */

import chroma from 'chroma-js';
import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import * as wcag from 'wcag-contrast';

extend([namesPlugin]);

export interface ProcessedColor {
  original: string;
  chroma: chroma.Color;
  colord: any;
  hsl: [number, number, number];
  lab: [number, number, number];
  luminance: number;
  saturation: number;
}

export interface BrandColors {
  primary: ProcessedColor | null;
  secondary: ProcessedColor | null;
  palette: ProcessedColor[];
}

export interface ColorAnalysisResult {
  originalAnalysis: string[];
  brand: BrandColors;
  neutrals: ProcessedColor[];
  temperature: 'warm' | 'cool' | 'neutral';
  archetype: string;
  adaptiveMappings: Record<string, string>;
}

/**
 * Enhances existing color analysis with brand intelligence
 * Works alongside current crow-agent color mapping system
 */
export class AdaptiveColorAnalyzer {
  private brandThreshold: number = 0.3; // Saturation threshold for brand colors

  /**
   * Analyze colors found in existing crow-agent CSS analysis
   * @param existingColors - Colors from current crow analysis
   * @param projectContext - Context from existing analysis
   */
  enhanceColorAnalysis(existingColors: string[], projectContext: any): ColorAnalysisResult {
    const processedColors = this.processColors(existingColors);
    
    return {
      // Keep existing structure, add intelligence
      originalAnalysis: existingColors,
      brand: this.detectBrandColors(processedColors),
      neutrals: this.categorizeNeutrals(processedColors),
      temperature: this.analyzeTemperature(processedColors),
      archetype: this.suggestArchetype(processedColors, projectContext),
      adaptiveMappings: this.generateAdaptiveMappings(processedColors)
    };
  }

  private processColors(colorStrings: string[]): ProcessedColor[] {
    return colorStrings.map(color => {
      try {
        const chromaColor = chroma(color);
        const hsl = chromaColor.hsl();
        const lab = chromaColor.lab();
        return {
          original: color,
          chroma: chromaColor,
          colord: colord(color),
          hsl: [hsl[0] || 0, hsl[1] || 0, hsl[2] || 0] as [number, number, number],
          lab: [lab[0] || 0, lab[1] || 0, lab[2] || 0] as [number, number, number],
          luminance: chromaColor.luminance(),
          saturation: chromaColor.get('hsl.s')
        };
      } catch {
        return null;
      }
    }).filter((c): c is ProcessedColor => c !== null);
  }

  private detectBrandColors(processedColors: ProcessedColor[]): BrandColors {
    // Find most saturated, non-gray colors
    const brandCandidates = processedColors
      .filter(c => c.saturation > this.brandThreshold)
      .sort((a, b) => b.saturation - a.saturation);

    return {
      primary: brandCandidates[0] || null,
      secondary: brandCandidates[1] || null,
      palette: brandCandidates.slice(0, 5)
    };
  }

  private categorizeNeutrals(processedColors: ProcessedColor[]): ProcessedColor[] {
    return processedColors.filter(c => c.saturation <= this.brandThreshold);
  }

  private analyzeTemperature(processedColors: ProcessedColor[]): 'warm' | 'cool' | 'neutral' {
    const temperatures = processedColors.map(c => {
      const hue = c.hsl[0] || 0;
      if (hue >= 0 && hue <= 60) return 'warm';   // Red-Yellow
      if (hue >= 240 && hue <= 360) return 'warm'; // Red-Magenta
      if (hue >= 120 && hue <= 240) return 'cool';  // Green-Blue
      return 'neutral';
    });

    const counts = temperatures.reduce((acc, temp) => {
      acc[temp] = (acc[temp] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominant = Object.keys(counts).reduce((a, b) => 
      counts[a] > counts[b] ? a : b
    );

    return dominant as 'warm' | 'cool' | 'neutral';
  }

  private suggestArchetype(processedColors: ProcessedColor[], projectContext: any): string {
    // Simple archetype suggestion based on color complexity
    const brandColors = this.detectBrandColors(processedColors);
    const colorCount = processedColors.length;
    const brandStrength = brandColors.palette.length;

    if (brandStrength === 0 && colorCount < 5) return 'corporate';
    if (brandStrength > 0 && brandStrength <= 2) return 'modern';
    if (brandStrength > 2) return 'creative';
    return 'developer';
  }

  /**
   * Generate enhanced dark mode mappings based on brand analysis
   * Integrates with existing crow-agent transformation system
   */
  private generateAdaptiveMappings(processedColors: ProcessedColor[]): Record<string, string> {
    const brand = this.detectBrandColors(processedColors);
    
    if (!brand.primary) {
      // Fallback to existing crow-agent mappings
      return this.getDefaultMappings();
    }

    return this.createBrandAwareMappings(brand);
  }

  private createBrandAwareMappings(brand: BrandColors): Record<string, string> {
    if (!brand.primary) return this.getDefaultMappings();
    
    const primaryColor = brand.primary.chroma;
    
    // Generate brand-influenced neutral palette
    const brandInfluencedNeutrals = this.generateBrandNeutrals(primaryColor);
    
    return {
      // Enhanced mappings that work with existing system
      'bg-white': `bg-[${brandInfluencedNeutrals.bg1}] dark:bg-[${brandInfluencedNeutrals.darkBg1}]`,
      'bg-gray-50': `bg-[${brandInfluencedNeutrals.bg2}] dark:bg-[${brandInfluencedNeutrals.darkBg2}]`,
      'bg-gray-100': `bg-[${brandInfluencedNeutrals.bg3}] dark:bg-[${brandInfluencedNeutrals.darkBg3}]`,
      'text-gray-900': `text-[${brandInfluencedNeutrals.text1}] dark:text-[${brandInfluencedNeutrals.darkText1}]`,
      'text-gray-600': `text-[${brandInfluencedNeutrals.text2}] dark:text-[${brandInfluencedNeutrals.darkText2}]`,
      'border-gray-200': `border-[${brandInfluencedNeutrals.border}] dark:border-[${brandInfluencedNeutrals.darkBorder}]`,
      
      // Brand color preservation
      [`bg-[${brand.primary.original}]`]: `bg-[${brand.primary.original}] dark:bg-[${this.adaptBrandForDark(primaryColor)}]`,
      [`text-[${brand.primary.original}]`]: `text-[${brand.primary.original}] dark:text-[${this.adaptBrandForDark(primaryColor)}]`,
    };
  }

  private generateBrandNeutrals(brandColor: chroma.Color) {
    // Blend brand color subtly into neutral palette
    const baseGray = chroma('#0a0a0a');
    const blendStrength = 0.05; // Very subtle brand influence
    
    return {
      bg1: '#ffffff',
      bg2: chroma.mix('#f9f9f9', brandColor, blendStrength).hex(),
      bg3: chroma.mix('#f3f3f3', brandColor, blendStrength).hex(),
      text1: '#0a0a0a',
      text2: '#424242',
      border: chroma.mix('#e5e5e5', brandColor, blendStrength * 2).hex(),
      
      // Dark variants
      darkBg1: chroma.mix(baseGray, brandColor, blendStrength).hex(),
      darkBg2: chroma.mix('#111111', brandColor, blendStrength).hex(),
      darkBg3: chroma.mix('#1a1a1a', brandColor, blendStrength).hex(),
      darkText1: '#ffffff',
      darkText2: '#a1a1aa',
      darkBorder: chroma.mix('#27272a', brandColor, blendStrength * 2).hex()
    };
  }

  private adaptBrandForDark(brandColor: chroma.Color): string {
    // Adapt brand color for dark mode by increasing luminance
    const hsl = brandColor.hsl();
    const darkerBrand = chroma.hsl(hsl[0], hsl[1] * 0.8, Math.max(hsl[2] * 1.3, 0.6));
    return darkerBrand.hex();
  }

  private getDefaultMappings(): Record<string, string> {
    // Return existing crow-agent mappings as fallback
    return {
      'bg-white': 'bg-white dark:bg-gray-900',
      'bg-gray-50': 'bg-gray-50 dark:bg-gray-800',
      'bg-gray-100': 'bg-gray-100 dark:bg-gray-800',
      'text-gray-900': 'text-gray-900 dark:text-gray-100',
      'text-gray-700': 'text-gray-700 dark:text-gray-300',
      'border-gray-200': 'border-gray-200 dark:border-gray-700'
    };
  }
}
