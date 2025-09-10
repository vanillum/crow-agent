/**
 * Scan command implementation
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import { analyzeProject, validateProject } from '../../core/scanner.js';

export interface ScanOptions {
  verbose?: boolean;
  path?: string;
  json?: boolean;
}

export async function scanCommand(options: ScanOptions = {}): Promise<void> {
  const projectPath = options.path || process.cwd();
  const spinner = ora();

  try {
    console.log(chalk.blue.bold('🔍 Crow Agent - Project Analysis\n'));

    // Validate project
    spinner.start('Validating project...');
    const validation = await validateProject(projectPath);
    
    if (!validation.valid) {
      spinner.fail('Project validation failed');
      for (const error of validation.errors) {
        console.log(chalk.red(`❌ ${error}`));
      }
      
      if (options.json) {
        console.log(JSON.stringify({ valid: false, errors: validation.errors }, null, 2));
      }
      return;
    }

    spinner.succeed('Project validation completed');

    // Analyze project
    spinner.start('Analyzing project...');
    const analysis = await analyzeProject(projectPath);
    spinner.succeed('Analysis completed');

    if (options.json) {
      console.log(JSON.stringify(analysis, null, 2));
      return;
    }

    // Display analysis results
    console.log(chalk.green.bold('\n📊 Project Analysis Results\n'));

    // Basic info
    console.log(chalk.blue('Framework Detection:'));
    console.log(`  Framework: ${chalk.white(analysis.framework)}`);
    console.log(`  Package.json: ${analysis.hasPackageJson ? chalk.green('✓') : chalk.red('✗')}`);
    console.log(`  Tailwind Config: ${analysis.hasTailwindConfig ? chalk.green('✓') : chalk.red('✗')}`);
    if (analysis.tailwindConfigPath) {
      console.log(`  Config Path: ${chalk.gray(path.relative(projectPath, analysis.tailwindConfigPath))}`);
    }

    console.log(chalk.blue('\nDark Mode Status:'));
    console.log(`  Currently Enabled: ${analysis.darkModeEnabled ? chalk.green('✓') : chalk.yellow('✗')}`);

    console.log(chalk.blue('\nComponent Analysis:'));
    console.log(`  Total Components: ${chalk.white(analysis.totalComponents)}`);
    console.log(`  Transformable: ${chalk.white(analysis.transformableComponents)} (${analysis.totalComponents > 0 ? Math.round((analysis.transformableComponents / analysis.totalComponents) * 100) : 0}%)`);
    console.log(`  Estimated Changes: ${chalk.white(analysis.estimatedChanges)}`);

    if (analysis.transformableComponents === 0 && analysis.totalComponents > 0) {
      console.log(chalk.yellow('\n⚠️  No transformable components found. This could mean:'));
      console.log(chalk.gray('  • Dark mode is already implemented'));
      console.log(chalk.gray('  • Components use custom CSS instead of Tailwind'));
      console.log(chalk.gray('  • Components use non-standard class naming'));
    }

    // Detailed component breakdown
    if (options.verbose && analysis.componentFiles.length > 0) {
      console.log(chalk.blue('\n📁 Component Files:'));
      
      const sortedFiles = [...analysis.componentFiles].sort((a, b) => b.transformableClasses - a.transformableClasses);
      
      for (const file of sortedFiles) {
        const relativePath = path.relative(projectPath, file.path);
        const transformableRatio = file.totalClasses > 0 ? Math.round((file.transformableClasses / file.totalClasses) * 100) : 0;
        
        if (file.transformableClasses > 0) {
          console.log(chalk.green(`  ✓ ${relativePath}`));
          console.log(chalk.gray(`    Classes: ${file.totalClasses}, Transformable: ${file.transformableClasses} (${transformableRatio}%)`));
          
          if (file.analysis?.transformable && file.analysis.transformable.length > 0) {
            const sampleClasses = file.analysis.transformable.slice(0, 3);
            console.log(chalk.gray(`    Sample: ${sampleClasses.map(c => `"${c}"`).join(', ')}`));
            if (file.analysis.transformable.length > 3) {
              console.log(chalk.gray(`    ... and ${file.analysis.transformable.length - 3} more`));
            }
          }
        } else if (file.totalClasses > 0) {
          console.log(chalk.yellow(`  ~ ${relativePath}`));
          console.log(chalk.gray(`    Classes: ${file.totalClasses}, Non-transformable: ${file.totalClasses}`));
        } else {
          console.log(chalk.gray(`  - ${relativePath} (no Tailwind classes found)`));
        }
      }
    }

    // Validation warnings
    if (validation.warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  Warnings:'));
      for (const warning of validation.warnings) {
        console.log(chalk.yellow(`  • ${warning}`));
      }
    }

    // Recommendations
    console.log(chalk.blue('\n💡 Recommendations:'));
    
    if (analysis.transformableComponents > 0) {
      console.log(chalk.green('  ✓ Ready for dark mode implementation'));
      console.log(chalk.gray('  Run: crow "add dark mode" to proceed'));
    } else if (analysis.darkModeEnabled) {
      console.log(chalk.green('  ✓ Dark mode appears to be already configured'));
    } else if (analysis.totalComponents === 0) {
      console.log(chalk.yellow('  ! No components found - ensure this is a frontend project'));
    } else {
      console.log(chalk.yellow('  ? No obvious transformations needed'));
      console.log(chalk.gray('  You can still generate a theme toggle component'));
    }

    if (!analysis.hasTailwindConfig) {
      console.log(chalk.red('  ✗ No Tailwind configuration found'));
      console.log(chalk.gray('  Ensure this project uses Tailwind CSS'));
    }

    // Framework-specific recommendations
    switch (analysis.framework) {
      case 'react':
      case 'nextjs':
        console.log(chalk.blue('\n🔧 Next Steps for React:'));
        console.log(chalk.gray('  1. Run crow "add dark mode" to transform components'));
        console.log(chalk.gray('  2. Import and use the generated ThemeToggle component'));
        console.log(chalk.gray('  3. Add the toggle to your app header or navigation'));
        break;
        
      case 'vue':
      case 'nuxt':
        console.log(chalk.blue('\n🔧 Next Steps for Vue:'));
        console.log(chalk.gray('  1. Run crow "add dark mode" to transform components'));
        console.log(chalk.gray('  2. Import and register the generated ThemeToggle component'));
        console.log(chalk.gray('  3. Add <ThemeToggle /> to your app layout'));
        break;
        
      case 'html':
        console.log(chalk.blue('\n🔧 Next Steps for HTML:'));
        console.log(chalk.gray('  1. Run crow "add dark mode" to transform HTML files'));
        console.log(chalk.gray('  2. Include the generated theme-toggle.js script'));
        console.log(chalk.gray('  3. Add data-theme-toggle elements where needed'));
        break;
        
      case 'unknown':
        console.log(chalk.yellow('\n🔧 Framework Unknown:'));
        console.log(chalk.gray('  The tool will use generic transformations'));
        console.log(chalk.gray('  Specify framework with --framework flag if needed'));
        break;
    }

  } catch (error) {
    spinner.fail('Analysis failed');
    
    if (options.json) {
      console.log(JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, null, 2));
    } else {
      console.log(chalk.red(`\n❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
    
    if (options.verbose && error instanceof Error && error.stack) {
      console.log(chalk.gray('\nStack trace:'));
      console.log(chalk.gray(error.stack));
    }
  }
}

export function createScanCommand(): Command {
  return new Command('scan')
    .description('Analyze project for dark mode compatibility')
    .option('--verbose', 'Enable verbose output with detailed file analysis')
    .option('--json', 'Output results in JSON format')
    .option('--path <path>', 'Project path (default: current directory)')
    .action(scanCommand);
}
