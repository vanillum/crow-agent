/**
 * Interactive dashboard for project analysis and status
 */

import chalk from 'chalk';
import ora from 'ora';
import { CROW_LOGO, createProgressBar, formatStatus, DIVIDER } from './branding.js';
// import { analyzeProject } from '../../core/analyzer.js'; // TODO: Implement analyzer

export interface ProjectDashboard {
  framework?: string;
  hasTailwind: boolean;
  hasThemeSwitching: boolean;
  tailwindVersion?: string;
  componentCount: number;
  transformableComponents: number;
  estimatedChanges: number;
  recommendations: string[];
}

export class InteractiveDashboard {
  private projectPath: string;
  private analysis?: ProjectDashboard;

  constructor(projectPath: string = process.cwd()) {
    this.projectPath = projectPath;
  }

  async displayWelcome(): Promise<void> {
    console.clear();
    console.log(CROW_LOGO);
    console.log(chalk.yellow('🌙 Crow Agent v0.2.0 - Interactive Mode\n'));
  }

  async analyzeProject(): Promise<ProjectDashboard> {
    const spinner = ora({
      text: 'Analyzing your project...',
      color: 'yellow'
    }).start();

    try {
      // Simulate analysis with progress updates
      spinner.text = 'Detecting framework...';
      await this.delay(800);
      
      spinner.text = 'Scanning Tailwind configuration...';
      await this.delay(600);
      
      spinner.text = 'Analyzing components...';
      await this.delay(1000);
      
      spinner.text = 'Checking theme switching status...';
      await this.delay(500);

      // Mock analysis for now - replace with actual analyzer
      this.analysis = {
        framework: 'Next.js + TypeScript',
        hasTailwind: true,
        hasThemeSwitching: false,
        tailwindVersion: 'v4', // Mock v4 for demo
        componentCount: 12,
        transformableComponents: 8,
        estimatedChanges: 45,
        recommendations: [
          'Ready for theme switching implementation',
          'All components are compatible',
          'Tailwind v4 detected - CSS-based configuration supported!'
        ]
      };

      spinner.succeed('Project analysis complete!');
      return this.analysis;
    } catch (error) {
      spinner.fail('Analysis failed');
      throw error;
    }
  }

  displayAnalysis(analysis: ProjectDashboard): void {
    console.log('\n' + DIVIDER);
    console.log(chalk.yellow.bold('📊 Project Analysis Results\n'));

    // Framework Detection
    console.log(chalk.white.bold('Framework Detection:'));
    console.log(`  Framework: ${chalk.cyan(analysis.framework || 'Unknown')}`);
    console.log(`  Package.json: ${analysis.framework ? formatStatus('success', 'Found') : formatStatus('error', 'Missing')}`);
    const tailwindStatus = analysis.hasTailwind ? 
      `${formatStatus('success', 'Found')} ${analysis.tailwindVersion ? chalk.gray(`(${analysis.tailwindVersion})`) : ''}` : 
      formatStatus('error', 'Missing');
    console.log(`  Tailwind Config: ${tailwindStatus}`);
    console.log('');

    // Theme Switching Status
    console.log(chalk.white.bold('Theme Switching Status:'));
    console.log(`  Currently Enabled: ${analysis.hasThemeSwitching ? formatStatus('success', 'Yes') : formatStatus('warning', 'No')}`);
    console.log('');

    // Component Analysis
    console.log(chalk.white.bold('Component Analysis:'));
    console.log(`  Total Components: ${chalk.cyan(analysis.componentCount)}`);
    console.log(`  Transformable: ${chalk.cyan(analysis.transformableComponents)} (${Math.round((analysis.transformableComponents / analysis.componentCount) * 100)}%)`);
    console.log(`  Estimated Changes: ${chalk.cyan(analysis.estimatedChanges)}`);
    console.log('');

    // Recommendations
    if (analysis.recommendations.length > 0) {
      console.log(chalk.white.bold('💡 Recommendations:'));
      analysis.recommendations.forEach(rec => {
        console.log(`  ${formatStatus('success', rec)}`);
      });
    }

    console.log('\n' + DIVIDER);
  }

  displayProgress(text: string, progress: number): void {
    console.log(`\n${text}`);
    console.log(createProgressBar(progress) + ` ${progress}%`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getAnalysis(): ProjectDashboard | undefined {
    return this.analysis;
  }
}
