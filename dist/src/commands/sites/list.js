import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { GSCClient } from '../../lib/api/client.js';
import { formatSitesTable, formatJSON } from '../../lib/output/formatter.js';
export default class SitesList extends Command {
    static description = 'List all Google Search Console properties';
    static examples = [
        '<%= config.bin %> <%= command.id %>',
        '<%= config.bin %> <%= command.id %> --format json',
    ];
    static flags = {
        format: Flags.string({
            char: 'f',
            options: ['table', 'json'],
            default: 'table',
            description: 'Output format',
        }),
    };
    async run() {
        const { flags } = await this.parse(SitesList);
        try {
            const client = await GSCClient.create();
            const sites = await client.listSites();
            if (sites.length === 0) {
                this.log(chalk.yellow('No Search Console properties found'));
                this.log(chalk.gray('\nTo add a property:'));
                this.log(chalk.gray('  1. Visit https://search.google.com/search-console'));
                this.log(chalk.gray('  2. Click "Add property"'));
                this.log(chalk.gray('  3. Verify ownership'));
                return;
            }
            if (flags.format === 'json') {
                this.log(formatJSON({ count: sites.length, sites }));
            }
            else {
                this.log(formatSitesTable(sites));
                this.log(chalk.gray(`\nTotal: ${sites.length} properties`));
            }
        }
        catch (error) {
            this.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
        }
    }
}
//# sourceMappingURL=list.js.map