/**
 * Branding and visual elements for interactive CLI
 */

import chalk from 'chalk';
import boxen from 'boxen';

export const CROW_LOGO = chalk.yellow(`
       ╭─────────────────────────────────────────────╮
       │                                             │
    🌙 │    ██████╗ ██████╗  ██████╗ ██╗    ██╗     │
       │   ██╔════╝ ██╔══██╗██╔═══██╗██║    ██║     │
       │   ██║      ██████╔╝██║   ██║██║ █╗ ██║     │
       │   ██║      ██╔══██╗██║   ██║██║███╗██║     │
       │   ╚██████╗ ██║  ██║╚██████╔╝╚███╔███╔╝     │
       │    ╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚══╝╚══╝      │
       │                                             │
       │            Tailwind Theme Agent            │
       │                                             │
       ╰─────────────────────────────────────────────╯
`);

export const WELCOME_MESSAGE = chalk.yellow('Welcome to Crow Agent Interactive Mode!');

export const createProgressBar = (progress: number, width: number = 40): string => {
  const filled = Math.round((progress / 100) * width);
  const empty = width - filled;
  return chalk.yellow('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
};

export const createStatusBox = (content: string): string => {
  return boxen(content, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'yellow',
    title: '🌙 Crow Agent',
    titleAlignment: 'center'
  });
};

export const formatMenuItem = (text: string, selected: boolean = false): string => {
  const prefix = selected ? chalk.yellow('❯') : ' ';
  const content = selected ? chalk.yellow(text) : chalk.gray(text);
  return `${prefix} ${content}`;
};

export const formatStatus = (status: 'success' | 'warning' | 'error', text: string): string => {
  const icons = {
    success: chalk.green('✓'),
    warning: chalk.yellow('⚠'),
    error: chalk.red('✗')
  };
  return `${icons[status]} ${text}`;
};

export const DIVIDER = chalk.yellow('─'.repeat(50));
