/**
 * Project scanner for analyzing Tailwind CSS projects and detecting framework type
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'fast-glob';
import { analyzeClassTransformability } from './colors.js';

export type Framework = 'react' | 'vue' | 'html' | 'nextjs' | 'nuxt' | 'unknown';

export interface ProjectAnalysis {
  framework: Framework;
  hasPackageJson: boolean;
  hasTailwindConfig: boolean;
  tailwindConfigPath?: string;
  tailwindVersion: 'v3' | 'v4' | 'unknown';
  tailwindCssFile?: string;
  packageJsonPath?: string;
  componentFiles: ComponentFile[];
  darkModeEnabled: boolean;
  totalComponents: number;
  transformableComponents: number;
  estimatedChanges: number;
}

export interface ComponentFile {
  path: string;
  framework: Framework;
  hasClasses: boolean;
  transformableClasses: number;
  totalClasses: number;
  content?: string;
  analysis?: {
    transformable: string[];
    nonTransformable: string[];
    alreadyHasDark: string[];
  };
}

export interface TailwindConfig {
  darkMode?: string | string[];
  theme?: any;
  plugins?: any[];
}

/**
 * Analyze a project directory to understand its structure and framework
 */
export async function analyzeProject(projectPath: string): Promise<ProjectAnalysis> {
  const absolutePath = path.resolve(projectPath);
  
  // Check if directory exists
  try {
    await fs.access(absolutePath);
  } catch (error) {
    throw new Error(`Project directory does not exist: ${absolutePath}`);
  }

  // Detect framework
  const framework = await detectFramework(absolutePath);
  
  // Check for package.json and tailwind config
  const packageJsonPath = await findPackageJson(absolutePath);
  const tailwindConfigPath = await findTailwindConfig(absolutePath);
  
  // Detect Tailwind version and CSS file
  const { version: tailwindVersion, cssFile: tailwindCssFile } = await detectTailwindVersion(absolutePath);
  
  // Find component files
  const componentFiles = await findComponentFiles(absolutePath, framework);
  
  // Check if dark mode is already enabled
  const darkModeEnabled = await checkDarkModeEnabled(tailwindConfigPath, tailwindCssFile, tailwindVersion);
  
  // Analyze transformable content
  const transformableComponents = componentFiles.filter(f => f.transformableClasses > 0).length;
  const estimatedChanges = componentFiles.reduce((sum, f) => sum + f.transformableClasses, 0);

  return {
    framework,
    hasPackageJson: !!packageJsonPath,
    hasTailwindConfig: !!tailwindConfigPath,
    tailwindConfigPath,
    tailwindVersion,
    tailwindCssFile,
    packageJsonPath,
    componentFiles,
    darkModeEnabled,
    totalComponents: componentFiles.length,
    transformableComponents,
    estimatedChanges,
  };
}

/**
 * Detect the framework type based on project files
 */
async function detectFramework(projectPath: string): Promise<Framework> {
  try {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    // Check dependencies for framework indicators
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (dependencies['next'] || dependencies['@next/core']) {
      return 'nextjs';
    }
    
    if (dependencies['nuxt'] || dependencies['@nuxt/core']) {
      return 'nuxt';
    }
    
    if (dependencies['react'] || dependencies['@types/react']) {
      return 'react';
    }
    
    if (dependencies['vue'] || dependencies['@vue/core']) {
      return 'vue';
    }
  } catch (error) {
    // Package.json doesn't exist or can't be read, continue with file-based detection
  }

  // Check for framework-specific files
  const files = await glob(['**/*.{js,jsx,ts,tsx,vue,html}'], {
    cwd: projectPath,
    ignore: ['node_modules/**', 'dist/**', 'build/**', '.next/**', '.nuxt/**'],
    absolute: false,
  });

  const hasReactFiles = files.some(f => f.endsWith('.jsx') || f.endsWith('.tsx'));
  const hasVueFiles = files.some(f => f.endsWith('.vue'));
  const hasHtmlFiles = files.some(f => f.endsWith('.html'));
  
  // Check for Next.js specific files
  const hasNextConfig = await fileExists(path.join(projectPath, 'next.config.js')) ||
                        await fileExists(path.join(projectPath, 'next.config.ts'));
  if (hasNextConfig && hasReactFiles) {
    return 'nextjs';
  }
  
  // Check for Nuxt.js specific files
  const hasNuxtConfig = await fileExists(path.join(projectPath, 'nuxt.config.js')) ||
                        await fileExists(path.join(projectPath, 'nuxt.config.ts'));
  if (hasNuxtConfig && hasVueFiles) {
    return 'nuxt';
  }

  if (hasReactFiles) return 'react';
  if (hasVueFiles) return 'vue';
  if (hasHtmlFiles) return 'html';
  
  return 'unknown';
}

/**
 * Find package.json file
 */
async function findPackageJson(projectPath: string): Promise<string | undefined> {
  const packageJsonPath = path.join(projectPath, 'package.json');
  return await fileExists(packageJsonPath) ? packageJsonPath : undefined;
}

/**
 * Find tailwind.config.js file
 */
async function findTailwindConfig(projectPath: string): Promise<string | undefined> {
  const possiblePaths = [
    'tailwind.config.js',
    'tailwind.config.ts',
    'tailwind.config.cjs',
    'tailwind.config.mjs',
  ];

  for (const configPath of possiblePaths) {
    const fullPath = path.join(projectPath, configPath);
    if (await fileExists(fullPath)) {
      return fullPath;
    }
  }

  return undefined;
}

/**
 * Find component files that contain Tailwind classes
 */
async function findComponentFiles(projectPath: string, framework: Framework): Promise<ComponentFile[]> {
  let patterns: string[];
  
  switch (framework) {
    case 'react':
    case 'nextjs':
      patterns = ['**/*.{js,jsx,ts,tsx}'];
      break;
    case 'vue':
    case 'nuxt':
      patterns = ['**/*.vue'];
      break;
    case 'html':
      patterns = ['**/*.html'];
      break;
    default:
      patterns = ['**/*.{js,jsx,ts,tsx,vue,html}'];
  }

  const files = await glob(patterns, {
    cwd: projectPath,
    ignore: ['node_modules/**', 'dist/**', 'build/**', '.next/**', '.nuxt/**', 'coverage/**'],
    absolute: true,
  });

  const componentFiles: ComponentFile[] = [];

  for (const filePath of files) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const analysis = analyzeFileForTailwindClasses(content);
      
      if (analysis.totalClasses > 0) {
        componentFiles.push({
          path: filePath,
          framework,
          hasClasses: true,
          transformableClasses: analysis.transformable,
          totalClasses: analysis.totalClasses,
          content,
          analysis: analysis.classes,
        });
      }
    } catch (error) {
      console.warn(`Warning: Could not read file ${filePath}:`, error);
    }
  }

  return componentFiles;
}

/**
 * Detect Tailwind CSS version and CSS file
 */
async function detectTailwindVersion(projectPath: string): Promise<{ version: 'v3' | 'v4' | 'unknown'; cssFile?: string }> {
  // Look for CSS files with @import "tailwindcss" (v4)
  const cssPatterns = ['**/*.css', '**/globals.css', '**/app.css', '**/style.css', '**/styles.css'];
  
  try {
    for (const pattern of cssPatterns) {
      const cssFiles = await glob(pattern, { 
        cwd: projectPath, 
        absolute: true, 
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'] 
      });
      
      for (const cssFile of cssFiles) {
        try {
          const content = await fs.readFile(cssFile, 'utf-8');
          if (content.includes('@import "tailwindcss"') || content.includes("@import 'tailwindcss'")) {
            return { version: 'v4', cssFile };
          }
        } catch (error) {
          // Skip unreadable files
          continue;
        }
      }
    }
  } catch (error) {
    // If we can't scan CSS files, fall back to config detection
  }
  
  // Check for traditional config file (v3)
  const configPath = await findTailwindConfig(projectPath);
  if (configPath) {
    return { version: 'v3' };
  }
  
  return { version: 'unknown' };
}

/**
 * Check if dark mode is already enabled in tailwind config or CSS
 */
async function checkDarkModeEnabled(tailwindConfigPath?: string, cssFile?: string, version?: string): Promise<boolean> {
  // Check v4 CSS file for custom dark variant
  if (version === 'v4' && cssFile) {
    try {
      const content = await fs.readFile(cssFile, 'utf-8');
      return content.includes('@custom-variant dark');
    } catch (error) {
      console.warn(`Warning: Could not read CSS file at ${cssFile}:`, error);
      return false;
    }
  }
  
  // Check v3 config file
  if (tailwindConfigPath) {
    try {
      // Read the config file as text first to avoid require() issues
      const configContent = await fs.readFile(tailwindConfigPath, 'utf-8');
      
      // Simple check for darkMode configuration
      return configContent.includes('darkMode') && 
             (configContent.includes("'class'") || configContent.includes('"class"') ||
              configContent.includes("'media'") || configContent.includes('"media"'));
    } catch (error) {
      console.warn(`Warning: Could not read Tailwind config at ${tailwindConfigPath}:`, error);
      return false;
    }
  }
  
  return false;
}

/**
 * Analyze a file's content for Tailwind classes
 */
function analyzeFileForTailwindClasses(content: string): {
  totalClasses: number;
  transformable: number;
  classes: {
    transformable: string[];
    nonTransformable: string[];
    alreadyHasDark: string[];
  };
} {
  // Regular expressions to find class attributes
  const classRegexes = [
    /class(?:Name)?=["']([^"']*?)["']/gi,
    /class(?:Name)?=\{["']([^"']*?)["']\}/gi,
    /class(?:Name)?=\{`([^`]*?)`\}/gi,
    /:class=["']([^"']*?)["']/gi,
  ];

  let allClasses = '';
  
  for (const regex of classRegexes) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      allClasses += ' ' + match[1];
    }
  }

  if (!allClasses.trim()) {
    return {
      totalClasses: 0,
      transformable: 0,
      classes: {
        transformable: [],
        nonTransformable: [],
        alreadyHasDark: [],
      },
    };
  }

  const analysis = analyzeClassTransformability(allClasses);
  return {
    totalClasses: analysis.total,
    transformable: analysis.transformable,
    classes: analysis.classes,
  };
}

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate that a project is ready for dark mode transformation
 */
export async function validateProject(projectPath: string): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const analysis = await analyzeProject(projectPath);

    // Check if it's a Tailwind project
    if (!analysis.hasTailwindConfig) {
      errors.push('No Tailwind CSS configuration file found. Please ensure this is a Tailwind CSS project.');
    }

    // Check if there are any transformable components
    if (analysis.transformableComponents === 0) {
      warnings.push('No components with transformable Tailwind classes found. The project may already have dark mode or not use standard Tailwind classes.');
    }

    // Check if dark mode is already enabled
    if (analysis.darkModeEnabled) {
      warnings.push('Dark mode appears to be already enabled in the Tailwind configuration.');
    }

    // Check for unknown framework
    if (analysis.framework === 'unknown') {
      warnings.push('Could not detect project framework. Will use generic transformation approach.');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push(`Failed to analyze project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      valid: false,
      errors,
      warnings,
    };
  }
}
