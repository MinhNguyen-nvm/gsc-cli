import { Command } from '@oclif/core';
import chalk from 'chalk';
import { getTokenInfo } from '../../lib/auth/oauth.js';
import { getConfigDir } from '../../lib/config.js';

export default class Status extends Command {
  static description = 'Show authentication status';
  
  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ];

  async run(): Promise<void> {
    const info = await getTokenInfo();
    
    if (!info) {
      this.log(chalk.yellow('Not authenticated'));
      this.log(chalk.gray('\nTo authenticate, run:'));
      this.log(chalk.gray('  gsc auth login'));
      return;
    }

    this.log(chalk.green('✓ Authenticated'));
    this.log(`  Account: ${info.email || 'Unknown'}`);
    
    if (info.expiry) {
      const now = new Date();
      const isExpired = info.expiry < now;
      const timeStr = info.expiry.toLocaleString();
      
      if (isExpired) {
        this.log(chalk.red(`  Token expired: ${timeStr}`));
        this.log(chalk.gray('  Run "gsc auth login" to re-authenticate'));
      } else {
        this.log(`  Token expires: ${timeStr}`);
      }
    }

    this.log(chalk.gray(`\nConfig directory: ${getConfigDir()}`));
  }
}
