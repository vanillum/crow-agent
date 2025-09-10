/**
 * Status command implementation
 */

import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs/promises';
import { analyzeProject } from '../../core/scanner.js';

export interface StatusOptions {
  path?: string;
  json?: boolean;
}

export async function statusCommand(options: StatusOptions = {}): Promise<void> {
  const projectPath = options.path || process.cwd();

  try {
    const analysis = await analyzeProject(projectPath);
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    let projectName = 'Unknown';
    let version = 'Unknown';
    
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      projectName = packageJson.name || 'Unknown';
      version = packageJson.version || 'Unknown';
    } catch {
      // Package.json doesn't exist or can't be read
    }

    const status = {
      project: {
        name: projectName,
        version,
        path: projectPath,
      },
      framework: analysis.framework,
      tailwind: {
        configured: analysis.hasTailwindConfig,
        configPath: analysis.tailwindConfigPath,
        darkModeEnabled: analysis.darkModeEnabled,
      },
      components: {
        total: analysis.totalComponents,
        withTailwindClasses: analysis.componentFiles.filter(f => f.hasClasses).length,
        transformable: analysis.transformableComponents,
        estimatedChanges: analysis.estimatedChanges,
      },
      crowAgent: {
        compatible: analysis.transformableComponents > 0 || analysis.framework !== 'unknown',
        ready: analysis.hasTailwindConfig && (analysis.transformableComponents > 0 || analysis.darkModeEnabled),
        status: getDarkModeStatus(analysis),
      },
    };

    if (options.json) {
      console.log(JSON.stringify(status, null, 2));
      return;
    }

    // Display formatted status
    console.log(chalk.blue.bold('📋 Project Status\n'));

    // Project info
    console.log(chalk.green('Project:'));
    console.log(`  Name: ${chalk.white(status.project.name)}`);
    console.log(`  Version: ${chalk.white(status.project.version)}`);
    console.log(`  Path: ${chalk.gray(status.project.path)}`);

    // Framework detection
    console.log(chalk.green('\nFramework:'));
    console.log(`  Type: ${chalk.white(status.framework)}`);
    
    const frameworkStatus = status.framework !== 'unknown' ? chalk.green('✓') : chalk.yellow('?');
    console.log(`  Detected: ${frameworkStatus}`);

    // Tailwind status
    console.log(chalk.green('\nTailwind CSS:'));
    console.log(`  Configured: ${status.tailwind.configured ? chalk.green('✓') : chalk.red('✗')}`);
    
    if (status.tailwind.configPath) {
      const relativePath = path.relative(projectPath, status.tailwind.configPath);
      console.log(`  Config: ${chalk.gray(relativePath)}`);
    }
    
    console.log(`  Dark Mode: ${status.tailwind.darkModeEnabled ? chalk.green('Enabled') : chalk.yellow('Disabled')}`);

    // Component analysis
    console.log(chalk.green('\nComponents:'));
    console.log(`  Total Found: ${chalk.white(status.components.total)}`);
    console.log(`  With Classes: ${chalk.white(status.components.withTailwindClasses)}`);
    console.log(`  Transformable: ${chalk.white(status.components.transformable)}`);
    console.log(`  Potential Changes: ${chalk.white(status.components.estimatedChanges)}`);

    // Crow Agent status
    console.log(chalk.green('\nCrow Agent Status:'));
    console.log(`  Compatible: ${status.crowAgent.compatible ? chalk.green('✓') : chalk.yellow('Limited')}`);
    console.log(`  Ready: ${status.crowAgent.ready ? chalk.green('✓') : chalk.yellow('Partial')}`);
    console.log(`  Status: ${getStatusColor(status.crowAgent.status)}${status.crowAgent.status}${chalk.reset()}`);

    // Recommendations
    console.log(chalk.blue('\n💡 Next Steps:'));
    
    if (!status.tailwind.configured) {
      console.log(chalk.red('  ❌ This doesn\'t appear to be a Tailwind CSS project'));
      console.log(chalk.gray('     Ensure tailwind.config.js exists and is properly configured'));
    } else if (status.crowAgent.status === 'Ready') {
      console.log(chalk.green('  🚀 Ready to add dark mode!'));
      console.log(chalk.gray('     Run: crow "add dark mode"'));
    } else if (status.crowAgent.status === 'Already Configured') {
      console.log(chalk.green('  ✅ Dark mode appears to be already configured'));
      console.log(chalk.gray('     Use --force flag to reconfigure if needed'));
    } else if (status.components.transformable === 0) {
      console.log(chalk.yellow('  ⚠️  No transformable components found'));
      console.log(chalk.gray('     You can still generate a theme toggle component'));
      console.log(chalk.gray('     Run: crow "add dark mode --force"'));
    } else {
      console.log(chalk.blue('  📊 Run analysis for more details:'));
      console.log(chalk.gray('     crow "scan project --verbose"'));
    }

  } catch (error) {
    if (options.json) {
      console.log(JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, null, 2));
    } else {
      console.log(chalk.red(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }
}

function getDarkModeStatus(analysis: any): string {
  if (analysis.darkModeEnabled) {
    return 'Already Configured';
  } else if (analysis.transformableComponents > 0) {
    return 'Ready';
  } else if (analysis.hasTailwindConfig) {
    return 'Partial';
  } else {
    return 'Not Compatible';
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Ready':
      return chalk.green('');
    case 'Already Configured':
      return chalk.blue('');
    case 'Partial':
      return chalk.yellow('');
    case 'Not Compatible':
      return chalk.red('');
    default:
      return chalk.gray('');
  }
}

export function createStatusCommand(): Command {
  return new Command('status')
    .description('Show current project status and dark mode readiness')
    .option('--json', 'Output status in JSON format')
    .option('--path <path>', 'Project path (default: current directory)')
    .action(statusCommand);
}
