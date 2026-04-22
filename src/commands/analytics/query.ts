import { Command, Flags } from '@oclif/core';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import { GSCClient } from '../../lib/api/client.js';
import { formatOutput } from '../../lib/output/formatter.js';

export default class AnalyticsQuery extends Command {
  static description = 'Query search analytics data';
  
  static examples = [
    '<%= config.bin %> <%= command.id %> --site https://example.com/',
    '<%= config.bin %> <%= command.id %> --site https://example.com/ --days 7 --format table',
    '<%= config.bin %> <%= command.id %> --site https://example.com/ --dimensions query,page --limit 50',
    '<%= config.bin %> <%= command.id %> --site https://example.com/ --filter "query contains seo"',
  ];

  static flags = {
    site: Flags.string({
      char: 's',
      required: true,
      description: 'GSC property URL (use "gsc sites list" to see available sites)',
    }),
    days: Flags.integer({
      char: 'd',
      default: 28,
      description: 'Number of days to look back',
    }),
    dimensions: Flags.string({
      default: 'query',
      description: 'Comma-separated dimensions: query, page, country, device, date',
    }),
    limit: Flags.integer({
      char: 'l',
      default: 20,
      description: 'Number of rows to return (max 500)',
    }),
    filter: Flags.string({
      description: 'Filter in format: "dimension operator expression" (e.g., "query contains seo")',
    }),
    format: Flags.string({
      char: 'f',
      options: ['json', 'csv', 'table'],
      default: 'table',
      description: 'Output format',
    }),
    output: Flags.string({
      char: 'o',
      description: 'Output file path (default: stdout)',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(AnalyticsQuery);

    try {
      const client = await GSCClient.create();

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - flags.days);

      // Parse dimensions
      const dimensionList = flags.dimensions.split(',').map(d => d.trim() as 'query' | 'page' | 'country' | 'device' | 'date');

      // Parse filter if provided
      let filters;
      if (flags.filter) {
        const filterParts = flags.filter.match(/^(\w+)\s+(contains|equals|notContains|notEquals)\s+(.+)$/i);
        if (!filterParts) {
          this.error(chalk.red('Invalid filter format. Use: "dimension operator expression"'));
          return;
        }
        const [, dimension, operator, expression] = filterParts;
        filters = [{
          dimension: dimension as 'query' | 'page' | 'country' | 'device',
          operator: operator as 'contains' | 'equals' | 'notContains' | 'notEquals',
          expression,
        }];
      }

      // Print status to stderr so it doesn't contaminate JSON/CSV output
      console.error(chalk.blue(`Fetching analytics for ${flags.site}...`));

      const data = await client.getAnalytics({
        siteUrl: flags.site,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        dimensions: dimensionList,
        filters,
        rowLimit: Math.min(flags.limit, 500),
      });

      if (data.rowCount === 0) {
        this.log(chalk.yellow('No data found for the specified period'));
        return;
      }

      const output = formatOutput(data, flags.format as 'json' | 'csv' | 'table', { dimensions: dimensionList });

      if (flags.output) {
        await fs.writeFile(flags.output, output);
        this.log(chalk.green(`✓ Saved to ${flags.output}`));
      } else {
        this.log(output);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('404')) {
        this.error(chalk.red(
          `Site not found: ${flags.site}\n\n` +
          'Possible causes:\n' +
          '1. The site URL doesn\'t match exactly what\'s in GSC\n' +
          '2. Run "gsc sites list" to see the exact URL to use\n' +
          '3. You may not have access to this property'
        ));
      } else {
        this.error(chalk.red(`Error: ${message}`));
      }
    }
  }
}
