import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { GSCClient } from '../../lib/api/client.js';
import { formatInspectionResult, formatJSON } from '../../lib/output/formatter.js';
export default class UrlsInspect extends Command {
    static description = 'Inspect a URL indexing status';
    static examples = [
        '<%= config.bin %> <%= command.id %> --site https://example.com/ --url https://example.com/page',
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
            description: 'URL to inspect',
        }),
        format: Flags.string({
            char: 'f',
            options: ['table', 'json'],
            default: 'table',
            description: 'Output format',
        }),
    };
    async run() {
        const { flags } = await this.parse(UrlsInspect);
        try {
            const client = await GSCClient.create();
            console.error(chalk.blue(`Inspecting ${flags.url}...`));
            const result = await client.inspectUrl(flags.site, flags.url);
            const output = flags.format === 'json'
                ? formatJSON(result)
                : formatInspectionResult(result);
            this.log(output);
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
//# sourceMappingURL=inspect.js.map