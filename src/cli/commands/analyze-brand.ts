/**
 * Brand analysis command
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { SmartThemeRecommender } from '../../adaptive/smart-recommender.js';
import { analyzeProject } from '../../core/scanner.js';

export interface AnalyzeBrandOptions {
  path?: string;
  verbose?: boolean;
}

export async function analyzeBrandCommand(options: AnalyzeBrandOptions = {}): Promise<void> {
  const projectPath = options.path || process.cwd();
  const spinner = ora();

  try {
    console.log(chalk.blue.bold('🎨 Crow Agent - Brand Color Analysis\n'));

    // Step 1: Analyze project
    spinner.start('Analyzing project structure...');
    const analysis = await analyzeProject(projectPath);
    spinner.succeed(`Analyzed ${analysis.totalComponents} components`);

    // Step 2: Extract brand colors and get theme recommendations
    const smartRecommender = new SmartThemeRecommender();
    spinner.start('🧠 Extracting brand colors...');
    
    const recommendation = await smartRecommender.recommendTheme(projectPath, analysis);
    spinner.succeed('Brand analysis complete');

    // Display results
    console.log(chalk.green.bold('\n🎨 Brand Color Profile\n'));
    
    if (recommendation.brandProfile.primary) {
      const primary = recommendation.brandProfile.primary;
      console.log(chalk.blue(`Primary: ${primary.color} (${primary.usage} uses, ${(primary.saturation * 100).toFixed(1)}% saturation)`));
      
      if (recommendation.brandProfile.secondary) {
        const secondary = recommendation.brandProfile.secondary;
        console.log(chalk.blue(`Secondary: ${secondary.color} (${secondary.usage} uses)`));
      }
      
      if (recommendation.brandProfile.accent) {
        const accent = recommendation.brandProfile.accent;
        console.log(chalk.blue(`Accent: ${accent.color} (${accent.usage} uses)`));
      }
    } else {
      console.log(chalk.gray('No strong brand colors detected (using neutral palette)'));
    }
    
    console.log(chalk.blue(`Temperature: ${recommendation.brandProfile.temperature}`));
    console.log(chalk.blue(`Confidence: ${(recommendation.brandProfile.confidence * 100).toFixed(1)}%`));
    
    // Display theme compatibility
    console.log(chalk.green.bold('\n🎯 Theme Compatibility Analysis\n'));
    
    const allScores = [recommendation.recommended, ...recommendation.alternatives];
    allScores.forEach((theme, index) => {
      const isRecommended = index === 0;
      const prefix = isRecommended ? '🏆' : '  ';
      const style = isRecommended ? chalk.green.bold : chalk.gray;
      
      console.log(style(`${prefix} ${theme.themeName.padEnd(25)} ${(theme.score * 100).toFixed(1)}%`));
      
      if (options.verbose || isRecommended) {
        theme.reasoning.forEach(reason => {
          console.log(style(`     • ${reason}`));
        });
        if (index < allScores.length - 1) console.log('');
      }
    });
    
    // Show next steps
    console.log(chalk.yellow.bold('\n🚀 Next Steps\n'));
    console.log(chalk.gray(`To apply the recommended theme:`));
    console.log(chalk.white(`crow "add dark mode with ${recommendation.recommended.themeId} theme"`));
    console.log('');
    console.log(chalk.gray(`For automatic application:`));
    console.log(chalk.white(`crow "perfect dark mode"`));

  } catch (error) {
    spinner.fail('Brand analysis failed');
    console.log(chalk.red(`\n❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    process.exit(1);
  }
}

export function createAnalyzeBrandCommand(): Command {
  return new Command('analyze-brand')
    .alias('brand')
    .description('🎨 Analyze brand colors and get theme recommendations')
    .option('--path <path>', 'Project path (default: current directory)')
    .option('--verbose', 'Show detailed analysis')
    .action(analyzeBrandCommand);
}
