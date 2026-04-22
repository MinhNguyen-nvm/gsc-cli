import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { z } from 'zod';
const CONFIG_DIR = process.env.GSC_CONFIG_DIR || path.join(os.homedir(), '.config', 'gsc-cli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const TOKEN_FILE = path.join(CONFIG_DIR, 'token.json');
// Default configuration
const DEFAULT_CONFIG = {
    auth: {
        type: 'oauth',
        tokenPath: TOKEN_FILE,
    },
    defaults: {
        days: 28,
        format: 'table',
        rowLimit: 20,
    },
    flags: {
        allowDestructive: process.env.GSC_ALLOW_DESTRUCTIVE === 'true',
        dataState: process.env.GSC_DATA_STATE || 'all',
    },
};
// Validation schemas
const tokenDataSchema = z.object({
    access_token: z.string(),
    refresh_token: z.string().optional(),
    scope: z.string(),
    token_type: z.string(),
    expiry_date: z.number(),
});
const configSchema = z.object({
    auth: z.object({
        type: z.literal('oauth'),
        clientSecretsPath: z.string().optional(),
        tokenPath: z.string(),
    }),
    defaults: z.object({
        days: z.number().int().positive(),
        format: z.enum(['json', 'csv', 'table']),
        rowLimit: z.number().int().positive(),
    }),
    flags: z.object({
        allowDestructive: z.boolean(),
        dataState: z.enum(['all', 'final']),
    }),
});
/**
 * Ensure configuration directory exists
 */
export async function ensureConfigDir() {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
}
/**
 * Load configuration from file or return defaults
 */
export async function loadConfig() {
    await ensureConfigDir();
    try {
        const content = await fs.readFile(CONFIG_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        return configSchema.parse({ ...DEFAULT_CONFIG, ...parsed });
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            // Config doesn't exist, return defaults
            return DEFAULT_CONFIG;
        }
        throw error;
    }
}
/**
 * Save configuration to file
 */
export async function saveConfig(config) {
    await ensureConfigDir();
    const current = await loadConfig();
    const merged = { ...current, ...config };
    await fs.writeFile(CONFIG_FILE, JSON.stringify(merged, null, 2));
}
/**
 * Get token file path
 */
export function getTokenPath() {
    return TOKEN_FILE;
}
/**
 * Get config directory path
 */
export function getConfigDir() {
    return CONFIG_DIR;
}
/**
 * Load OAuth client secrets from file
 * Priority: 1) customPath param, 2) env var, 3) config file, 4) default location
 */
export async function loadClientSecrets(customPath) {
    // Priority order: customPath > env var > config file > default
    let secretsPath = customPath;
    if (!secretsPath) {
        secretsPath = process.env.GSC_OAUTH_CLIENT_SECRETS_FILE;
    }
    if (!secretsPath) {
        try {
            const config = await loadConfig();
            secretsPath = config.auth.clientSecretsPath;
        }
        catch {
            // Config might not exist or be invalid, continue
        }
    }
    secretsPath = secretsPath || 'client_secrets.json';
    // Expand ~ to home directory
    const expandedPath = secretsPath.replace(/^~/, os.homedir());
    try {
        const content = await fs.readFile(expandedPath, 'utf-8');
        return JSON.parse(content);
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`OAuth client secrets file not found: ${secretsPath}\n\n` +
                `Please either:\n` +
                `1. Place a client_secrets.json file in the current directory, or\n` +
                `2. Set GSC_OAUTH_CLIENT_SECRETS_FILE environment variable to the file path, or\n` +
                `3. Use --secrets flag to specify the path, or\n` +
                `4. Set the secrets path in the config file\n\n` +
                `To get client secrets:\n` +
                `1. Go to https://console.cloud.google.com/\n` +
                `2. Create a project or select existing one\n` +
                `3. Enable Google Search Console API\n` +
                `4. Go to Credentials → Create OAuth 2.0 Client ID (Desktop app)\n` +
                `5. Download the JSON and save as client_secrets.json`);
        }
        throw error;
    }
}
/**
 * Save secrets file path to config
 */
export async function saveSecretsPath(secretsPath) {
    const config = await loadConfig();
    config.auth.clientSecretsPath = secretsPath;
    await saveConfig(config);
}
/**
 * Save token data to file
 */
export async function saveToken(tokenData) {
    await ensureConfigDir();
    await fs.writeFile(TOKEN_FILE, JSON.stringify(tokenData, null, 2));
    // Secure file permissions (owner read/write only)
    await fs.chmod(TOKEN_FILE, 0o600);
}
/**
 * Load token data from file
 */
export async function loadToken() {
    try {
        const content = await fs.readFile(TOKEN_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        const result = tokenDataSchema.safeParse(parsed);
        if (!result.success) {
            return null;
        }
        return result.data;
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}
/**
 * Delete token file (logout)
 */
export async function deleteToken() {
    try {
        await fs.unlink(TOKEN_FILE);
    }
    catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
}
/**
 * Check if token exists
 */
export async function hasToken() {
    try {
        await fs.access(TOKEN_FILE);
        return true;
    }
    catch {
        return false;
    }
}
// Re-export config paths
export { CONFIG_DIR, CONFIG_FILE, TOKEN_FILE };
//# sourceMappingURL=config.js.map