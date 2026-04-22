import { Command, Flags } from '@oclif/core';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import { GSCClient } from '../../lib/api/client.js';
import { formatPerformanceOverview, formatJSON } from '../../lib/output/formatter.js';
export default class AnalyticsOverview extends Command {
    static description = 'Get performance overview with daily trends';
    static examples = [
        '<%= config.bin %> <%= command.id %> --site https://example.com/',
        '<%= config.bin %> <%= command.id %> --site https://example.com/ --days 7',
    ];
    static flags = {
        site: Flags.string({
            char: 's',
            required: true,
            description: 'GSC property URL',
        }),
        days: Flags.integer({
            char: 'd',
            default: 28,
            description: 'Number of days to look back',
        }),
        format: Flags.string({
            char: 'f',
            options: ['table', 'json'],
            default: 'table',
            description: 'Output format',
        }),
        output: Flags.string({
            char: 'o',
            description: 'Output file path (default: stdout)',
        }),
    };
    async run() {
        const { flags } = await this.parse(AnalyticsOverview);
        try {
            const client = await GSCClient.create();
            console.error(chalk.blue(`Fetching overview for ${flags.site}...`));
            const data = await client.getPerformanceOverview(flags.site, flags.days);
            const output = flags.format === 'json'
                ? formatJSON(data)
                : formatPerformanceOverview(data);
            if (flags.output) {
                await fs.writeFile(flags.output, output);
                this.log(chalk.green(`✓ Saved to ${flags.output}`));
            }
            else {
                this.log(output);
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
//# sourceMappingURL=overview.js.map