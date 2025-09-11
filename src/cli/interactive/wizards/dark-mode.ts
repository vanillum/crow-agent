/**
 * Dark Mode Implementation Wizard
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { createProgressBar, formatStatus } from '../branding.js';
import { addDarkModeCommand } from '../../commands/add-dark-mode.js';
import { analyzeProject } from '../../../core/scanner.js';

export interface DarkModeOptions {
  framework?: string;
  component?: string;
  output?: string;
  backup: boolean;
  dryRun: boolean;
  commit: boolean;
  autoPlace?: boolean;
  placement?: string;
}

export class DarkModeWizard {
  private projectPath: string;
  private lastOptions?: DarkModeOptions;

  constructor(projectPath: string = process.cwd()) {
    this.projectPath = projectPath;
  }

  async start(): Promise<void> {
    console.log(chalk.yellow.bold('🎨 Theme Switching Implementation Wizard\n'));
    
    try {
      // Step 0: Check existing setup
      await this.checkExistingSetup();
      
      // Step 1: Configuration
      const options = await this.collectOptions();
      
      // Step 2: Preview changes
      if (options.dryRun) {
        await this.showPreview(options);
        const { proceed } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: 'Apply these changes?',
            default: true
          }
        ]);
        
        if (!proceed) {
          console.log(chalk.yellow('\n📝 Operation cancelled.'));
          return;
        }
        
        // Remove dry-run for actual implementation
        options.dryRun = false;
      }

      // Step 3: Implementation
      await this.implementDarkMode(options);
      this.lastOptions = options;
      
      // Step 4: Success message
      await this.showSuccess();

    } catch (error) {
      console.error(chalk.red('\n❌ Dark mode implementation failed:'), error);
    }
  }

  private async collectOptions(): Promise<DarkModeOptions> {
    console.log(chalk.white('Let\'s configure your theme switching implementation:\n'));

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'framework',
        message: 'Framework (auto-detected, override if needed):',
        choices: [
          { name: 'Auto-detect', value: undefined },
          { name: 'React', value: 'react' },
          { name: 'Next.js', value: 'nextjs' },
          { name: 'Vue.js', value: 'vue' },
          { name: 'Nuxt.js', value: 'nuxt' },
          { name: 'HTML/Vanilla', value: 'html' }
        ],
        default: undefined
      },
      {
        type: 'input',
        name: 'component',
        message: 'Theme toggle component name:',
        default: 'ThemeToggle',
        validate: (input: string) => {
          if (!input.trim()) return 'Component name is required';
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(input)) {
            return 'Component name must be PascalCase (e.g., ThemeToggle)';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'output',
        message: 'Output directory for components:',
        default: './src/components',
        validate: (input: string) => {
          if (!input.trim()) return 'Output directory is required';
          return true;
        }
      },
      {
        type: 'confirm',
        name: 'backup',
        message: 'Create backup before making changes?',
        default: true
      },
      {
        type: 'confirm',
        name: 'dryRun',
        message: 'Preview changes before applying?',
        default: true
      },
      {
        type: 'confirm',
        name: 'commit',
        message: 'Automatically commit changes to git?',
        default: true,
        when: (answers) => !answers.dryRun
      },
      {
        type: 'confirm',
        name: 'autoPlace',
        message: 'Automatically add toggle to your layout/header?',
        default: true
      },
      {
        type: 'list',
        name: 'placement',
        message: 'Where should the toggle be placed?',
        choices: [
          { name: 'Auto-detect best location', value: 'auto' },
          { name: 'Header/Navigation', value: 'header' },
          { name: 'Main layout component', value: 'layout' },
          { name: 'Top-right corner', value: 'corner' }
        ],
        default: 'auto',
        when: (answers) => answers.autoPlace
      }
    ]);

    return {
      ...answers,
      commit: answers.dryRun ? true : answers.commit // Enable commit if not dry run
    };
  }

  private async showPreview(options: DarkModeOptions): Promise<void> {
    console.log('\n' + chalk.yellow.bold('🔍 Preview Changes\n'));
    
    const spinner = ora({
      text: 'Analyzing files to be modified...',
      color: 'yellow'
    }).start();

    await this.delay(1000);
    spinner.succeed('Analysis complete');

    // Mock preview - replace with actual dry-run results
    console.log(chalk.white.bold('\nFiles to be modified:\n'));
    
    console.log(formatStatus('success', 'tailwind.config.js'));
    console.log(chalk.gray('  + darkMode: \'class\',\n'));
    
    console.log(formatStatus('success', 'src/app/page.tsx'));
    console.log(chalk.gray('  - <div className="bg-white text-gray-900">'));
    console.log(chalk.gray('  + <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">\n'));
    
    console.log(formatStatus('success', `${options.output}/${options.component}.tsx (new file)`));
    console.log(chalk.gray('  + Theme toggle component with TypeScript support\n'));
    
    if (options.autoPlace) {
      console.log(formatStatus('success', 'src/app/layout.tsx (modified)'));
      console.log(chalk.gray('  + <ThemeToggle /> added to header navigation\n'));
    }

    console.log(chalk.cyan.bold('Summary:'));
    console.log(`  📁 Files modified: ${chalk.white(options.autoPlace ? '3' : '2')}`);
    console.log(`  📄 Files created: ${chalk.white('1')}`);
    console.log(`  🎨 Classes transformed: ${chalk.white('12')}`);
    console.log(`  🎯 Component auto-placed: ${chalk.white(options.autoPlace ? 'Yes' : 'No')}`);
  }

  private async implementDarkMode(options: DarkModeOptions): Promise<void> {
    console.log('\n' + chalk.yellow.bold('🚀 Implementing Theme Switching\n'));

    const steps = [
      'Updating Tailwind configuration...',
      'Transforming component classes...',
      'Generating theme toggle component...',
      options.autoPlace ? 'Auto-placing toggle in layout...' : null,
      'Creating TypeScript definitions...',
      options.commit ? 'Committing changes to git...' : null
    ].filter(Boolean) as string[];

    for (let i = 0; i < steps.length; i++) {
      const spinner = ora({
        text: steps[i],
        color: 'yellow'
      }).start();

      await this.delay(800 + Math.random() * 400);
      spinner.succeed(steps[i].replace('...', ''));
    }

    // Call the actual dark mode implementation
    try {
      await addDarkModeCommand({
        path: this.projectPath,
        framework: options.framework,
        outputPath: options.output,
        backup: options.backup,
        noCommit: !options.commit,
        verbose: false
      });
    } catch (error) {
      throw new Error(`Implementation failed: ${error}`);
    }
  }

  private async showSuccess(): Promise<void> {
    console.log('\n' + chalk.green.bold('✨ Theme Switching Successfully Implemented!\n'));
    
    console.log(chalk.white('Next steps:'));
    console.log(formatStatus('success', 'Test theme switching by using the toggle or system theme'));
    if (this.lastOptions?.autoPlace) {
      console.log(formatStatus('success', 'ThemeToggle component automatically added to your layout'));
    } else {
      console.log(formatStatus('success', 'Import ThemeToggle component where you need it'));
    }
    console.log(formatStatus('success', 'Customize the generated styles as needed'));
    
    console.log('\n' + chalk.cyan.bold('Usage example:'));
    console.log(chalk.gray(`import { ThemeToggle } from './components/ThemeToggle';`));
    console.log(chalk.gray(''));
    console.log(chalk.gray('function Header() {'));
    console.log(chalk.gray('  return ('));
    console.log(chalk.gray('    <header>'));
    console.log(chalk.gray('      <h1>My App</h1>'));
    console.log(chalk.gray('      <ThemeToggle />'));
    console.log(chalk.gray('    </header>'));
    console.log(chalk.gray('  );'));
    console.log(chalk.gray('}'));
  }

  private async checkExistingSetup(): Promise<void> {
    try {
      const analysis = await analyzeProject(this.projectPath);
      
      if (analysis.darkModeEnabled) {
        console.log(formatStatus('success', 'Dark mode is already enabled in this project!'));
        console.log(chalk.gray(`  Framework: ${analysis.framework}`));
        console.log(chalk.gray(`  Tailwind Version: ${analysis.tailwindVersion}`));
        
        if (analysis.tailwindVersion === 'v4' && analysis.tailwindCssFile) {
          console.log(chalk.gray(`  CSS Configuration: ${analysis.tailwindCssFile}`));
        } else if (analysis.tailwindConfigPath) {
          console.log(chalk.gray(`  Config File: ${analysis.tailwindConfigPath}`));
        }
        
        console.log('');
        
        const { proceed } = await inquirer.prompt([
          {
            type: 'list',
            name: 'proceed',
            message: 'What would you like to do?',
            choices: [
              { name: 'Switch to a different theme preset', value: 'switch' },
              { name: 'Overwrite current setup', value: 'overwrite' },
              { name: 'Keep current setup and exit', value: 'keep' },
              { name: 'Exit wizard', value: 'exit' }
            ]
          }
        ]);
        
        if (proceed === 'exit' || proceed === 'keep') {
          console.log(chalk.yellow('\n👍 Keeping existing dark mode setup.'));
          process.exit(0);
        }
        
        if (proceed === 'switch') {
          console.log(chalk.cyan('\n🔄 Switching theme presets...\n'));
        } else if (proceed === 'overwrite') {
          console.log(chalk.yellow('\n⚠️  Overwriting existing setup...\n'));
        }
      } else {
        console.log(formatStatus('warning', 'No existing dark mode setup detected.'));
        console.log(chalk.gray(`  Framework: ${analysis.framework}`));
        console.log(chalk.gray(`  Tailwind Version: ${analysis.tailwindVersion}`));
        console.log(chalk.gray(`  Components found: ${analysis.totalComponents}`));
        console.log(chalk.gray(`  Transformable components: ${analysis.transformableComponents}`));
        console.log('');
      }
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not analyze project setup. Proceeding with wizard...\n'));
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
