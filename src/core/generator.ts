/**
 * Component generation system for creating theme toggle components
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Framework } from './scanner.js';

export interface ComponentGenerationOptions {
  framework: Framework;
  outputPath: string;
  componentName?: string;
  typescript?: boolean;
  overwrite?: boolean;
}

export interface GeneratedComponent {
  path: string;
  framework: Framework;
  content: string;
  instructions: string[];
}

/**
 * Generate theme toggle component for the detected framework
 */
export async function generateThemeToggleComponent(options: ComponentGenerationOptions): Promise<GeneratedComponent> {
  const { framework, outputPath, componentName = 'ThemeToggle', typescript = false, overwrite = false } = options;

  let templatePath: string;
  let targetPath: string;
  let instructions: string[] = [];

  // Get the correct template path based on how the package is structured
  const getTemplatePath = async (relativePath: string): Promise<string> => {
    // When running from built code, templates are in the source directory
    const sourceRoot = path.join(__dirname, '../../src/templates');
    const builtRoot = path.join(__dirname, '../templates');
    
    // Try built location first, then source location
    const builtPath = path.join(builtRoot, relativePath);
    const sourcePath = path.join(sourceRoot, relativePath);
    
    try {
      await fs.access(builtPath);
      return builtPath;
    } catch {
      return sourcePath;
    }
  };

  switch (framework) {
    case 'react':
    case 'nextjs':
      const reactTemplate = typescript ? 'react/ThemeToggle.tsx' : 'react/ThemeToggle.jsx';
      templatePath = await getTemplatePath(reactTemplate);
      targetPath = path.join(outputPath, `${componentName}.${typescript ? 'tsx' : 'jsx'}`);
      instructions = getReactInstructions(componentName, typescript);
      break;

    case 'vue':
    case 'nuxt':
      templatePath = await getTemplatePath('vue/ThemeToggle.vue');
      targetPath = path.join(outputPath, `${componentName}.vue`);
      instructions = getVueInstructions(componentName);
      break;

    case 'html':
      // For HTML, we generate both the JS file and an example HTML
      const jsTemplatePath = await getTemplatePath('html/theme-toggle.js');
      const jsTargetPath = path.join(outputPath, 'theme-toggle.js');
      
      const jsContent = await fs.readFile(jsTemplatePath, 'utf-8');
      await ensureDirectoryExists(path.dirname(jsTargetPath));
      
      if (!await fileExists(jsTargetPath) || overwrite) {
        await fs.writeFile(jsTargetPath, jsContent, 'utf-8');
      }

      // Also copy the example HTML if requested
      const htmlTemplatePath = await getTemplatePath('html/example.html');
      const htmlTargetPath = path.join(outputPath, 'theme-toggle-example.html');
      const htmlContent = await fs.readFile(htmlTemplatePath, 'utf-8');
      
      if (!await fileExists(htmlTargetPath) || overwrite) {
        await fs.writeFile(htmlTargetPath, htmlContent, 'utf-8');
      }

      return {
        path: jsTargetPath,
        framework,
        content: jsContent,
        instructions: getHtmlInstructions(),
      };

    default:
      throw new Error(`Unsupported framework: ${framework}`);
  }

  // Read template content
  const content = await fs.readFile(templatePath, 'utf-8');
  
  // Ensure output directory exists
  await ensureDirectoryExists(path.dirname(targetPath));
  
  // Check if file already exists
  if (await fileExists(targetPath) && !overwrite) {
    throw new Error(`Component already exists at ${targetPath}. Use --overwrite to replace it.`);
  }

  // Write the component file
  await fs.writeFile(targetPath, content, 'utf-8');

  return {
    path: targetPath,
    framework,
    content,
    instructions,
  };
}

/**
 * Generate theme toggle components for multiple frameworks
 */
export async function generateMultipleComponents(
  frameworks: Framework[],
  baseOutputPath: string,
  options: Partial<ComponentGenerationOptions> = {}
): Promise<GeneratedComponent[]> {
  const results: GeneratedComponent[] = [];

  for (const framework of frameworks) {
    const frameworkOutputPath = path.join(baseOutputPath, framework);
    
    try {
      const component = await generateThemeToggleComponent({
        framework,
        outputPath: frameworkOutputPath,
        ...options,
      });
      results.push(component);
    } catch (error) {
      console.warn(`Warning: Failed to generate component for ${framework}:`, error);
    }
  }

  return results;
}

/**
 * Detect optimal component placement in project
 */
export async function suggestComponentPlacement(projectPath: string, framework: Framework): Promise<{
  suggested: string;
  alternatives: string[];
}> {
  const alternatives: string[] = [];
  
  switch (framework) {
    case 'react':
    case 'nextjs':
      const reactPaths = [
        path.join(projectPath, 'src/components'),
        path.join(projectPath, 'components'),
        path.join(projectPath, 'src'),
        path.join(projectPath, 'app/components'), // Next.js app directory
      ];
      
      for (const p of reactPaths) {
        if (await directoryExists(p)) {
          return {
            suggested: p,
            alternatives: reactPaths.filter(alt => alt !== p),
          };
        }
        alternatives.push(p);
      }
      
      return {
        suggested: reactPaths[0],
        alternatives: alternatives.slice(1),
      };

    case 'vue':
    case 'nuxt':
      const vuePaths = [
        path.join(projectPath, 'src/components'),
        path.join(projectPath, 'components'),
        path.join(projectPath, 'src'),
      ];
      
      for (const p of vuePaths) {
        if (await directoryExists(p)) {
          return {
            suggested: p,
            alternatives: vuePaths.filter(alt => alt !== p),
          };
        }
        alternatives.push(p);
      }
      
      return {
        suggested: vuePaths[0],
        alternatives: alternatives.slice(1),
      };

    case 'html':
      const htmlPaths = [
        path.join(projectPath, 'js'),
        path.join(projectPath, 'assets/js'),
        path.join(projectPath, 'static/js'),
        path.join(projectPath, 'public/js'),
        path.join(projectPath),
      ];
      
      for (const p of htmlPaths) {
        if (await directoryExists(p)) {
          return {
            suggested: p,
            alternatives: htmlPaths.filter(alt => alt !== p),
          };
        }
        alternatives.push(p);
      }
      
      return {
        suggested: htmlPaths[0],
        alternatives: alternatives.slice(1),
      };

    default:
      return {
        suggested: path.join(projectPath, 'src'),
        alternatives: [path.join(projectPath, 'components')],
      };
  }
}

/**
 * Get usage instructions for React components
 */
function getReactInstructions(componentName: string, typescript: boolean): string[] {
  return [
    `Import the ${componentName} component in your app:`,
    `import { ${componentName} } from './path/to/${componentName}${typescript ? '.tsx' : '.jsx'}';`,
    '',
    'Add it to your component (usually in a header or navigation):',
    `<${componentName} />`,
    '',
    'Available props:',
    '- className?: string - Additional CSS classes',
    '- size?: "sm" | "md" | "lg" - Button size (default: "md")',
    '- variant?: "button" | "switch" - Toggle style (default: "button")',
    '',
    'Examples:',
    `<${componentName} size="lg" variant="switch" className="ml-4" />`,
  ];
}

/**
 * Get usage instructions for Vue components
 */
function getVueInstructions(componentName: string): string[] {
  return [
    `Import and register the ${componentName} component:`,
    `import ${componentName} from './path/to/${componentName}.vue';`,
    '',
    'Add it to your template:',
    `<${componentName} />`,
    '',
    'Available props:',
    '- className?: string - Additional CSS classes',
    '- size?: "sm" | "md" | "lg" - Button size (default: "md")',
    '- variant?: "button" | "switch" - Toggle style (default: "button")',
    '',
    'Examples:',
    `<${componentName} size="lg" variant="switch" class-name="ml-4" />`,
  ];
}

/**
 * Get usage instructions for HTML/vanilla JS
 */
function getHtmlInstructions(): string[] {
  return [
    'Include the theme-toggle.js script in your HTML:',
    '<script src="theme-toggle.js"></script>',
    '',
    'Add theme toggle elements to your HTML:',
    '<div data-theme-toggle></div>',
    '',
    'Available data attributes:',
    '- data-variant="button" | "switch" - Toggle style (default: "button")',
    '- data-size="sm" | "md" | "lg" - Button size (default: "md")',
    '',
    'Examples:',
    '<div data-theme-toggle data-variant="switch" data-size="lg"></div>',
    '',
    'The script will automatically initialize all elements with data-theme-toggle.',
    'You can also manually create toggles using: createThemeToggle(options)',
  ];
}

/**
 * Helper functions
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Directory might already exist, that's fine
  }
}
