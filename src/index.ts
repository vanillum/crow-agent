/**
 * Main entry point for crow-agent library
 */

export { analyzeProject, validateProject } from './core/scanner.js';
export { transformFiles, transformFile, applyTransformations, updateTailwindConfig } from './core/transformer.js';
export { generateThemeToggleComponent, suggestComponentPlacement } from './core/generator.js';
export { 
  transformTailwindClass, 
  transformTailwindClasses, 
  analyzeClassTransformability,
  colorMappings 
} from './core/colors.js';
export { parseCommand, validateCommand } from './cli/parser.js';
export { 
  checkGitStatus, 
  commitChanges, 
  commitCrowAgentChanges,
  ensureGitRepository 
} from './utils/git.js';

export type { 
  ProjectAnalysis, 
  ComponentFile, 
  Framework 
} from './core/scanner.js';
export type { 
  TransformationResult, 
  TransformationSummary 
} from './core/transformer.js';
export type { 
  ComponentGenerationOptions, 
  GeneratedComponent 
} from './core/generator.js';
export type { ParsedCommand } from './cli/parser.js';
export type { GitStatus } from './utils/git.js';
