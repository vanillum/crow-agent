/**
 * Brand Color Extraction System
 * Automatically detects and extracts brand colors from existing CSS, components, and assets
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import chroma from 'chroma-js';
import { colord } from 'colord';
import { glob } from 'fast-glob';

export interface ExtractedBrandColor {
  color: string;
  usage: number;
  locations: string[];
  saturation: number;
  luminance: number;
  type: 'primary' | 'secondary' | 'accent' | 'neutral';
}

export interface BrandColorProfile {
  primary: ExtractedBrandColor | null;
  secondary: ExtractedBrandColor | null;
  accent: ExtractedBrandColor | null;
  palette: ExtractedBrandColor[];
  temperature: 'warm' | 'cool' | 'neutral';
  confidence: number;
}

export class BrandExtractor {
  private minSaturation = 0.2;
  private minUsage = 2; // Minimum occurrences to consider a brand color

  /**
   * Extract brand colors from project files
   */
  async extractBrandColors(projectPath: string): Promise<BrandColorProfile> {
    console.log('🎨 Extracting brand colors from project...');
    
    const colorMap = new Map<string, { usage: number; locations: string[] }>();
    
    // Extract from component files
    await this.extractFromComponents(projectPath, colorMap);
    
    // Extract from CSS files
    await this.extractFromCSS(projectPath, colorMap);
    
    // Extract from config files (Tailwind custom colors)
    await this.extractFromConfigs(projectPath, colorMap);
    
    // Process and analyze colors
    const processedColors = this.processExtractedColors(colorMap);
    
    return this.createBrandProfile(processedColors);
  }

  private async extractFromComponents(projectPath: string, colorMap: Map<string, { usage: number; locations: string[] }>) {
    const componentFiles = await glob('src/**/*.{tsx,jsx,ts,js,vue}', { 
      cwd: projectPath,
      absolute: true 
    });

    for (const filePath of componentFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        this.extractColorsFromContent(content, filePath, colorMap);
      } catch (error) {
        // Ignore files that can't be read
      }
    }
  }

  private async extractFromCSS(projectPath: string, colorMap: Map<string, { usage: number; locations: string[] }>) {
    const cssFiles = await glob('**/*.{css,scss,sass}', { 
      cwd: projectPath,
      absolute: true,
      ignore: ['node_modules/**']
    });

    for (const filePath of cssFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        this.extractColorsFromContent(content, filePath, colorMap);
      } catch (error) {
        // Ignore files that can't be read
      }
    }
  }

  private async extractFromConfigs(projectPath: string, colorMap: Map<string, { usage: number; locations: string[] }>) {
    const configFiles = ['tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.cjs'];
    
    for (const configFile of configFiles) {
      const configPath = path.join(projectPath, configFile);
      try {
        const content = await fs.readFile(configPath, 'utf-8');
        this.extractColorsFromContent(content, configPath, colorMap);
      } catch (error) {
        // Config file doesn't exist, continue
      }
    }
  }

  private extractColorsFromContent(content: string, filePath: string, colorMap: Map<string, { usage: number; locations: string[] }>) {
    // Extract hex colors
    const hexColors = content.match(/#[0-9a-fA-F]{3,6}\b/g) || [];
    
    // Extract RGB colors
    const rgbColors = content.match(/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g) || [];
    
    // Extract HSL colors
    const hslColors = content.match(/hsl\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*\)/g) || [];
    
    // Extract Tailwind color classes (brand-specific)
    const tailwindBrandColors = content.match(/(?:bg|text|border)-(?:blue|red|green|purple|yellow|pink|indigo|cyan|teal|orange|emerald|violet|sky|rose)-\d+/g) || [];
    
    const allColors = [...hexColors, ...rgbColors, ...hslColors];
    
    // Process extracted colors
    allColors.forEach(color => {
      try {
        const normalizedColor = this.normalizeColor(color);
        if (this.isValidBrandColor(normalizedColor)) {
          const existing = colorMap.get(normalizedColor) || { usage: 0, locations: [] };
          existing.usage++;
          if (!existing.locations.includes(filePath)) {
            existing.locations.push(filePath);
          }
          colorMap.set(normalizedColor, existing);
        }
      } catch {
        // Ignore invalid colors
      }
    });
    
    // Process Tailwind brand colors
    tailwindBrandColors.forEach(colorClass => {
      const hexColor = this.tailwindClassToHex(colorClass);
      if (hexColor) {
        const existing = colorMap.get(hexColor) || { usage: 0, locations: [] };
        existing.usage++;
        if (!existing.locations.includes(filePath)) {
          existing.locations.push(filePath);
        }
        colorMap.set(hexColor, existing);
      }
    });
  }

  private normalizeColor(color: string): string {
    try {
      return chroma(color).hex();
    } catch {
      return color;
    }
  }

  private isValidBrandColor(color: string): boolean {
    try {
      const chromaColor = chroma(color);
      const saturation = chromaColor.get('hsl.s');
      const luminance = chromaColor.luminance();
      
      // Filter out colors that are too gray or too dark/light
      return saturation >= this.minSaturation && 
             luminance > 0.1 && 
             luminance < 0.9;
    } catch {
      return false;
    }
  }

  private tailwindClassToHex(colorClass: string): string | null {
    // Map common Tailwind colors to hex values for brand detection
    const colorMap: Record<string, string> = {
      'blue-500': '#3b82f6', 'blue-600': '#2563eb', 'blue-700': '#1d4ed8',
      'red-500': '#ef4444', 'red-600': '#dc2626', 'red-700': '#b91c1c',
      'green-500': '#10b981', 'green-600': '#059669', 'green-700': '#047857',
      'purple-500': '#8b5cf6', 'purple-600': '#7c3aed', 'purple-700': '#6d28d9',
      'yellow-500': '#eab308', 'yellow-600': '#ca8a04', 'yellow-700': '#a16207',
      'pink-500': '#ec4899', 'pink-600': '#db2777', 'pink-700': '#be185d',
      'indigo-500': '#6366f1', 'indigo-600': '#4f46e5', 'indigo-700': '#4338ca',
      'teal-500': '#14b8a6', 'teal-600': '#0d9488', 'teal-700': '#0f766e',
      'orange-500': '#f97316', 'orange-600': '#ea580c', 'orange-700': '#c2410c',
    };
    
    // Extract color and shade from class
    const match = colorClass.match(/(?:bg|text|border)-(\w+-\d+)/);
    return match ? (colorMap[match[1]] || null) : null;
  }

  private processExtractedColors(colorMap: Map<string, { usage: number; locations: string[] }>): ExtractedBrandColor[] {
    const colors: ExtractedBrandColor[] = [];
    
    for (const [color, data] of colorMap.entries()) {
      if (data.usage >= this.minUsage) {
        try {
          const chromaColor = chroma(color);
          colors.push({
            color,
            usage: data.usage,
            locations: data.locations,
            saturation: chromaColor.get('hsl.s'),
            luminance: chromaColor.luminance(),
            type: 'neutral' // Will be classified later
          });
        } catch {
          // Ignore invalid colors
        }
      }
    }
    
    // Sort by usage and saturation (brand colors used more and more saturated)
    return colors.sort((a, b) => 
      (b.usage * b.saturation) - (a.usage * a.saturation)
    );
  }

  private createBrandProfile(colors: ExtractedBrandColor[]): BrandColorProfile {
    const classified = this.classifyColors(colors);
    
    return {
      primary: classified.find(c => c.type === 'primary') || null,
      secondary: classified.find(c => c.type === 'secondary') || null,
      accent: classified.find(c => c.type === 'accent') || null,
      palette: classified,
      temperature: this.analyzeTemperature(classified),
      confidence: this.calculateConfidence(classified)
    };
  }

  private classifyColors(colors: ExtractedBrandColor[]): ExtractedBrandColor[] {
    if (colors.length === 0) return colors;
    
    // Classify the most used, most saturated color as primary
    colors[0].type = 'primary';
    
    // Classify secondary colors
    if (colors.length > 1) {
      colors[1].type = 'secondary';
    }
    
    // Classify accent colors (high saturation, lower usage)
    for (let i = 2; i < Math.min(colors.length, 5); i++) {
      if (colors[i].saturation > 0.6) {
        colors[i].type = 'accent';
      }
    }
    
    return colors;
  }

  private analyzeTemperature(colors: ExtractedBrandColor[]): 'warm' | 'cool' | 'neutral' {
    if (colors.length === 0) return 'neutral';
    
    const temperatures = colors.map(c => {
      try {
        const hue = chroma(c.color).get('hsl.h') || 0;
        if ((hue >= 0 && hue <= 60) || (hue >= 300 && hue <= 360)) return 'warm';
        if (hue >= 120 && hue <= 240) return 'cool';
        return 'neutral';
      } catch {
        return 'neutral';
      }
    });

    const counts = temperatures.reduce((acc, temp) => {
      acc[temp] = (acc[temp] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(counts).reduce((a, b) => 
      counts[a] > counts[b] ? a : b
    ) as 'warm' | 'cool' | 'neutral';
  }

  private calculateConfidence(colors: ExtractedBrandColor[]): number {
    if (colors.length === 0) return 0;
    
    const primaryColor = colors[0];
    if (!primaryColor) return 0;
    
    // Higher confidence for:
    // - More usage
    // - Higher saturation  
    // - Multiple locations
    const usageScore = Math.min(primaryColor.usage / 10, 1.0);
    const saturationScore = primaryColor.saturation;
    const diversityScore = Math.min(primaryColor.locations.length / 3, 1.0);
    
    return (usageScore + saturationScore + diversityScore) / 3;
  }
}
