/**
 * Interactive menu system for Crow Agent
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { InteractiveDashboard } from './dashboard.js';
import { DarkModeWizard } from './wizards/dark-mode.js';
import { DIVIDER } from './branding.js';

export type MenuAction = 
  | 'add-dark-mode'
  | 'scan-project' 
  | 'check-status'
  | 'generate-components'
  | 'configuration'
  | 'exit';

export interface MenuOption {
  name: string;
  value: MenuAction;
  description?: string;
}

export class InteractiveMenu {
  private dashboard: InteractiveDashboard;
  private darkModeWizard: DarkModeWizard;

  constructor(projectPath: string = process.cwd()) {
    this.dashboard = new InteractiveDashboard(projectPath);
    this.darkModeWizard = new DarkModeWizard(projectPath);
  }

  async start(): Promise<void> {
    try {
      // Display welcome and analyze project
      await this.dashboard.displayWelcome();
      const analysis = await this.dashboard.analyzeProject();
      this.dashboard.displayAnalysis(analysis);

      // Main menu loop
      let running = true;
      while (running) {
        const action = await this.showMainMenu();
        running = await this.handleAction(action);
        
        if (running) {
          console.log('\n' + chalk.gray('Press any key to continue...'));
          await this.waitForKeypress();
        }
      }

      console.log(chalk.yellow('\n👋 Thanks for using Crow Agent!\n'));
    } catch (error) {
      console.error(chalk.red('\n❌ An error occurred:'), error);
      process.exit(1);
    }
  }

  private async showMainMenu(): Promise<MenuAction> {
    console.log('\n' + DIVIDER);
    console.log(chalk.yellow.bold('💬 What would you like to do?\n'));

    const options: MenuOption[] = [
      {
        name: '🎨 Add theme switching',
        value: 'add-dark-mode',
        description: 'Transform your project to support light/dark theme switching'
      },
      {
        name: '🔍 Scan for compatibility issues',
        value: 'scan-project',
        description: 'Check your project for potential dark mode issues'
      },
      {
        name: '📊 Check project status',
        value: 'check-status',
        description: 'View current dark mode implementation status'
      },
      {
        name: '🧩 Generate theme components',
        value: 'generate-components',
        description: 'Create custom theme toggle components'
      },
      {
        name: '⚙️ Configuration settings',
        value: 'configuration',
        description: 'Customize Crow Agent behavior'
      },
      {
        name: '🚪 Exit',
        value: 'exit',
        description: 'Exit interactive mode'
      }
    ];

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Select an action:',
        choices: options.map(opt => ({
          name: opt.name,
          value: opt.value,
          short: opt.name.replace(/🎨|🔍|📊|🧩|⚙️|🚪/g, '').trim()
        })),
        pageSize: 10
      }
    ]);

    return action;
  }

  private async handleAction(action: MenuAction): Promise<boolean> {
    console.log('\n' + DIVIDER);

    switch (action) {
      case 'add-dark-mode':
        await this.darkModeWizard.start();
        break;

      case 'scan-project':
        await this.handleScanProject();
        break;

      case 'check-status':
        await this.handleCheckStatus();
        break;

      case 'generate-components':
        await this.handleGenerateComponents();
        break;

      case 'configuration':
        await this.handleConfiguration();
        break;

      case 'exit':
        return false;

      default:
        console.log(chalk.red('Unknown action'));
    }

    return true;
  }

  private async handleScanProject(): Promise<void> {
    console.log(chalk.yellow.bold('🔍 Scanning Project for Issues\n'));
    console.log(chalk.gray('This feature will be implemented in the next version.'));
  }

  private async handleCheckStatus(): Promise<void> {
    console.log(chalk.yellow.bold('📊 Project Status Check\n'));
    const analysis = this.dashboard.getAnalysis();
    if (analysis) {
      this.dashboard.displayAnalysis(analysis);
    }
  }

  private async handleGenerateComponents(): Promise<void> {
    console.log(chalk.yellow.bold('🧩 Generate Theme Components\n'));
    console.log(chalk.gray('This feature will be implemented in the next version.'));
  }

  private async handleConfiguration(): Promise<void> {
    console.log(chalk.yellow.bold('⚙️ Configuration Settings\n'));
    console.log(chalk.gray('This feature will be implemented in the next version.'));
  }

  private async waitForKeypress(): Promise<void> {
    return new Promise((resolve) => {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.once('data', () => {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        resolve();
      });
    });
  }
}
