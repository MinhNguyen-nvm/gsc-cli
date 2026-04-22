import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { authenticate, getCurrentUser, isAuthenticated } from '../../lib/auth/oauth.js';
import { loadClientSecrets, saveSecretsPath } from '../../lib/config.js';

export default class Login extends Command {
  static description = 'Authenticate with Google Search Console';
  
  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --secrets /path/to/client_secrets.json',
  ];

  static flags = {
    secrets: Flags.string({
      char: 's',
      description: 'Path to OAuth client secrets JSON file (saved to config for future use)',
      helpValue: '<path>',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Login);

    try {
      // Validate secrets file exists before starting OAuth
      await loadClientSecrets(flags.secrets);
      
      // If secrets path provided, save it to config for future use
      if (flags.secrets) {
        await saveSecretsPath(flags.secrets);
        this.log(chalk.gray(`Secrets path saved to config: ${flags.secrets}`));
      }
      
      // Check if already authenticated (only after validating secrets file exists)
      const alreadyAuth = await isAuthenticated();
      if (alreadyAuth) {
        const email = await getCurrentUser();
        this.log(chalk.yellow(`Already authenticated as ${email}`));
        this.log(chalk.gray('Use "gsc auth logout" first if you want to switch accounts'));
        return;
      }
      
      // Start authentication
      await authenticate(flags.secrets);
      this.log(chalk.green('\n✓ Successfully authenticated'));
    } catch (error) {
      this.error(chalk.red(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
}
