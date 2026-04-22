# GSC CLI Quick Start

A command-line tool for Google Search Console.

## Installation

```bash
cd /Users/minh/Projects/mcp-gsc/gsc-cli-ts
npm link
```

This installs the `gsc` command globally on your system.

## Setup

1. **Get OAuth credentials:**
   - Go to https://console.cloud.google.com/
   - Enable "Google Search Console API"
   - Create OAuth 2.0 Client ID (Desktop app)
   - Download as `client_secrets.json`

2. **Configure secrets path** (choose one):
   
   **Option A: Set in config file** (recommended):
   ```bash
   gsc config --set-secrets /path/to/client_secrets.json
   ```
   
   **Option B: Set environment variable**:
   ```bash
   export GSC_OAUTH_CLIENT_SECRETS_FILE=/path/to/client_secrets.json
   ```

3. **Authenticate:**
   ```bash
   gsc auth:login --secrets /path/to/client_secrets.json
   ```
   
   The secrets path will be saved to config for future use.

## Commands

### Configuration
```bash
# View current config
gsc config

# Set secrets path in config
gsc config --set-secrets /path/to/client_secrets.json
```

### Authentication
```bash
# Log in (saves secrets path to config)
gsc auth:login --secrets /path/to/client_secrets.json

# Check status
gsc auth:status

# Log out
gsc auth:logout
```

### Sites
```bash
gsc sites:list                           # List your properties
gsc sites:list --format json             # JSON output
```

### Analytics
```bash
# Top queries (last 28 days)
gsc analytics:query --site https://example.com/

# Custom date range
gsc analytics:query --site https://example.com/ --days 7

# Top pages
gsc analytics:query --site https://example.com/ --dimensions page

# Filter queries
gsc analytics:query --site https://example.com/ --filter "query contains product"

# Export CSV
gsc analytics:query --site https://example.com/ --format csv --output report.csv

# Performance overview with trends
gsc analytics:overview --site https://example.com/ --days 14
```

**Options:**
- `-s, --site` (required) - Property URL
- `-d, --days` - Days to look back (default: 28)
- `--dimensions` - query, page, country, device, date (default: query)
- `-l, --limit` - Rows to return, max 500 (default: 20)
- `--filter` - Format: "dimension operator expression"
- `-f, --format` - table, json, csv (default: table)
- `-o, --output` - Save to file

**Filter operators:** `contains`, `equals`, `notContains`, `notEquals`

### URL Inspection
```bash
gsc urls:inspect --site https://example.com/ --url https://example.com/page
gsc urls:inspect --site https://example.com/ --url https://example.com/page --format json
```

### Sitemaps
```bash
gsc sitemaps:list --site https://example.com/
gsc sitemaps:submit --site https://example.com/ --url https://example.com/sitemap.xml
```

## Examples

```bash
# Top 50 queries from last 7 days
gsc analytics:query -s https://example.com/ -d 7 -l 50

# Mobile traffic only
gsc analytics:query -s https://example.com/ --dimensions query,device --filter "device equals MOBILE"

# Export top pages to CSV
gsc analytics:query -s https://example.com/ --dimensions page -l 100 -f csv -o pages.csv

# Check if URL is indexed
gsc urls:inspect -s https://example.com/ -u https://example.com/blog/post
```

## Environment Variables

```bash
export GSC_OAUTH_CLIENT_SECRETS_FILE="/path/to/client_secrets.json"
export GSC_DATA_STATE="all"          # or "final" for confirmed data only
```

## Help

```bash
gsc --help
gsc analytics:query --help
```

## Data Location

- Config: `~/.config/gsc-cli/`
- Token: `~/.config/gsc-cli/token.json`
