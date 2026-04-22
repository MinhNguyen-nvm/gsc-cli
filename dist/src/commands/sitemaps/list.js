import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { GSCClient } from '../../lib/api/client.js';
import { formatSitemapsTable, formatJSON } from '../../lib/output/formatter.js';
export default class SitemapsList extends Command {
    static description = 'List all sitemaps for a property';
    static examples = [
        '<%= config.bin %> <%= command.id %> --site https://example.com/',
    ];
    static flags = {
        site: Flags.string({
            char: 's',
            required: true,
            description: 'GSC property URL',
        }),
        format: Flags.string({
            char: 'f',
            options: ['table', 'json'],
            default: 'table',
            description: 'Output format',
        }),
    };
    async run() {
        const { flags } = await this.parse(SitemapsList);
        try {
            const client = await GSCClient.create();
            console.error(chalk.blue(`Fetching sitemaps for ${flags.site}...`));
            const sitemaps = await client.listSitemaps(flags.site);
            if (sitemaps.length === 0) {
                this.log(chalk.yellow('No sitemaps found'));
                this.log(chalk.gray('\nTo submit a sitemap:'));
                this.log(chalk.gray('  gsc sitemaps submit --site <site> --url <sitemap-url>'));
                return;
            }
            if (flags.format === 'json') {
                this.log(formatJSON({ count: sitemaps.length, sitemaps }));
            }
            else {
                this.log(formatSitemapsTable(sitemaps));
                this.log(chalk.gray(`\nTotal: ${sitemaps.length} sitemaps`));
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (message.includes('404')) {
                this.error(chalk.red(`Site not found: ${flags.site}`));
            }
            else {
                this.error(chalk.red(`Error: ${message}`));
            }
        }
    }
}
//# sourceMappingURL=list.js.map