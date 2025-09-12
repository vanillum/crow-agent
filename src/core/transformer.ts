/**
 * Code transformer for modifying Tailwind classes with dark mode variants
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { parse, ParserOptions } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { parse as parseVue } from '@vue/compiler-sfc';
import { transformTailwindClasses, hasExistingDarkVariant } from './colors.js';
import { ComponentFile, Framework } from './scanner.js';

export interface TransformationResult {
  filePath: string;
  success: boolean;
  error?: string;
  originalContent: string;
  transformedContent: string;
  changesCount: number;
  transformedClasses: string[];
}

export interface TransformationSummary {
  totalFiles: number;
  successfulTransformations: number;
  failedTransformations: number;
  totalChanges: number;
  results: TransformationResult[];
}

/**
 * Transform multiple component files
 */
export async function transformFiles(files: ComponentFile[], themeId?: string): Promise<TransformationSummary> {
  const results: TransformationResult[] = [];
  
  for (const file of files) {
    try {
      const result = await transformFile(file, themeId);
      results.push(result);
    } catch (error) {
      results.push({
        filePath: file.path,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        originalContent: file.content || '',
        transformedContent: file.content || '',
        changesCount: 0,
        transformedClasses: [],
      });
    }
  }

  return {
    totalFiles: files.length,
    successfulTransformations: results.filter(r => r.success).length,
    failedTransformations: results.filter(r => !r.success).length,
    totalChanges: results.reduce((sum, r) => sum + r.changesCount, 0),
    results,
  };
}

/**
 * Transform a single component file
 */
export async function transformFile(file: ComponentFile, themeId?: string): Promise<TransformationResult> {
  const originalContent = file.content || await fs.readFile(file.path, 'utf-8');
  
  let transformedContent: string;
  let transformedClasses: string[] = [];
  
  switch (file.framework) {
    case 'react':
    case 'nextjs':
      ({ content: transformedContent, transformedClasses } = await transformReactFile(originalContent, themeId));
      break;
    case 'vue':
    case 'nuxt':
      ({ content: transformedContent, transformedClasses } = await transformVueFile(originalContent, themeId));
      break;
    case 'html':
      ({ content: transformedContent, transformedClasses } = transformHtmlFile(originalContent, themeId));
      break;
    default:
      // Try to detect by file extension
      const ext = path.extname(file.path).toLowerCase();
      if (['.jsx', '.tsx'].includes(ext)) {
        ({ content: transformedContent, transformedClasses } = await transformReactFile(originalContent, themeId));
      } else if (ext === '.vue') {
        ({ content: transformedContent, transformedClasses } = await transformVueFile(originalContent, themeId));
      } else if (ext === '.html') {
        ({ content: transformedContent, transformedClasses } = transformHtmlFile(originalContent, themeId));
      } else {
        // Generic text-based transformation as fallback
        ({ content: transformedContent, transformedClasses } = transformGeneric(originalContent, themeId));
      }
  }

  const changesCount = transformedClasses.length;
  
  return {
    filePath: file.path,
    success: true,
    originalContent,
    transformedContent,
    changesCount,
    transformedClasses,
  };
}

/**
 * Transform React/JSX files
 */
async function transformReactFile(content: string, themeId?: string): Promise<{ content: string; transformedClasses: string[] }> {
  const transformedClasses: string[] = [];
  
  try {
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });

    let modifiedContent = content;
    const replacements: Array<{ start: number; end: number; replacement: string }> = [];

    traverse(ast, {
      JSXAttribute(path) {
        const name = path.node.name;
        if (t.isJSXIdentifier(name) && (name.name === 'className' || name.name === 'class')) {
          const value = path.node.value;
          
          if (t.isStringLiteral(value)) {
            // When we have a themeId, we want to transform even if dark variants exist
            const shouldTransform = themeId || !hasExistingDarkVariant(value.value);
            if (shouldTransform) {
              const transformed = transformTailwindClasses(value.value, themeId);
              if (transformed !== value.value) {
                transformedClasses.push(value.value);
                replacements.push({
                  start: value.start!,
                  end: value.end!,
                  replacement: `"${transformed}"`,
                });
              }
            }
          } else if (t.isJSXExpressionContainer(value)) {
            // Handle template literals and complex expressions
            if (t.isTemplateLiteral(value.expression)) {
              const quasi = value.expression.quasis[0];
              const shouldTransform = themeId || !hasExistingDarkVariant(quasi.value.raw);
              if (quasi && shouldTransform) {
                const transformed = transformTailwindClasses(quasi.value.raw, themeId);
                if (transformed !== quasi.value.raw) {
                  transformedClasses.push(quasi.value.raw);
                  // This is more complex for template literals, we'll use regex fallback
                }
              }
            }
          }
        }
      },
    });

    // Apply replacements in reverse order to maintain positions
    replacements.sort((a, b) => b.start - a.start);
    for (const replacement of replacements) {
      modifiedContent = 
        modifiedContent.slice(0, replacement.start) + 
        replacement.replacement + 
        modifiedContent.slice(replacement.end);
    }

    // Fallback to regex-based transformation for complex cases
    if (replacements.length === 0) {
      return transformGeneric(content, themeId);
    }

    return { content: modifiedContent, transformedClasses };
  } catch (error) {
    // Fallback to generic transformation if AST parsing fails
    return transformGeneric(content, themeId);
  }
}

/**
 * Transform Vue single-file components
 */
async function transformVueFile(content: string, themeId?: string): Promise<{ content: string; transformedClasses: string[] }> {
  const transformedClasses: string[] = [];
  
  try {
    const { descriptor } = parseVue(content);
    let modifiedContent = content;

    if (descriptor.template) {
      const templateContent = descriptor.template.content;
      const templateStart = content.indexOf(templateContent);
      
      const { content: transformedTemplate, transformedClasses: templateClasses } = 
        transformHtmlContent(templateContent, themeId);
      
      if (templateClasses.length > 0) {
        modifiedContent = 
          content.slice(0, templateStart) + 
          transformedTemplate + 
          content.slice(templateStart + templateContent.length);
        transformedClasses.push(...templateClasses);
      }
    }

    return { content: modifiedContent, transformedClasses };
  } catch (error) {
    // Fallback to generic transformation if Vue parsing fails
    return transformGeneric(content, themeId);
  }
}

/**
 * Transform HTML files
 */
function transformHtmlFile(content: string, themeId?: string): { content: string; transformedClasses: string[] } {
  return transformHtmlContent(content, themeId);
}

/**
 * Transform HTML content (used by both HTML files and Vue templates)
 */
function transformHtmlContent(content: string, themeId?: string): { content: string; transformedClasses: string[] } {
  const transformedClasses: string[] = [];
  
  // Regular expression to find class attributes
  const classRegex = /(?:class|:class)=["']([^"']*?)["']/gi;
  
  const transformedContent = content.replace(classRegex, (match, classString) => {
    const shouldTransform = themeId || !hasExistingDarkVariant(classString);
    if (!shouldTransform) {
      return match;
    }
    
    const transformed = transformTailwindClasses(classString, themeId);
    if (transformed !== classString) {
      transformedClasses.push(classString);
      return match.replace(classString, transformed);
    }
    
    return match;
  });

  return { content: transformedContent, transformedClasses };
}

/**
 * Generic text-based transformation (fallback)
 */
function transformGeneric(content: string, themeId?: string): { content: string; transformedClasses: string[] } {
  const transformedClasses: string[] = [];
  
  // More comprehensive regex patterns for different attribute styles
  const patterns = [
    /class(?:Name)?=["']([^"']*?)["']/gi,
    /class(?:Name)?=\{["']([^"']*?)["']\}/gi,
    /:class=["']([^"']*?)["']/gi,
  ];

  let modifiedContent = content;
  
  for (const pattern of patterns) {
    modifiedContent = modifiedContent.replace(pattern, (match, classString) => {
      const shouldTransform = themeId || !hasExistingDarkVariant(classString);
      if (!shouldTransform) {
        return match;
      }
      
      const transformed = transformTailwindClasses(classString, themeId);
      if (transformed !== classString) {
        transformedClasses.push(classString);
        return match.replace(classString, transformed);
      }
      
      return match;
    });
  }

  return { content: modifiedContent, transformedClasses };
}

/**
 * Apply transformations to files (write to disk)
 */
export async function applyTransformations(results: TransformationResult[]): Promise<void> {
  for (const result of results) {
    if (result.success && result.changesCount > 0) {
      await fs.writeFile(result.filePath, result.transformedContent, 'utf-8');
    }
  }
}

/**
 * Create backup of files before transformation
 */
export async function createBackup(files: ComponentFile[], backupDir: string): Promise<void> {
  await fs.mkdir(backupDir, { recursive: true });
  
  for (const file of files) {
    const relativePath = path.relative(process.cwd(), file.path);
    const backupPath = path.join(backupDir, relativePath);
    
    await fs.mkdir(path.dirname(backupPath), { recursive: true });
    await fs.copyFile(file.path, backupPath);
  }
}

/**
 * Restore files from backup
 */
export async function restoreFromBackup(backupDir: string): Promise<void> {
  const backupFiles = await fs.readdir(backupDir, { recursive: true });
  
  for (const file of backupFiles) {
    if (typeof file === 'string') {
      const backupPath = path.join(backupDir, file);
      const originalPath = path.resolve(file);
      
      try {
        await fs.copyFile(backupPath, originalPath);
      } catch (error) {
        console.warn(`Warning: Could not restore ${originalPath}:`, error);
      }
    }
  }
}

/**
 * Update Tailwind configuration for both v3 and v4
 */
export async function updateTailwindConfig(configPath?: string, cssFile?: string, version?: string): Promise<boolean> {
  if (version === 'v4' && cssFile) {
    return await updateTailwindV4Config(cssFile);
  } else if (version === 'v3' && configPath) {
    return await updateTailwindV3Config(configPath);
  }
  
  throw new Error('Unable to update Tailwind configuration: missing config file or CSS file');
}

/**
 * Update tailwind.config.js to enable dark mode (v3)
 */
async function updateTailwindV3Config(configPath: string): Promise<boolean> {
  try {
    const configContent = await fs.readFile(configPath, 'utf-8');
    
    // Check if dark mode is already configured
    if (configContent.includes('darkMode')) {
      return false; // Already configured
    }

    // Simple approach: add darkMode: 'class' after module.exports = {
    const updatedContent = configContent.replace(
      /(module\.exports\s*=\s*{|export\s+default\s*{)/,
      `$1\n  darkMode: 'class',`
    );

    if (updatedContent !== configContent) {
      await fs.writeFile(configPath, updatedContent, 'utf-8');
      return true;
    }

    return false;
  } catch (error) {
    throw new Error(`Failed to update Tailwind v3 config: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update CSS file to enable dark mode custom variant (v4)
 */
async function updateTailwindV4Config(cssFile: string): Promise<boolean> {
  try {
    const cssContent = await fs.readFile(cssFile, 'utf-8');
    
    // Check if dark mode custom variant is already configured
    if (cssContent.includes('@custom-variant dark')) {
      return false; // Already configured
    }

    // Add the custom dark variant after the @import statement
    const darkVariant = '@custom-variant dark (&:where(.dark, .dark *));';
    
    let updatedContent: string;
    if (cssContent.includes('@import "tailwindcss"')) {
      updatedContent = cssContent.replace(
        '@import "tailwindcss";',
        `@import "tailwindcss";\n\n${darkVariant}`
      );
    } else if (cssContent.includes("@import 'tailwindcss'")) {
      updatedContent = cssContent.replace(
        "@import 'tailwindcss';",
        `@import 'tailwindcss';\n\n${darkVariant}`
      );
    } else {
      // Add at the beginning if no import found
      updatedContent = `${darkVariant}\n\n${cssContent}`;
    }

    if (updatedContent !== cssContent) {
      await fs.writeFile(cssFile, updatedContent, 'utf-8');
      return true;
    }

    return false;
  } catch (error) {
    throw new Error(`Failed to update Tailwind v4 CSS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
