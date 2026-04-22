import { google } from 'googleapis';
import { getAuthenticatedClient } from '../auth/oauth.js';
import { loadConfig } from '../config.js';
export class GSCClient {
    client;
    config;
    constructor(auth, config) {
        this.client = google.searchconsole({ version: 'v1', auth });
        this.config = config;
    }
    /**
     * Create a new GSC client with authentication
     */
    static async create() {
        const auth = await getAuthenticatedClient();
        const config = await loadConfig();
        return new GSCClient(auth, config);
    }
    /**
     * List all Search Console properties
     */
    async listSites() {
        const response = await this.client.sites.list();
        return (response.data.siteEntry || []).map(site => ({
            siteUrl: site.siteUrl || '',
            permissionLevel: site.permissionLevel || 'siteUnverifiedUser',
        }));
    }
    /**
     * Get search analytics data
     */
    async getAnalytics(params) {
        const { siteUrl, startDate, endDate, dimensions = [], filters, rowLimit = 20, startRow = 0, searchType = 'WEB', dataState, } = params;
        const resolvedDataState = dataState || this.config.flags.dataState;
        const requestBody = {
            startDate,
            endDate,
            dimensions,
            rowLimit,
            startRow,
            searchType,
            dataState: resolvedDataState,
        };
        // Add dimension filters if provided
        if (filters && filters.length > 0) {
            requestBody.dimensionFilterGroups = [{
                    filters: filters.map(f => ({
                        dimension: f.dimension,
                        operator: f.operator,
                        expression: f.expression,
                    })),
                }];
        }
        const response = await this.client.searchanalytics.query({
            siteUrl,
            requestBody,
        });
        const rows = (response.data.rows || []).map(row => {
            const entry = {
                clicks: row.clicks || 0,
                impressions: row.impressions || 0,
                ctr: Number(((row.ctr || 0)).toFixed(4)),
                position: Number(((row.position || 0)).toFixed(1)),
            };
            // Add dimension keys
            dimensions.forEach((dim, i) => {
                entry[dim] = row.keys?.[i] || '';
            });
            return entry;
        });
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return {
            siteUrl,
            dateRange: {
                start: startDate,
                end: endDate,
                days,
            },
            dimensions,
            rowCount: rows.length,
            rows,
        };
    }
    /**
     * Get performance overview (totals + daily trend)
     */
    async getPerformanceOverview(siteUrl, days) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];
        // Get totals (no dimensions)
        const totalsResponse = await this.client.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate: startStr,
                endDate: endStr,
                dimensions: [],
                rowLimit: 1,
                dataState: this.config.flags.dataState,
            },
        });
        // Get daily trend
        const trendResponse = await this.client.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate: startStr,
                endDate: endStr,
                dimensions: ['date'],
                rowLimit: days,
                dataState: this.config.flags.dataState,
            },
        });
        const totalsRow = totalsResponse.data.rows?.[0];
        const totals = {
            clicks: totalsRow?.clicks || 0,
            impressions: totalsRow?.impressions || 0,
            ctr: Number(((totalsRow?.ctr || 0)).toFixed(4)),
            position: Number(((totalsRow?.position || 0)).toFixed(1)),
        };
        const dailyTrend = (trendResponse.data.rows || [])
            .sort((a, b) => (a.keys?.[0] || '').localeCompare(b.keys?.[0] || ''))
            .map(row => ({
            date: row.keys?.[0] || '',
            clicks: row.clicks || 0,
            impressions: row.impressions || 0,
            ctr: Number(((row.ctr || 0)).toFixed(4)),
            position: Number(((row.position || 0)).toFixed(1)),
        }));
        return {
            siteUrl,
            dateRange: {
                start: startStr,
                end: endStr,
                days,
            },
            totals,
            dailyTrend,
        };
    }
    /**
     * Inspect a URL
     */
    async inspectUrl(siteUrl, pageUrl) {
        const response = await this.client.urlInspection.index.inspect({
            requestBody: {
                inspectionUrl: pageUrl,
                siteUrl,
            },
        });
        const result = response.data.inspectionResult;
        if (!result) {
            throw new Error('No inspection data found');
        }
        const indexStatus = result.indexStatusResult || {};
        // Format last crawl time
        let lastCrawled;
        if (indexStatus.lastCrawlTime) {
            try {
                const date = new Date(indexStatus.lastCrawlTime);
                lastCrawled = date.toISOString().replace('T', ' ').slice(0, 16);
            }
            catch {
                lastCrawled = indexStatus.lastCrawlTime;
            }
        }
        // Parse rich results
        let richResults;
        if (result.richResultsResult) {
            const rich = result.richResultsResult;
            richResults = {
                verdict: rich.verdict || 'UNKNOWN',
                detectedTypes: (rich.detectedItems || [])
                    .map(item => item.richResultType || 'Unknown')
                    .filter(Boolean),
                issues: [],
            };
        }
        return {
            pageUrl,
            siteUrl,
            verdict: indexStatus.verdict || 'NEUTRAL',
            coverageState: indexStatus.coverageState || 'Unknown',
            lastCrawled,
            pageFetchState: indexStatus.pageFetchState || undefined,
            robotsTxtState: indexStatus.robotsTxtState || undefined,
            indexingState: indexStatus.indexingState || undefined,
            googleCanonical: indexStatus.googleCanonical || undefined,
            userCanonical: indexStatus.userCanonical || undefined,
            crawledAs: indexStatus.crawledAs || undefined,
            referringUrls: indexStatus.referringUrls?.slice(0, 5),
            richResults,
        };
    }
    /**
     * List sitemaps
     */
    async listSitemaps(siteUrl) {
        const response = await this.client.sitemaps.list({ siteUrl });
        return (response.data.sitemap || []).map(sitemap => {
            const isIndex = sitemap.isSitemapsIndex || false;
            // Format dates
            const formatDate = (raw) => {
                if (!raw)
                    return undefined;
                try {
                    return new Date(raw).toISOString().replace('T', ' ').slice(0, 16);
                }
                catch {
                    return raw;
                }
            };
            // Get URL count from contents
            let urlCount;
            if (sitemap.contents) {
                for (const content of sitemap.contents) {
                    if (content.type === 'web' && content.submitted != null) {
                        urlCount = typeof content.submitted === 'string' ? parseInt(content.submitted, 10) : content.submitted;
                        break;
                    }
                }
            }
            return {
                path: sitemap.path || '',
                lastSubmitted: formatDate(sitemap.lastSubmitted),
                lastDownloaded: formatDate(sitemap.lastDownloaded),
                type: isIndex ? 'Index' : 'Sitemap',
                isPending: sitemap.isPending || false,
                urlCount,
                errors: typeof sitemap.errors === 'number' ? sitemap.errors : parseInt(sitemap.errors ?? '0', 10) || 0,
                warnings: typeof sitemap.warnings === 'number' ? sitemap.warnings : parseInt(sitemap.warnings ?? '0', 10) || 0,
            };
        });
    }
    /**
     * Submit a sitemap
     */
    async submitSitemap(siteUrl, sitemapUrl) {
        await this.client.sitemaps.submit({
            siteUrl,
            feedpath: sitemapUrl,
        });
    }
    /**
     * Delete a sitemap
     */
    async deleteSitemap(siteUrl, sitemapUrl) {
        await this.client.sitemaps.delete({
            siteUrl,
            feedpath: sitemapUrl,
        });
    }
    /**
     * Add a site (destructive)
     */
    async addSite(siteUrl) {
        await this.client.sites.add({ siteUrl });
    }
    /**
     * Delete a site (destructive)
     */
    async deleteSite(siteUrl) {
        await this.client.sites.delete({ siteUrl });
    }
}
//# sourceMappingURL=client.js.map