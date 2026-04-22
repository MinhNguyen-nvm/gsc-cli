/**
 * Type definitions for GSC CLI
 */

export interface CLIOptions {
  format: 'json' | 'csv' | 'table';
  output?: string;
  quiet?: boolean;
}

export interface AuthConfig {
  type: 'oauth';
  clientSecretsPath?: string;
  tokenPath: string;
}

export interface CLIConfig {
  auth: AuthConfig;
  defaults: {
    days: number;
    format: 'json' | 'csv' | 'table';
    rowLimit: number;
  };
  flags: {
    allowDestructive: boolean;
    dataState: 'all' | 'final';
  };
}

// GSC API Types
export interface Site {
  siteUrl: string;
  permissionLevel: 'siteOwner' | 'siteFullUser' | 'siteRestrictedUser' | 'siteUnverifiedUser';
}

export interface AnalyticsParams {
  siteUrl: string;
  startDate: string;
  endDate: string;
  dimensions?: ('query' | 'page' | 'country' | 'device' | 'date')[];
  filters?: DimensionFilter[];
  rowLimit?: number;
  startRow?: number;
  searchType?: 'WEB' | 'IMAGE' | 'VIDEO' | 'NEWS' | 'DISCOVER';
  dataState?: 'all' | 'final';
}

export interface DimensionFilter {
  dimension: 'query' | 'page' | 'country' | 'device';
  operator: 'equals' | 'contains' | 'notEquals' | 'notContains';
  expression: string;
}

export interface AnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface AnalyticsResponse {
  siteUrl: string;
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
  dimensions: string[];
  rowCount: number;
  rows: AnalyticsRowData[];
}

export interface AnalyticsRowData {
  [key: string]: string | number | undefined;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface InspectionResult {
  pageUrl: string;
  siteUrl: string;
  verdict: 'PASS' | 'FAIL' | 'NEUTRAL';
  coverageState: string;
  lastCrawled?: string;
  pageFetchState?: string;
  robotsTxtState?: string;
  indexingState?: string;
  googleCanonical?: string;
  userCanonical?: string;
  crawledAs?: string;
  referringUrls?: string[];
  richResults?: RichResultsInfo;
}

export interface RichResultsInfo {
  verdict: string;
  detectedTypes: string[];
  issues: Array<{
    severity: string;
    message: string;
  }>;
}

export interface Sitemap {
  path: string;
  lastSubmitted?: string;
  lastDownloaded?: string;
  type: 'Sitemap' | 'Index';
  isPending: boolean;
  urlCount?: number;
  errors: number;
  warnings: number;
}

export interface OAuthCredentials {
  client_id: string;
  client_secret: string;
  redirect_uris: string[];
}

export interface OAuthClientSecrets {
  web?: OAuthCredentials;
  installed?: OAuthCredentials;
}

export interface TokenData {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}
