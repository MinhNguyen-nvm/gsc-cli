import type { CLIConfig, OAuthClientSecrets, TokenData } from '../types/index.js';
declare const CONFIG_DIR: string;
declare const CONFIG_FILE: string;
declare const TOKEN_FILE: string;
/**
 * Ensure configuration directory exists
 */
export declare function ensureConfigDir(): Promise<void>;
/**
 * Load configuration from file or return defaults
 */
export declare function loadConfig(): Promise<CLIConfig>;
/**
 * Save configuration to file
 */
export declare function saveConfig(config: Partial<CLIConfig>): Promise<void>;
/**
 * Get token file path
 */
export declare function getTokenPath(): string;
/**
 * Get config directory path
 */
export declare function getConfigDir(): string;
/**
 * Load OAuth client secrets from file
 * Priority: 1) customPath param, 2) env var, 3) config file, 4) default location
 */
export declare function loadClientSecrets(customPath?: string): Promise<OAuthClientSecrets>;
/**
 * Save secrets file path to config
 */
export declare function saveSecretsPath(secretsPath: string): Promise<void>;
/**
 * Save token data to file
 */
export declare function saveToken(tokenData: unknown): Promise<void>;
/**
 * Load token data from file
 */
export declare function loadToken(): Promise<TokenData | null>;
/**
 * Delete token file (logout)
 */
export declare function deleteToken(): Promise<void>;
/**
 * Check if token exists
 */
export declare function hasToken(): Promise<boolean>;
export { CONFIG_DIR, CONFIG_FILE, TOKEN_FILE };
//# sourceMappingURL=config.d.ts.map