import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { GSCClient } from '../../lib/api/client.js';

export default class SitemapsSubmit extends Command {
  static description = 'Submit a sitemap to Google';
  
  static examples = [
    '<%= config.bin %> <%= command.id %> --site https://example.com/ --url https://example.com/sitemap.xml',
  ];

  static flags = {
    site: Flags.string({
      char: 's',
      required: true,
      description: 'GSC property URL',
    }),
    url: Flags.string({
      char: 'u',
      required: true,
      description: 'Sitemap URL to submit',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(SitemapsSubmit);

    try {
      const client = await GSCClient.create();

      this.log(chalk.blue(`Submitting sitemap: ${flags.url}...`));

      await client.submitSitemap(flags.site, flags.url);

      this.log(chalk.green('✓ Sitemap submitted successfully'));
      this.log(chalk.gray('Note: Google may take some time to process the sitemap'));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('404')) {
        this.error(chalk.red(`Site not found: ${flags.site}`));
      } else if (message.includes('403')) {
        this.error(chalk.red('Permission denied. You may not have owner access to this property.'));
      } else {
        this.error(chalk.red(`Error: ${message}`));
      }
    }
  }
}
