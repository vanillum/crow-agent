/**
 * Interactive dashboard for project analysis and status
 */

import chalk from 'chalk';
import ora from 'ora';
import { CROW_LOGO, createProgressBar, formatStatus, DIVIDER } from './branding.js';
import { analyzeProject, ProjectAnalysis } from '../../core/scanner.js';

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
    console.log(chalk.yellow('🌙 Crow Agent v0.4.0 - Professional Edition\n'));
  }

  async analyzeProject(): Promise<ProjectDashboard> {
    const spinner = ora({
      text: 'Analyzing your project...',
      color: 'yellow'
    }).start();

    try {
      // Update spinner text for real analysis steps
      spinner.text = 'Detecting framework and configuration...';
      
      // Use real project analysis
      const realAnalysis: ProjectAnalysis = await analyzeProject(this.projectPath);
      
      spinner.text = 'Analyzing components...';
      
      // Convert real analysis to dashboard format
      this.analysis = this.convertAnalysisToDashboard(realAnalysis);

      spinner.succeed('Project analysis complete!');
      return this.analysis;
    } catch (error) {
      spinner.fail('Analysis failed');
      throw error;
    }
  }

  private convertAnalysisToDashboard(realAnalysis: ProjectAnalysis): ProjectDashboard {
    // Generate framework display string
    let frameworkDisplay: string = realAnalysis.framework;
    if (realAnalysis.framework === 'nextjs') {
      frameworkDisplay = 'Next.js';
    } else if (realAnalysis.framework === 'react') {
      frameworkDisplay = 'React';
    } else if (realAnalysis.framework === 'vue') {
      frameworkDisplay = 'Vue.js';
    } else if (realAnalysis.framework === 'nuxt') {
      frameworkDisplay = 'Nuxt.js';
    } else if (realAnalysis.framework === 'html') {
      frameworkDisplay = 'HTML/Vanilla JS';
    }

    // Add TypeScript detection if package.json exists
    if (realAnalysis.hasPackageJson && realAnalysis.framework !== 'html') {
      frameworkDisplay += ' + TypeScript';
    }

    // Generate recommendations based on real analysis
    const recommendations: string[] = [];
    
    if (realAnalysis.hasTailwindConfig && !realAnalysis.darkModeEnabled) {
      recommendations.push('Ready for theme switching implementation');
    }
    
    if (realAnalysis.transformableComponents > 0) {
      recommendations.push('Components are compatible for transformation');
    }
    
    if (realAnalysis.tailwindVersion === 'v4') {
      recommendations.push('Tailwind v4 detected - CSS-based configuration supported!');
    } else if (realAnalysis.tailwindVersion === 'v3') {
      recommendations.push('Tailwind v3 detected - config-based setup will be used');
    }
    
    if (realAnalysis.darkModeEnabled) {
      recommendations.push('Dark mode is already configured in this project');
    }

    return {
      framework: frameworkDisplay,
      hasTailwind: realAnalysis.hasTailwindConfig,
      hasThemeSwitching: realAnalysis.darkModeEnabled,
      tailwindVersion: realAnalysis.tailwindVersion,
      componentCount: realAnalysis.totalComponents,
      transformableComponents: realAnalysis.transformableComponents,
      estimatedChanges: realAnalysis.estimatedChanges,
      recommendations
    };
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
