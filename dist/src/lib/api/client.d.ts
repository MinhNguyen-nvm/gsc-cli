import type { Site, AnalyticsParams, AnalyticsResponse, InspectionResult, Sitemap } from '../../types/index.js';
export declare class GSCClient {
    private client;
    private config;
    private constructor();
    /**
     * Create a new GSC client with authentication
     */
    static create(): Promise<GSCClient>;
    /**
     * List all Search Console properties
     */
    listSites(): Promise<Site[]>;
    /**
     * Get search analytics data
     */
    getAnalytics(params: AnalyticsParams): Promise<AnalyticsResponse>;
    /**
     * Get performance overview (totals + daily trend)
     */
    getPerformanceOverview(siteUrl: string, days: number): Promise<{
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
    }>;
    /**
     * Inspect a URL
     */
    inspectUrl(siteUrl: string, pageUrl: string): Promise<InspectionResult>;
    /**
     * List sitemaps
     */
    listSitemaps(siteUrl: string): Promise<Sitemap[]>;
    /**
     * Submit a sitemap
     */
    submitSitemap(siteUrl: string, sitemapUrl: string): Promise<void>;
    /**
     * Delete a sitemap
     */
    deleteSitemap(siteUrl: string, sitemapUrl: string): Promise<void>;
    /**
     * Add a site (destructive)
     */
    addSite(siteUrl: string): Promise<void>;
    /**
     * Delete a site (destructive)
     */
    deleteSite(siteUrl: string): Promise<void>;
}
//# sourceMappingURL=client.d.ts.map