/**
 * Add dark mode command implementation
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as path from 'path';
import { analyzeProject, validateProject } from '../../core/scanner.js';
import { transformFiles, applyTransformations, createBackup, updateTailwindConfig } from '../../core/transformer.js';
import { generateThemeToggleComponent, suggestComponentPlacement } from '../../core/generator.js';
import { commitChanges } from '../../utils/git.js';
import { autoPlaceThemeToggle } from '../../core/auto-placement.js';
import { AdaptiveTransformer } from '../../adaptive/adaptive-transformer.js';

export interface AddDarkModeOptions {
  dryRun?: boolean;
  force?: boolean;
  backup?: boolean;
  framework?: string;
  outputPath?: string;
  componentName?: string;
  noCommit?: boolean;
  verbose?: boolean;
  path?: string;
  theme?: string;
  autoPlace?: boolean;
  placement?: 'auto' | 'header' | 'layout' | 'corner';
  adaptive?: boolean;
  archetype?: 'corporate' | 'modern' | 'developer' | 'creative';
  brandColor?: string;
  validate?: boolean;
}

export async function addDarkModeCommand(options: AddDarkModeOptions = {}): Promise<void> {
  // Enable auto-placement by default for better UX
  const defaultOptions = {
    autoPlace: true,
    placement: 'auto' as const,
    ...options
  };
  
  const projectPath = defaultOptions.path || process.cwd();
  const spinner = ora();
  
  // Initialize adaptive transformer if needed
  const adaptiveTransformer = defaultOptions.adaptive ? new AdaptiveTransformer() : null;

  try {
    console.log(chalk.blue.bold('🌙 Crow Agent - Adding Theme Switching Support\n'));

    // Step 1: Validate project
    spinner.start('Validating project...');
    const validation = await validateProject(projectPath);
    
    if (!validation.valid) {
      spinner.fail('Project validation failed');
      for (const error of validation.errors) {
        console.log(chalk.red(`❌ ${error}`));
      }
      process.exit(1);
    }

    if (validation.warnings.length > 0) {
      spinner.warn('Project validation completed with warnings');
      for (const warning of validation.warnings) {
        console.log(chalk.yellow(`⚠️  ${warning}`));
      }
    } else {
      spinner.succeed('Project validation completed');
    }

    // Step 2: Analyze project
    spinner.start('Analyzing project structure...');
    let analysis = await analyzeProject(projectPath);
    spinner.succeed(`Analyzed ${analysis.totalComponents} components`);
    
    // Step 2.5: Enhance with adaptive intelligence if requested
    if (adaptiveTransformer) {
      spinner.start('Applying adaptive intelligence...');
      analysis = await adaptiveTransformer.enhanceAnalysis(analysis, {
        adaptive: defaultOptions.adaptive,
        archetype: defaultOptions.archetype,
        brandColor: defaultOptions.brandColor,
        validate: defaultOptions.validate
      });
      
      if (analysis.designSystem) {
        spinner.succeed(`Detected ${analysis.designSystem.archetype} archetype (${(analysis.designSystem.confidence * 100).toFixed(1)}% confidence)`);
        
        if (defaultOptions.verbose) {
          console.log(chalk.gray(`Design strategy: ${analysis.designSystem.recommendations.darkModeStrategy}`));
          console.log(chalk.gray(`Color treatment: ${analysis.designSystem.recommendations.colorTreatment}`));
        }
      }
    }

    if (options.verbose) {
      console.log(chalk.gray(`Framework: ${analysis.framework}`));
      console.log(chalk.gray(`Transformable components: ${analysis.transformableComponents}`));
      console.log(chalk.gray(`Estimated changes: ${analysis.estimatedChanges}`));
    }

    // Check if already has dark mode
    if (analysis.darkModeEnabled && !options.force) {
      console.log(chalk.yellow('⚠️  Dark mode appears to already be enabled.'));
      console.log(chalk.gray('Use --force to override existing dark mode setup.'));
      return;
    }

    if (analysis.estimatedChanges === 0) {
      console.log(chalk.yellow('⚠️  No transformable Tailwind classes found.'));
      console.log(chalk.gray('The project may already have dark mode or use custom CSS.'));
      if (!options.force) {
        return;
      }
    }

    // Step 3: Create backup if requested
    if (options.backup) {
      const backupDir = path.join(projectPath, '.crow-backup', new Date().toISOString().replace(/[:.]/g, '-'));
      spinner.start('Creating backup...');
      await createBackup(analysis.componentFiles, backupDir);
      spinner.succeed(`Backup created at ${backupDir}`);
    }

    // Step 4: Preview mode
    if (options.dryRun) {
      console.log(chalk.blue('\n📋 Dry Run - No changes will be made\n'));
      
      spinner.start('Analyzing transformations...');
      const transformResults = await transformFiles(analysis.componentFiles, options.theme);
      spinner.succeed('Analysis complete');

      console.log(chalk.green(`\n✅ Would transform ${transformResults.successfulTransformations} files:`));
      
      for (const result of transformResults.results) {
        if (result.success && result.changesCount > 0) {
          const relativePath = path.relative(projectPath, result.filePath);
          console.log(chalk.gray(`  • ${relativePath} (${result.changesCount} changes)`));
          
          if (options.verbose && result.transformedClasses.length > 0) {
            for (const cls of result.transformedClasses.slice(0, 3)) {
              console.log(chalk.gray(`    - "${cls}"`));
            }
            if (result.transformedClasses.length > 3) {
              console.log(chalk.gray(`    ... and ${result.transformedClasses.length - 3} more`));
            }
          }
        }
      }

      // Show component generation plan
      const placement = await suggestComponentPlacement(projectPath, analysis.framework);
      console.log(chalk.green(`\n✅ Would generate theme toggle component at:`));
      console.log(chalk.gray(`  ${placement.suggested}/${options.componentName || 'ThemeToggle'}`));

      const configFile = analysis.tailwindConfigPath || analysis.tailwindCssFile;
      if (configFile) {
        const configType = analysis.tailwindVersion === 'v4' ? 'CSS file' : 'config file';
        const updateType = analysis.tailwindVersion === 'v4' ? 'Add @custom-variant dark' : 'Add darkMode: \'class\'';
        console.log(chalk.green(`\n✅ Would update Tailwind ${configType}:`));
        console.log(chalk.gray(`  ${configFile}`));
        console.log(chalk.gray(`  ${updateType}`));
      }

      console.log(chalk.blue('\nTo apply these changes, run the command without --dry-run'));
      return;
    }

    // Step 5: Transform files
    spinner.start('Transforming component files...');
    const transformResults = await transformFiles(analysis.componentFiles, defaultOptions.theme);
    
    if (transformResults.failedTransformations > 0) {
      spinner.warn(`Transformed ${transformResults.successfulTransformations} files (${transformResults.failedTransformations} failed)`);
      
      if (options.verbose) {
        for (const result of transformResults.results) {
          if (!result.success) {
            const relativePath = path.relative(projectPath, result.filePath);
            console.log(chalk.red(`❌ Failed: ${relativePath} - ${result.error}`));
          }
        }
      }
    } else {
      spinner.succeed(`Transformed ${transformResults.successfulTransformations} files`);
    }

    // Apply transformations to files
    await applyTransformations(transformResults.results);
    
    // Step 5.5: Validate theme quality if adaptive mode and validation requested
    if (adaptiveTransformer && defaultOptions.validate) {
      spinner.start('Validating theme quality...');
      
      try {
        // Create mapping from transformation results for validation
        const generatedMappings: Record<string, string> = {};
        transformResults.results.forEach(result => {
          if (result.success) {
            result.transformedClasses.forEach(cls => {
              generatedMappings[cls] = 'transformed'; // Simplified for validation
            });
          }
        });
        
        const validation = adaptiveTransformer.validateTheme(generatedMappings, analysis);
        
        if (validation.passed) {
          spinner.succeed(`Theme quality validated (${(validation.score * 100).toFixed(1)}% score)`);
        } else {
          spinner.warn(`Theme quality issues detected (${(validation.score * 100).toFixed(1)}% score)`);
          
          if (validation.recommendations.length > 0) {
            console.log(chalk.yellow('\n⚠️ Recommendations:'));
            validation.recommendations.forEach(rec => {
              console.log(chalk.yellow(`   • ${rec}`));
            });
            console.log('');
          }
        }
      } catch (error) {
        spinner.warn(`Theme validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Step 6: Update Tailwind config
    const configFile = analysis.tailwindConfigPath || analysis.tailwindCssFile;
    if (configFile) {
      const configType = analysis.tailwindVersion === 'v4' ? 'CSS file' : 'configuration file';
      spinner.start(`Updating Tailwind ${configType}...`);
      
      const configUpdated = await updateTailwindConfig(
        analysis.tailwindConfigPath, 
        analysis.tailwindCssFile, 
        analysis.tailwindVersion
      );
      
      if (configUpdated) {
        spinner.succeed(`Tailwind ${configType} updated`);
      } else {
        spinner.info(`Tailwind ${configType} already up to date`);
      }
    }

    // Step 7: Generate theme toggle component
    spinner.start('Generating theme toggle component...');
    
    const componentOutputPath = options.outputPath || (await suggestComponentPlacement(projectPath, analysis.framework)).suggested;
    const isTypescript = analysis.componentFiles.some(f => f.path.endsWith('.tsx') || f.path.endsWith('.ts'));
    
    try {
      const component = await generateThemeToggleComponent({
        framework: options.framework as any || analysis.framework,
        outputPath: componentOutputPath,
        componentName: options.componentName,
        typescript: isTypescript,
        overwrite: options.force,
      });

      spinner.succeed(`Generated ${component.framework} component at ${path.relative(projectPath, component.path)}`);
      
      // Step 7.5: Auto-place component if requested
      if (defaultOptions.autoPlace) {
        spinner.start('Auto-placing theme toggle in layout...');
        
        try {
          const autoPlaceResult = await autoPlaceThemeToggle({
            projectPath,
            framework: analysis.framework,
            componentName: component.componentName,
            componentPath: component.path,
            placement: defaultOptions.placement || 'auto'
          });
          
          if (autoPlaceResult.success) {
            const relativePath = path.relative(projectPath, autoPlaceResult.modifiedFile!);
            spinner.succeed(`Auto-placed ${component.componentName} in ${relativePath} (${autoPlaceResult.insertionPoint})`);
          } else {
            spinner.warn(`Auto-placement failed: ${autoPlaceResult.error}`);
            console.log(chalk.yellow('💡 You can manually import and place the component in your layout.'));
          }
        } catch (error) {
          spinner.warn(`Auto-placement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          console.log(chalk.yellow('💡 You can manually import and place the component in your layout.'));
        }
      }
      
      // Show usage instructions only if auto-placement wasn't used or failed
      if (!defaultOptions.autoPlace && (defaultOptions.verbose || transformResults.successfulTransformations === 0)) {
        console.log(chalk.blue('\n📖 Usage Instructions:'));
        for (const instruction of component.instructions) {
          console.log(chalk.gray(`  ${instruction}`));
        }
      }
    } catch (error) {
      spinner.fail(`Failed to generate component: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Step 8: Commit changes
    if (!options.noCommit) {
      spinner.start('Committing changes...');
      
      try {
        const configMethod = analysis.tailwindVersion === 'v4' ? 'CSS custom variants' : 'config-based dark mode';
        const commitMessage = `feat: add theme switching support via crow-agent

- Transform ${transformResults.successfulTransformations} components with dark/light mode variants  
- Update Tailwind ${analysis.tailwindVersion} configuration using ${configMethod}
- Add ThemeToggle component for ${analysis.framework}
- Support ${transformResults.totalChanges} class transformations

Generated by crow-agent v0.2.0`;

        await commitChanges(projectPath, commitMessage);
        spinner.succeed('Changes committed to git');
      } catch (error) {
        spinner.warn('Failed to commit changes (you can commit manually)');
        if (options.verbose) {
          console.log(chalk.gray(`Git error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      }
    }

    // Summary
    console.log(chalk.green.bold('\n🎉 Theme switching successfully added!\n'));
    console.log(chalk.green(`✅ Transformed ${transformResults.successfulTransformations} files`));
    console.log(chalk.green(`✅ Applied ${transformResults.totalChanges} class transformations`));
    console.log(chalk.green(`✅ Generated theme toggle component`));
    
    const summaryConfigFile = analysis.tailwindConfigPath || analysis.tailwindCssFile;
    if (summaryConfigFile) {
      const configType = analysis.tailwindVersion === 'v4' ? 'CSS file' : 'configuration';
      console.log(chalk.green(`✅ Updated Tailwind ${analysis.tailwindVersion} ${configType}`));
    }
    
    if (!options.noCommit) {
      console.log(chalk.green(`✅ Committed changes to git`));
    }

    const versionNote = analysis.tailwindVersion === 'v4' ? ' (v4 compatible!)' : '';
    console.log(chalk.blue(`\n🚀 Your project now supports theme switching${versionNote}`));
    console.log(chalk.gray('Import and use the ThemeToggle component to allow users to switch themes.'));

  } catch (error) {
    spinner.fail('Failed to add dark mode');
    console.log(chalk.red(`\n❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    
    if (options.verbose && error instanceof Error && error.stack) {
      console.log(chalk.gray('\nStack trace:'));
      console.log(chalk.gray(error.stack));
    }
    
    process.exit(1);
  }
}

export function createAddDarkModeCommand(): Command {
  return new Command('add-dark-mode')
    .alias('add')
    .description('Add dark mode support to a Tailwind CSS project')
    .option('--dry-run', 'Preview changes without applying them')
    .option('--force', 'Overwrite existing dark mode setup')
    .option('--backup', 'Create backup before making changes')
    .option('--framework <type>', 'Force framework detection (react|vue|html|nextjs|nuxt)')
    .option('--output <path>', 'Specify output directory for components')
    .option('--component <name>', 'Specify component name (default: ThemeToggle)')
    .option('--no-commit', 'Skip automatic git commit')
    .option('--verbose', 'Enable verbose output')
    .option('--path <path>', 'Project path (default: current directory)')
    .option('--adaptive', 'Use adaptive design system intelligence')
    .option('--archetype <type>', 'Force specific design archetype (corporate|modern|developer|creative)')
    .option('--brand-color <color>', 'Override detected brand color')
    .option('--validate', 'Validate generated theme quality')
    .action(addDarkModeCommand);
}
