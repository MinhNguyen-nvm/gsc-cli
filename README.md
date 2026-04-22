# GSC CLI

A powerful command-line interface for Google Search Console. Query analytics data, inspect URLs, manage sitemaps, and more.

## Features

- **Authentication**: OAuth 2.0 with secure token storage
- **Analytics**: Query search performance with flexible dimensions and filters
- **URL Inspection**: Check indexing status and rich results
- **Sitemaps**: List, submit, and manage sitemaps
- **Multiple Output Formats**: Table (default), JSON, CSV

## Installation

```bash
# Clone or download the repository
cd gsc-cli

# Install dependencies
npm install

# Build the project
npm run build

# Link for global usage (optional)
npm link
```

## Quick Start

### 1. Set up Google Cloud credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Search Console API**
4. Go to **Credentials** → **Create OAuth 2.0 Client ID** (Desktop app type)
5. Download the JSON and save as `client_secrets.json` in your working directory

### 2. Configure and Authenticate

```bash
# Set secrets path in config (one time setup)
gsc config --set-secrets /path/to/client_secrets.json

# Authenticate
gsc auth:login --secrets /path/to/client_secrets.json
```

This will open your browser for Google authentication. The token is saved securely for future use at `~/.config/gsc-cli/`.

### 3. Start using

```bash
# List your GSC properties
gsc sites list

# Query analytics
gsc analytics query --site https://example.com/ --days 28

# Check URL indexing status
gsc urls inspect --site https://example.com/ --url https://example.com/page
```

## Commands

### Authentication

```bash
gsc auth login      # Authenticate with Google
gsc auth logout     # Remove stored credentials
gsc auth status     # Show current authentication status
```

### Sites

```bash
gsc sites list                      # List all GSC properties
gsc sites list --format json        # Output as JSON
```

### Analytics

```bash
# Basic query (top queries, last 28 days)
gsc analytics query --site https://example.com/

# Last 7 days with page breakdown
gsc analytics query --site https://example.com/ --days 7 --dimensions page

# Filter for specific queries
gsc analytics query --site https://example.com/ --filter "query contains product"

# Export to CSV
gsc analytics query --site https://example.com/ --format csv --output report.csv

# Get performance overview with daily trends
gsc analytics overview --site https://example.com/ --days 14
```

**Analytics Options:**
- `--site, -s` (required): GSC property URL
- `--days, -d`: Number of days to look back (default: 28)
- `--dimensions`: Comma-separated dimensions: query, page, country, device, date (default: query)
- `--limit, -l`: Number of rows to return, max 500 (default: 20)
- `--filter`: Filter in format: "dimension operator expression" (operators: contains, equals, notContains, notEquals)
- `--format, -f`: Output format: table, json, csv (default: table)
- `--output, -o`: Output file path (default: stdout)

### URL Inspection

```bash
# Inspect a single URL
gsc urls inspect --site https://example.com/ --url https://example.com/page

# JSON output for scripting
gsc urls inspect --site https://example.com/ --url https://example.com/page --format json
```

### Sitemaps

```bash
# List sitemaps
gsc sitemaps list --site https://example.com/

# Submit a sitemap
gsc sitemaps submit --site https://example.com/ --url https://example.com/sitemap.xml
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GSC_OAUTH_CLIENT_SECRETS_FILE` | Path to OAuth client secrets JSON file |
| `GSC_CONFIG_DIR` | Directory for storing tokens and config (default: `~/.config/gsc-cli`) |
| `GSC_DATA_STATE` | Data freshness: `all` (default) or `final` (confirmed data only) |
| `GSC_ALLOW_DESTRUCTIVE` | Set to `true` to enable destructive operations |

## Output Formats

### Table (default)
Human-readable formatted tables with colors.

### JSON
Structured data for scripting and piping to other tools.

```bash
gsc analytics query --site https://example.com/ --format json | jq '.rows[0]'
```

### CSV
Spreadsheet-compatible format for Excel/Google Sheets.

```bash
gsc analytics query --site https://example.com/ --format csv --output report.csv
```

## Examples

### Daily reporting workflow

```bash
#!/bin/bash
SITE="https://example.com/"
DATE=$(date +%Y-%m-%d)

# Get yesterday's top queries
gsc analytics query --site "$SITE" --days 1 --limit 10 --format csv > "report-${DATE}.csv"

# Get weekly overview
gsc analytics overview --site "$SITE" --days 7 --format json > "overview-${DATE}.json"
```

### Check indexing for multiple URLs

```bash
# Create a file urls.txt with one URL per line
# Then:
while read url; do
  gsc urls inspect --site https://example.com/ --url "$url"
done < urls.txt
```

### Filter analytics by country and device

```bash
# Note: Use --dimensions to include country/device in output
# Use --filter to filter the data

gsc analytics query --site https://example.com/ \
  --dimensions query,country \
  --filter "country equals usa"

gsc analytics query --site https://example.com/ \
  --dimensions query,device \
  --filter "device equals MOBILE"
```

## Architecture

This CLI is built with:

- **[oclif](https://oclif.io/)**: CLI framework for Node.js
- **[googleapis](https://github.com/googleapis/google-api-nodejs-client)**: Official Google API client
- **TypeScript**: Type-safe development

### Project Structure

```
src/
├── commands/           # CLI commands
│   ├── auth/          # Authentication commands
│   ├── sites/         # Site management
│   ├── analytics/     # Analytics queries
│   ├── urls/          # URL inspection
│   └── sitemaps/      # Sitemap management
├── lib/               # Core libraries
│   ├── auth/          # OAuth implementation
│   ├── api/           # GSC API client
│   └── output/        # Output formatters
└── types/             # TypeScript definitions
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev -- auth status

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint
```

## Roadmap

- [ ] Service Account authentication support
- [ ] Batch URL inspection
- [ ] Period comparison analytics
- [ ] Add/remove sites (destructive operations)
- [ ] Delete sitemaps
- [ ] Advanced filtering (AND/OR logic)
- [ ] Export to Google Sheets
- [ ] Scheduled/automated reports

## License

MIT

## Troubleshooting

### "OAuth client secrets file not found"

Make sure you have downloaded the OAuth credentials from Google Cloud Console and either:
1. Named it `client_secrets.json` in your working directory
2. Set `GSC_OAUTH_CLIENT_SECRETS_FILE` environment variable
3. Used `--secrets` flag to specify the path

### "Site not found" error

The site URL must match exactly what's in GSC. Run `gsc sites list` to see the exact URLs.

- For domain properties, use format: `sc-domain:example.com`
- For URL-prefix properties, include trailing slash: `https://example.com/`

### Token expired

Run `gsc auth login` to re-authenticate. The refresh token should handle this automatically in most cases.

### Rate limiting

Google Search Console API has quotas. If you hit limits:
- Reduce `--limit` values
- Add delays between batch operations
- Use more specific filters to reduce data size
