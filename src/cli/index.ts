#!/usr/bin/env node

/**
 * Main CLI entry point for crow-agent
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { parseCommand, validateCommand, getHelpText } from './parser.js';
import { addDarkModeCommand } from './commands/add-dark-mode.js';
import { scanCommand } from './commands/scan.js';
import { statusCommand } from './commands/status.js';
import { InteractiveMenu } from './interactive/menu.js';

const program = new Command();

// Package information
program
  .name('crow')
  .description('Automatically add dark/light mode functionality to Tailwind CSS projects')
  .version('0.2.7');

// Natural language command interface
program
  .argument('[command...]', 'Natural language command (e.g., "add dark mode")')
  .option('--dry-run', 'Preview changes without applying them')
  .option('--force', 'Overwrite existing dark mode setup')
  .option('--backup', 'Create backup before making changes')
  .option('--framework <type>', 'Force framework detection (react|vue|html|nextjs|nuxt)')
  .option('--output <path>', 'Specify output directory for components')
  .option('--component <name>', 'Specify component name (default: ThemeToggle)')
  .option('--no-commit', 'Skip automatic git commit')
  .option('--verbose', 'Enable verbose output')
  .option('--json', 'Output results in JSON format')
  .option('--interactive', 'Start interactive mode')
  .action(async (commandArgs: string[], options: any) => {
    try {
      const commandString = commandArgs.join(' ').trim();
      
      if (!commandString || options.interactive) {
        // No command provided or interactive flag, start interactive mode
        const menu = new InteractiveMenu(options.path || process.cwd());
        await menu.start();
        return;
      }

      // Parse the natural language command
      const parsed = parseCommand(commandString);
      const validation = validateCommand(parsed);

      if (!validation.valid) {
        console.log(chalk.red('❌ Invalid command:'));
        for (const error of validation.errors) {
          console.log(chalk.red(`  • ${error}`));
        }
        
        if (validation.suggestions.length > 0) {
          console.log(chalk.yellow('\n💡 Suggestions:'));
          for (const suggestion of validation.suggestions) {
            console.log(chalk.yellow(`  • ${suggestion}`));
          }
        }
        
        process.exit(1);
      }

      // Show validation warnings
      if (validation.suggestions.length > 0) {
        for (const suggestion of validation.suggestions) {
          console.log(chalk.yellow(`⚠️  ${suggestion}`));
        }
        console.log('');
      }

      // Execute the parsed command
      switch (parsed.action) {
        case 'add-dark-mode':
          await addDarkModeCommand({
            ...options,
            ...parsed.options,
          });
          break;

        case 'scan':
          await scanCommand({
            ...options,
            ...parsed.options,
          });
          break;

        case 'status':
          await statusCommand({
            ...options,
            ...parsed.options,
          });
          break;

        case 'help':
          console.log(getHelpText());
          break;

        default:
          console.log(chalk.red(`❌ Unknown action: ${parsed.action}`));
          console.log(chalk.gray('\nTry: crow "help" for available commands'));
          process.exit(1);
      }
    } catch (error) {
      console.log(chalk.red(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      
      if (options.verbose && error instanceof Error && error.stack) {
        console.log(chalk.gray('\nStack trace:'));
        console.log(chalk.gray(error.stack));
      }
      
      process.exit(1);
    }
  });

// Direct command interfaces (for those who prefer explicit commands)
program
  .command('add-dark-mode')
  .alias('add')
  .description('Add dark mode support to a Tailwind CSS project')
  .option('--dry-run', 'Preview changes without applying them')
  .option('--force', 'Overwrite existing dark mode setup')
  .option('--backup', 'Create backup before making changes')
  .option('--framework <type>', 'Force framework detection')
  .option('--output <path>', 'Specify output directory for components')
  .option('--component <name>', 'Specify component name')
  .option('--no-commit', 'Skip automatic git commit')
  .option('--verbose', 'Enable verbose output')
  .option('--path <path>', 'Project path (default: current directory)')
  .action(addDarkModeCommand);

program
  .command('scan')
  .description('Analyze project for dark mode compatibility')
  .option('--verbose', 'Enable verbose output with detailed file analysis')
  .option('--json', 'Output results in JSON format')
  .option('--path <path>', 'Project path (default: current directory)')
  .action(scanCommand);

program
  .command('status')
  .description('Show current project status and dark mode readiness')
  .option('--json', 'Output status in JSON format')
  .option('--path <path>', 'Project path (default: current directory)')
  .action(statusCommand);

// Handle unknown commands
program.on('command:*', (operands) => {
  console.log(chalk.red(`❌ Unknown command: ${operands[0]}`));
  console.log(chalk.gray('Try: crow "help" for available commands'));
  process.exit(1);
});

// Interactive mode is handled in the main action above
// No duplicate interactive mode startup needed here

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.log(chalk.red('\n❌ Uncaught Error:'));
  console.log(chalk.red(error.message));
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.log(chalk.red('\n❌ Unhandled Rejection:'));
  console.log(chalk.red(reason instanceof Error ? reason.message : String(reason)));
  process.exit(1);
});

// Parse command line arguments
program.parse();
