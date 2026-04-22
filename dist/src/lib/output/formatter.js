import { stringify } from 'csv-stringify/sync';
import Table from 'cli-table3';
/**
 * Format data as JSON
 */
export function formatJSON(data) {
    return JSON.stringify(data, null, 2);
}
/**
 * Format data as CSV
 */
export function formatCSV(rows, dimensions) {
    if (rows.length === 0) {
        return '';
    }
    // Build headers: dimensions + metrics
    const headers = [...dimensions, 'clicks', 'impressions', 'ctr', 'position'];
    // Build records
    const records = rows.map(row => {
        const record = {};
        dimensions.forEach(dim => {
            record[dim] = row[dim] || '';
        });
        record.clicks = row.clicks;
        record.impressions = row.impressions;
        record.ctr = row.ctr;
        record.position = row.position;
        return record;
    });
    return stringify(records, { header: true, columns: headers });
}
/**
 * Format data as table
 */
export function formatTable(rows, dimensions) {
    if (rows.length === 0) {
        return 'No data available';
    }
    // Build headers
    const headers = [...dimensions, 'Clicks', 'Impr.', 'CTR', 'Pos.'];
    // Create table
    const table = new Table({
        head: headers,
        style: { head: ['cyan'] },
        wordWrap: true,
        wrapOnWordBoundary: false,
    });
    // Add rows
    rows.forEach(row => {
        const values = [
            ...dimensions.map(dim => String(row[dim] || '').slice(0, 50)),
            formatNumber(row.clicks),
            formatNumber(row.impressions),
            formatPercentage(row.ctr),
            row.position.toFixed(1),
        ];
        table.push(values);
    });
    return table.toString();
}
/**
 * Format sites list as table
 */
export function formatSitesTable(sites) {
    if (sites.length === 0) {
        return 'No sites found';
    }
    const table = new Table({
        head: ['Site URL', 'Permission'],
        style: { head: ['cyan'] },
        wordWrap: true,
    });
    sites.forEach(site => {
        table.push([site.siteUrl, formatPermissionLevel(site.permissionLevel)]);
    });
    return table.toString();
}
/**
 * Format sitemaps as table
 */
export function formatSitemapsTable(sitemaps) {
    if (sitemaps.length === 0) {
        return 'No sitemaps found';
    }
    const table = new Table({
        head: ['Sitemap', 'Type', 'URLs', 'Status'],
        style: { head: ['cyan'] },
        wordWrap: true,
    });
    sitemaps.forEach(sitemap => {
        const status = sitemap.isPending
            ? 'Pending'
            : sitemap.errors > 0
                ? `Errors: ${sitemap.errors}`
                : sitemap.warnings > 0
                    ? `Warnings: ${sitemap.warnings}`
                    : 'Valid';
        table.push([
            sitemap.path.slice(0, 60),
            sitemap.type,
            sitemap.urlCount?.toString() || '-',
            status,
        ]);
    });
    return table.toString();
}
/**
 * Format inspection result as formatted text
 */
export function formatInspectionResult(result) {
    const lines = [];
    lines.push(`URL: ${result.pageUrl}`);
    lines.push(`Status: ${result.verdict} - ${result.coverageState}`);
    if (result.lastCrawled) {
        lines.push(`Last Crawled: ${result.lastCrawled}`);
    }
    if (result.pageFetchState) {
        lines.push(`Fetch State: ${result.pageFetchState}`);
    }
    if (result.robotsTxtState) {
        lines.push(`Robots.txt: ${result.robotsTxtState}`);
    }
    if (result.indexingState) {
        lines.push(`Indexing: ${result.indexingState}`);
    }
    if (result.googleCanonical) {
        lines.push(`Google Canonical: ${result.googleCanonical}`);
    }
    if (result.userCanonical && result.userCanonical !== result.googleCanonical) {
        lines.push(`User Canonical: ${result.userCanonical}`);
    }
    if (result.richResults) {
        lines.push('');
        lines.push('Rich Results:');
        lines.push(`  Verdict: ${result.richResults.verdict}`);
        if (result.richResults.detectedTypes.length > 0) {
            lines.push(`  Detected: ${result.richResults.detectedTypes.join(', ')}`);
        }
        if (result.richResults.issues.length > 0) {
            lines.push('  Issues:');
            result.richResults.issues.forEach(issue => {
                lines.push(`    [${issue.severity}] ${issue.message}`);
            });
        }
    }
    return lines.join('\n');
}
/**
 * Format performance overview
 */
export function formatPerformanceOverview(data) {
    const lines = [];
    lines.push(`Performance Overview: ${data.siteUrl}`);
    lines.push(`Period: ${data.dateRange.start} to ${data.dateRange.end} (${data.dateRange.days} days)`);
    lines.push('');
    lines.push('Totals:');
    lines.push(`  Clicks:      ${formatNumber(data.totals.clicks)}`);
    lines.push(`  Impressions: ${formatNumber(data.totals.impressions)}`);
    lines.push(`  CTR:         ${formatPercentage(data.totals.ctr)}`);
    lines.push(`  Position:    ${data.totals.position.toFixed(1)}`);
    if (data.dailyTrend.length > 0) {
        lines.push('');
        lines.push('Daily Trend (last 7 days):');
        const table = new Table({
            head: ['Date', 'Clicks', 'Impressions', 'CTR', 'Pos.'],
            style: { head: ['cyan'] },
        });
        data.dailyTrend.slice(-7).forEach(day => {
            table.push([
                day.date,
                formatNumber(day.clicks),
                formatNumber(day.impressions),
                formatPercentage(day.ctr),
                day.position.toFixed(1),
            ]);
        });
        lines.push(table.toString());
    }
    return lines.join('\n');
}
/**
 * Helper: Format number with commas
 */
function formatNumber(n) {
    return n.toLocaleString();
}
/**
 * Helper: Format as percentage
 */
function formatPercentage(n) {
    return `${(n * 100).toFixed(2)}%`;
}
/**
 * Helper: Format permission level
 */
function formatPermissionLevel(level) {
    const map = {
        siteOwner: 'Owner',
        siteFullUser: 'Full User',
        siteRestrictedUser: 'Restricted',
        siteUnverifiedUser: 'Unverified',
    };
    return map[level] || level;
}
/**
 * Generic format function
 */
export function formatOutput(data, format, options) {
    switch (format) {
        case 'json':
            return formatJSON(data);
        case 'csv':
            if (Array.isArray(data) && options?.dimensions) {
                return formatCSV(data, options.dimensions);
            }
            // Fall back to JSON for non-analytics data
            return formatJSON(data);
        case 'table':
            if (Array.isArray(data) && options?.dimensions) {
                return formatTable(data, options.dimensions);
            }
            // Fall back to JSON for non-tabular data
            return formatJSON(data);
        default:
            return formatJSON(data);
    }
}
//# sourceMappingURL=formatter.js.map