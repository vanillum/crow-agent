/**
 * Theme validation command
 */

import chalk from 'chalk';
import ora from 'ora';
import { generateThemeQualityReport, validateAllThemes } from '../../themes/validator.js';

export interface ValidateThemesOptions {
  verbose?: boolean;
  json?: boolean;
  theme?: string;
}

export async function validateThemesCommand(options: ValidateThemesOptions = {}): Promise<void> {
  const spinner = ora('Validating theme quality...').start();

  try {
    const results = validateAllThemes();
    spinner.succeed('Theme validation complete');

    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
      return;
    }

    // Display results
    console.log(chalk.cyan.bold('\n🎨 Theme Quality Assessment\n'));
    
    results.forEach((result, index) => {
      const gradeColor = result.grade.startsWith('A') ? chalk.green : 
                        result.grade.startsWith('B') ? chalk.yellow : 
                        result.grade.startsWith('C') ? chalk.hex('#FFA500') : chalk.red;
      
      console.log(chalk.white.bold(`${index + 1}. ${result.theme.name}`));
      console.log(chalk.gray(`   ${result.theme.description}`));
      console.log(`   Score: ${gradeColor(result.score + '%')} (${gradeColor(result.grade)})`);
      console.log(`   Status: ${result.passed ? chalk.green('✅ PASSED') : chalk.red('❌ NEEDS IMPROVEMENT')}`);
      
      if (options.verbose && result.issues.length > 0) {
        console.log(chalk.white('   Issues:'));
        result.issues.forEach(issue => {
          const icon = issue.severity === 'error' ? chalk.red('🔴') : 
                      issue.severity === 'warning' ? chalk.yellow('🟡') : chalk.blue('🔵');
          console.log(`     ${icon} ${issue.message}`);
          if (issue.suggestion) {
            console.log(chalk.gray(`       💡 ${issue.suggestion}`));
          }
        });
      }
      
      if (options.verbose && result.suggestions.length > 0) {
        console.log(chalk.white('   Top Suggestions:'));
        result.suggestions.slice(0, 2).forEach(suggestion => {
          console.log(chalk.gray(`     • ${suggestion}`));
        });
      }
      
      console.log('');
    });

    // Summary
    const totalThemes = results.length;
    const passedThemes = results.filter(r => r.passed).length;
    const averageScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / totalThemes);
    
    console.log(chalk.cyan.bold('📊 Summary:'));
    console.log(`   Total themes: ${totalThemes}`);
    console.log(`   Passed: ${chalk.green(passedThemes)} / Failed: ${chalk.red(totalThemes - passedThemes)}`);
    console.log(`   Average score: ${chalk.yellow(averageScore + '%')}`);

    if (options.verbose) {
      console.log(chalk.gray('\nFor detailed analysis, run: crow validate-themes --verbose'));
    }

  } catch (error) {
    spinner.fail('Theme validation failed');
    console.error(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    process.exit(1);
  }
}
