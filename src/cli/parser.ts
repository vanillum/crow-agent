/**
 * Natural language command parser for crow-agent
 */

export interface ParsedCommand {
  action: 'add-dark-mode' | 'scan' | 'status' | 'help' | 'unknown';
  options: {
    dryRun?: boolean;
    force?: boolean;
    backup?: boolean;
    framework?: string;
    outputPath?: string;
    componentName?: string;
    noCommit?: boolean;
    verbose?: boolean;
    theme?: string;
  };
  confidence: number;
}

/**
 * Parse natural language commands
 */
export function parseCommand(input: string): ParsedCommand {
  const normalizedInput = input.toLowerCase().trim();
  
  // Define command patterns
  const patterns = [
    {
      pattern: /(?:add|enable|setup|create|implement)\s+(?:dark\s*mode|dark\s*theme|night\s*mode)/i,
      action: 'add-dark-mode' as const,
      confidence: 0.9,
    },
    {
      pattern: /(?:add|enable)\s+(?:dark|night)\s+(?:mode|theme)/i,
      action: 'add-dark-mode' as const,
      confidence: 0.8,
    },
    {
      pattern: /dark\s*mode/i,
      action: 'add-dark-mode' as const,
      confidence: 0.7,
    },
    {
      pattern: /(?:scan|analyze|check|detect)\s*(?:project)?/i,
      action: 'scan' as const,
      confidence: 0.8,
    },
    {
      pattern: /(?:status|info|information)/i,
      action: 'status' as const,
      confidence: 0.8,
    },
    {
      pattern: /(?:help|usage|\?)/i,
      action: 'help' as const,
      confidence: 0.9,
    },
  ];

  // Find matching patterns
  let bestMatch: ParsedCommand = {
    action: 'unknown',
    options: {},
    confidence: 0,
  };

  for (const { pattern, action, confidence } of patterns) {
    if (pattern.test(normalizedInput)) {
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          action,
          options: {},
          confidence,
        };
      }
    }
  }

  // Extract options from the input
  bestMatch.options = extractOptions(input);

  return bestMatch;
}

/**
 * Extract options and flags from the command input
 */
function extractOptions(input: string): ParsedCommand['options'] {
  const options: ParsedCommand['options'] = {};

  // Extract common flags
  if (/(?:--dry-run|--preview|--check)/i.test(input)) {
    options.dryRun = true;
  }
  
  if (/(?:--force|--overwrite)/i.test(input)) {
    options.force = true;
  }
  
  if (/(?:--backup|--create-backup)/i.test(input)) {
    options.backup = true;
  }
  
  if (/(?:--no-commit|--skip-commit)/i.test(input)) {
    options.noCommit = true;
  }
  
  if (/(?:--verbose|-v)/i.test(input)) {
    options.verbose = true;
  }

  // Extract framework specification
  const frameworkMatch = input.match(/(?:--framework|--for)\s+(react|vue|html|nextjs|nuxt)/i);
  if (frameworkMatch) {
    options.framework = frameworkMatch[1].toLowerCase();
  }

  // Extract output path
  const outputMatch = input.match(/(?:--output|--out)\s+([^\s]+)/i);
  if (outputMatch) {
    options.outputPath = outputMatch[1];
  }

  // Extract component name
  const componentMatch = input.match(/(?:--component|--name)\s+([^\s]+)/i);
  if (componentMatch) {
    options.componentName = componentMatch[1];
  }

  // Extract theme specification
  const themeMatch = input.match(/(?:with|using|apply|--theme)\s+(vercel|supabase|linear|openai|custom)\s*(?:theme)?/i);
  if (themeMatch) {
    options.theme = themeMatch[1].toLowerCase();
  }

  return options;
}

/**
 * Generate help text for available commands
 */
export function getHelpText(): string {
  return `
crow-agent - Automatically add dark mode to Tailwind CSS projects

USAGE:
  crow "add dark mode"                 Add dark mode to current project
  crow "scan project"                  Analyze project for dark mode compatibility
  crow "status"                        Show current project status
  crow "help"                          Show this help message

EXAMPLES:
  crow "add dark mode"                 Basic dark mode implementation
  crow "add dark mode --dry-run"       Preview changes without applying
  crow "add dark mode --force"         Overwrite existing dark mode setup
  crow "add dark mode --backup"        Create backup before changes
  crow "add dark mode --no-commit"     Don't create git commit
  crow "scan"                          Analyze current project
  crow "status"                        Show project information

OPTIONS:
  --dry-run, --preview, --check        Preview changes without applying them
  --force, --overwrite                 Overwrite existing files and configurations
  --backup, --create-backup            Create backup before making changes
  --no-commit, --skip-commit           Skip automatic git commit
  --verbose, -v                        Enable verbose output
  --framework <type>                   Force framework detection (react|vue|html|nextjs|nuxt)
  --output <path>                      Specify output directory for components
  --component <name>                   Specify component name (default: ThemeToggle)

SUPPORTED PROJECTS:
  - React applications (Create React App, custom setups)
  - Next.js applications (Pages and App Router)
  - Vue.js applications (Vue CLI, Vite)
  - Nuxt.js applications
  - Static HTML sites with Tailwind CSS

The tool automatically:
  1. Detects your project framework
  2. Scans for Tailwind classes to transform
  3. Adds dark mode variants to existing classes
  4. Generates theme toggle components
  5. Updates tailwind.config.js to enable dark mode
  6. Creates a git commit with the changes

For more information, visit: https://github.com/alexmckee/crow-agent
`;
}

/**
 * Validate parsed command and provide suggestions
 */
export function validateCommand(parsed: ParsedCommand): {
  valid: boolean;
  errors: string[];
  suggestions: string[];
} {
  const errors: string[] = [];
  const suggestions: string[] = [];

  if (parsed.action === 'unknown') {
    errors.push('Command not recognized');
    suggestions.push('Try "crow help" to see available commands');
    suggestions.push('Example: crow "add dark mode"');
  }

  if (parsed.confidence < 0.5) {
    suggestions.push('Command confidence is low. Please be more specific.');
    suggestions.push('Try using phrases like "add dark mode" or "scan project"');
  }

  // Validate framework option
  if (parsed.options.framework) {
    const validFrameworks = ['react', 'vue', 'html', 'nextjs', 'nuxt'];
    if (!validFrameworks.includes(parsed.options.framework)) {
      errors.push(`Invalid framework: ${parsed.options.framework}`);
      suggestions.push(`Valid frameworks: ${validFrameworks.join(', ')}`);
    }
  }

  // Validate component name
  if (parsed.options.componentName) {
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(parsed.options.componentName)) {
      errors.push('Component name must be a valid identifier (letters and numbers only, starting with a letter)');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    suggestions,
  };
}

/**
 * Create smart suggestions based on partial input
 */
export function getSuggestions(input: string): string[] {
  const normalizedInput = input.toLowerCase().trim();
  const suggestions: string[] = [];

  if (normalizedInput.includes('dark')) {
    suggestions.push('add dark mode');
    suggestions.push('add dark mode --dry-run');
    suggestions.push('add dark mode --backup');
  }

  if (normalizedInput.includes('scan') || normalizedInput.includes('check')) {
    suggestions.push('scan project');
    suggestions.push('scan project --verbose');
  }

  if (normalizedInput.includes('help') || normalizedInput === '') {
    suggestions.push('add dark mode');
    suggestions.push('scan project');
    suggestions.push('status');
    suggestions.push('help');
  }

  if (normalizedInput.includes('react')) {
    suggestions.push('add dark mode --framework react');
  }

  if (normalizedInput.includes('vue')) {
    suggestions.push('add dark mode --framework vue');
  }

  return suggestions;
}
