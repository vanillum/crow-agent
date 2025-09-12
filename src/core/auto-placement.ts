/**
 * Automatic component placement system for theme toggles
 * Detects layout files and injects ThemeToggle components automatically
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { parse, ParserOptions } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { Framework } from './scanner.js';

export interface AutoPlacementOptions {
  projectPath: string;
  framework: Framework;
  componentName: string;
  componentPath: string;
  placement?: 'auto' | 'header' | 'layout' | 'corner';
}

export interface AutoPlacementResult {
  success: boolean;
  modifiedFile?: string;
  error?: string;
  insertionPoint?: string;
  importAdded?: boolean;
  componentAdded?: boolean;
}

export interface LayoutFileInfo {
  path: string;
  framework: Framework;
  type: 'app-router' | 'pages-router' | 'react-app' | 'vue-app';
  hasHeader?: boolean;
  hasNavigation?: boolean;
}

/**
 * Detect layout files for different frameworks
 */
export async function detectLayoutFiles(projectPath: string, framework: Framework): Promise<LayoutFileInfo[]> {
  const layoutFiles: LayoutFileInfo[] = [];
  
  try {
    switch (framework) {
      case 'nextjs':
        // Next.js App Router (preferred)
        const appLayout = path.join(projectPath, 'src/app/layout.tsx');
        const appLayoutJs = path.join(projectPath, 'src/app/layout.js');
        
        if (await fileExists(appLayout)) {
          layoutFiles.push({
            path: appLayout,
            framework: 'nextjs',
            type: 'app-router',
            ...(await analyzeLayoutStructure(appLayout))
          });
        } else if (await fileExists(appLayoutJs)) {
          layoutFiles.push({
            path: appLayoutJs,
            framework: 'nextjs',
            type: 'app-router',
            ...(await analyzeLayoutStructure(appLayoutJs))
          });
        }
        
        // Next.js Pages Router (fallback)
        const pagesApp = path.join(projectPath, 'pages/_app.tsx');
        const pagesAppJs = path.join(projectPath, 'pages/_app.js');
        
        if (await fileExists(pagesApp)) {
          layoutFiles.push({
            path: pagesApp,
            framework: 'nextjs',
            type: 'pages-router',
            ...(await analyzeLayoutStructure(pagesApp))
          });
        } else if (await fileExists(pagesAppJs)) {
          layoutFiles.push({
            path: pagesAppJs,
            framework: 'nextjs',
            type: 'pages-router',
            ...(await analyzeLayoutStructure(pagesAppJs))
          });
        }
        break;
        
      case 'react':
        // React App
        const reactApp = path.join(projectPath, 'src/App.tsx');
        const reactAppJs = path.join(projectPath, 'src/App.js');
        
        if (await fileExists(reactApp)) {
          layoutFiles.push({
            path: reactApp,
            framework: 'react',
            type: 'react-app',
            ...(await analyzeLayoutStructure(reactApp))
          });
        } else if (await fileExists(reactAppJs)) {
          layoutFiles.push({
            path: reactAppJs,
            framework: 'react',
            type: 'react-app',
            ...(await analyzeLayoutStructure(reactAppJs))
          });
        }
        break;
        
      case 'vue':
      case 'nuxt':
        // Vue/Nuxt App
        const vueApp = path.join(projectPath, 'src/App.vue');
        const nuxtLayout = path.join(projectPath, 'layouts/default.vue');
        
        if (await fileExists(nuxtLayout)) {
          layoutFiles.push({
            path: nuxtLayout,
            framework: 'nuxt',
            type: 'vue-app',
            ...(await analyzeLayoutStructure(nuxtLayout))
          });
        } else if (await fileExists(vueApp)) {
          layoutFiles.push({
            path: vueApp,
            framework: 'vue',
            type: 'vue-app',
            ...(await analyzeLayoutStructure(vueApp))
          });
        }
        break;
    }
    
  } catch (error) {
    console.warn('Error detecting layout files:', error);
  }
  
  return layoutFiles;
}

/**
 * Analyze layout structure to find insertion points
 */
async function analyzeLayoutStructure(filePath: string): Promise<{ hasHeader?: boolean; hasNavigation?: boolean }> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lowercased = content.toLowerCase();
    
    return {
      hasHeader: lowercased.includes('<header') || lowercased.includes('header') || lowercased.includes('navbar'),
      hasNavigation: lowercased.includes('<nav') || lowercased.includes('navigation') || lowercased.includes('menu')
    };
  } catch {
    return {};
  }
}

/**
 * Main auto-placement function
 */
export async function autoPlaceThemeToggle(options: AutoPlacementOptions): Promise<AutoPlacementResult> {
  const { projectPath, framework, componentName, componentPath, placement = 'auto' } = options;
  
  // Detect layout files
  const layoutFiles = await detectLayoutFiles(projectPath, framework);
  
  if (layoutFiles.length === 0) {
    return {
      success: false,
      error: 'No suitable layout files found for auto-placement'
    };
  }
  
  // Choose best layout file
  const targetLayout = chooseBestLayout(layoutFiles, placement);
  
  // Inject component
  return await injectThemeToggle({
    layoutFile: targetLayout,
    componentName,
    componentPath,
    placement
  });
}

/**
 * Choose the best layout file for placement
 */
function chooseBestLayout(layoutFiles: LayoutFileInfo[], placement: string): LayoutFileInfo {
  // Prefer App Router over Pages Router for Next.js
  const appRouter = layoutFiles.find(f => f.type === 'app-router');
  if (appRouter) return appRouter;
  
  // Prefer layouts with headers for header placement
  if (placement === 'header') {
    const withHeader = layoutFiles.find(f => f.hasHeader);
    if (withHeader) return withHeader;
  }
  
  // Return first available
  return layoutFiles[0];
}

/**
 * Inject ThemeToggle component into layout file
 */
async function injectThemeToggle(options: {
  layoutFile: LayoutFileInfo;
  componentName: string;
  componentPath: string;
  placement: string;
}): Promise<AutoPlacementResult> {
  const { layoutFile, componentName, componentPath, placement } = options;
  
  try {
    const content = await fs.readFile(layoutFile.path, 'utf-8');
    
    if (layoutFile.path.endsWith('.vue')) {
      return await injectIntoVueFile(layoutFile, content, componentName, componentPath, placement);
    } else {
      return await injectIntoReactFile(layoutFile, content, componentName, componentPath, placement);
    }
    
  } catch (error) {
    return {
      success: false,
      error: `Failed to inject component: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Inject into React/Next.js files
 */
async function injectIntoReactFile(
  layoutFile: LayoutFileInfo,
  content: string,
  componentName: string,
  componentPath: string,
  placement: string
): Promise<AutoPlacementResult> {
  try {
    // Parse the file
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });

    let importAdded = false;
    let componentAdded = false;
    let insertionPoint = '';

    // Add import if not exists
    const relativePath = getRelativeImportPath(layoutFile.path, componentPath);
    const importExists = content.includes(`from '${relativePath}'`) || content.includes(`from "${relativePath}"`);
    
    if (!importExists) {
      // Find the last import or add at the top
      let lastImport: any = null;
      
      traverse(ast, {
        ImportDeclaration(path) {
          lastImport = path;
        }
      });
      
      const importStatement = t.importDeclaration(
        [t.importSpecifier(t.identifier(componentName), t.identifier(componentName))],
        t.stringLiteral(relativePath)
      );
      
      if (lastImport) {
        lastImport.insertAfter(importStatement);
      } else {
        ast.program.body.unshift(importStatement);
      }
      
      importAdded = true;
    }
    
    // Find insertion point for component
    traverse(ast, {
      JSXElement(path) {
        const elementName = getJSXElementName(path.node);
        
        // Look for header, nav, or main layout elements
        if (elementName === 'header' || 
            (elementName === 'div' && hasLayoutClasses(path.node)) ||
            (layoutFile.type === 'app-router' && elementName === 'body')) {
          
          // Check if ThemeToggle already exists in this element
          const hasThemeToggle = hasChildComponent(path.node, componentName);
          if (!hasThemeToggle) {
            // Add ThemeToggle as last child
            const themeToggleElement = t.jsxElement(
              t.jsxOpeningElement(t.jsxIdentifier(componentName), []),
              t.jsxClosingElement(t.jsxIdentifier(componentName)),
              [],
              true
            );
            
            path.node.children.push(themeToggleElement);
            componentAdded = true;
            insertionPoint = `${elementName} element`;
            path.stop();
          }
        }
      }
    });
    
    // If no suitable insertion point found, try to add to the main return statement
    if (!componentAdded) {
      traverse(ast, {
        ReturnStatement(path) {
          if (t.isJSXElement(path.node.argument) || t.isJSXFragment(path.node.argument)) {
            const jsx = path.node.argument as any;
            
            if (jsx.children && !hasChildComponent(jsx, componentName)) {
              const themeToggleElement = t.jsxElement(
                t.jsxOpeningElement(
                  t.jsxIdentifier(componentName), 
                  [t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral('fixed top-4 right-4 z-50'))]
                ),
                t.jsxClosingElement(t.jsxIdentifier(componentName)),
                [],
                true
              );
              
              jsx.children.push(themeToggleElement);
              componentAdded = true;
              insertionPoint = 'main layout (fixed position)';
              path.stop();
            }
          }
        }
      });
    }
    
    if (importAdded || componentAdded) {
      // Generate the modified code
      const result = generate(ast, {
        retainLines: false,
        compact: false,
      });
      
      // Write back to file
      await fs.writeFile(layoutFile.path, result.code, 'utf-8');
      
      return {
        success: true,
        modifiedFile: layoutFile.path,
        insertionPoint,
        importAdded,
        componentAdded
      };
    } else {
      return {
        success: false,
        error: 'ThemeToggle component appears to already be present in the layout'
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse React file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Inject into Vue files (simplified implementation)
 */
async function injectIntoVueFile(
  layoutFile: LayoutFileInfo,
  content: string,
  componentName: string,
  componentPath: string,
  placement: string
): Promise<AutoPlacementResult> {
  // For now, provide a basic Vue implementation
  // This could be expanded with proper Vue SFC parsing
  
  if (content.includes(`<${componentName}`)) {
    return {
      success: false,
      error: 'ThemeToggle component appears to already be present in the layout'
    };
  }
  
  // Simple regex-based injection for Vue (could be improved with proper SFC parsing)
  const relativePath = getRelativeImportPath(layoutFile.path, componentPath);
  
  let modifiedContent = content;
  
  // Add import to script section
  const scriptMatch = modifiedContent.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    const scriptContent = scriptMatch[1];
    const importStatement = `\nimport ${componentName} from '${relativePath}';`;
    
    if (!scriptContent.includes(importStatement)) {
      modifiedContent = modifiedContent.replace(
        scriptMatch[0],
        `<script${scriptMatch[0].match(/<script([^>]*)>/)?.[1] || ''}>${importStatement}${scriptContent}</script>`
      );
    }
  }
  
  // Add component to template
  const templateMatch = modifiedContent.match(/<template>([\s\S]*?)<\/template>/);
  if (templateMatch) {
    const templateContent = templateMatch[1];
    const componentTag = `\n    <${componentName} class="fixed top-4 right-4 z-50" />`;
    
    modifiedContent = modifiedContent.replace(
      templateMatch[0],
      `<template>${templateContent}${componentTag}\n  </template>`
    );
    
    await fs.writeFile(layoutFile.path, modifiedContent, 'utf-8');
    
    return {
      success: true,
      modifiedFile: layoutFile.path,
      insertionPoint: 'template (fixed position)',
      importAdded: true,
      componentAdded: true
    };
  }
  
  return {
    success: false,
    error: 'Could not find suitable injection point in Vue file'
  };
}

// Helper functions

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function getRelativeImportPath(fromFile: string, toFile: string): string {
  const relativePath = path.relative(path.dirname(fromFile), toFile);
  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
}

function getJSXElementName(element: t.JSXElement): string {
  const openingElement = element.openingElement;
  if (t.isJSXIdentifier(openingElement.name)) {
    return openingElement.name.name;
  }
  return '';
}

function hasLayoutClasses(element: t.JSXElement): boolean {
  const openingElement = element.openingElement;
  const classNameAttr = openingElement.attributes.find(attr => 
    t.isJSXAttribute(attr) && 
    t.isJSXIdentifier(attr.name) && 
    attr.name.name === 'className'
  ) as t.JSXAttribute;
  
  if (classNameAttr && t.isStringLiteral(classNameAttr.value)) {
    const className = classNameAttr.value.value;
    return className.includes('header') || 
           className.includes('nav') || 
           className.includes('flex') || 
           className.includes('justify-between');
  }
  
  return false;
}

function hasChildComponent(element: any, componentName: string): boolean {
  if (!element.children) return false;
  
  return element.children.some((child: any) => {
    if (t.isJSXElement(child)) {
      const childName = getJSXElementName(child);
      return childName === componentName;
    }
    return false;
  });
}
