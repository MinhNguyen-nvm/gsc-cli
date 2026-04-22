import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { loadConfig, saveSecretsPath, getConfigDir } from '../lib/config.js';

export default class Config extends Command {
  static description = 'View and manage CLI configuration';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --set-secrets /path/to/client_secrets.json',
  ];

  static flags = {
    'set-secrets': Flags.string({
      description: 'Set the OAuth client secrets file path in config',
      helpValue: '<path>',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Config);

    try {
      // Set secrets path if provided
      if (flags['set-secrets']) {
        await saveSecretsPath(flags['set-secrets']);
        this.log(chalk.green(`✓ Secrets path saved: ${flags['set-secrets']}`));
        return;
      }

      // Display current config
      const config = await loadConfig();
      
      this.log(chalk.blue('Current Configuration:'));
      this.log(`  Config directory: ${getConfigDir()}`);
      this.log(`  Secrets path: ${config.auth.clientSecretsPath || chalk.gray('(not set)')}`);
      this.log(`  Token path: ${config.auth.tokenPath}`);
      this.log(`  Default days: ${config.defaults.days}`);
      this.log(`  Default format: ${config.defaults.format}`);
      this.log(`  Default row limit: ${config.defaults.rowLimit}`);
      this.log(`  Data state: ${config.flags.dataState}`);
      
      if (!config.auth.clientSecretsPath) {
        this.log(chalk.yellow('\nTip: Set secrets path with:'));
        this.log(chalk.gray('  gsc config --set-secrets /path/to/client_secrets.json'));
      }
    } catch (error) {
      this.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
}
