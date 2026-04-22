import type { AnalyticsRowData } from '../../types/index.js';
export type OutputFormat = 'json' | 'csv' | 'table';
/**
 * Format data as JSON
 */
export declare function formatJSON(data: unknown): string;
/**
 * Format data as CSV
 */
export declare function formatCSV(rows: AnalyticsRowData[], dimensions: string[]): string;
/**
 * Format data as table
 */
export declare function formatTable(rows: AnalyticsRowData[], dimensions: string[]): string;
/**
 * Format sites list as table
 */
export declare function formatSitesTable(sites: Array<{
    siteUrl: string;
    permissionLevel: string;
}>): string;
/**
 * Format sitemaps as table
 */
export declare function formatSitemapsTable(sitemaps: Array<{
    path: string;
    type: string;
    urlCount?: number;
    errors: number;
    warnings: number;
    isPending: boolean;
}>): string;
/**
 * Format inspection result as formatted text
 */
export declare function formatInspectionResult(result: {
    pageUrl: string;
    verdict: string;
    coverageState: string;
    lastCrawled?: string;
    pageFetchState?: string;
    robotsTxtState?: string;
    indexingState?: string;
    googleCanonical?: string;
    userCanonical?: string;
    richResults?: {
        verdict: string;
        detectedTypes: string[];
        issues: Array<{
            severity: string;
            message: string;
        }>;
    };
}): string;
/**
 * Format performance overview
 */
export declare function formatPerformanceOverview(data: {
    siteUrl: string;
    dateRange: {
        start: string;
        end: string;
        days: number;
    };
    totals: {
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    };
    dailyTrend: Array<{
        date: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    }>;
}): string;
/**
 * Generic format function
 */
export declare function formatOutput(data: unknown, format: OutputFormat, options?: {
    dimensions?: string[];
}): string;
//# sourceMappingURL=formatter.d.ts.map