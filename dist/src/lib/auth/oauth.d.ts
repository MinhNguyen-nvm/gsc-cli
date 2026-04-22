import { OAuth2Client } from 'google-auth-library';
/**
 * Authenticate with OAuth
 * Opens browser for user to grant permission
 * Uses random port like Python's run_local_server(port=0)
 */
export declare function authenticate(customSecretsPath?: string): Promise<OAuth2Client>;
/**
 * Load saved credentials and refresh if needed
 */
export declare function loadSavedCredentials(): Promise<OAuth2Client | null>;
/**
 * Get authenticated client (load saved or throw error)
 */
export declare function getAuthenticatedClient(): Promise<OAuth2Client>;
/**
 * Get current authenticated user email
 */
export declare function getCurrentUser(): Promise<string | null>;
/**
 * Check if user is authenticated
 */
export declare function isAuthenticated(): Promise<boolean>;
/**
 * Logout - delete saved credentials
 */
export declare function logout(): Promise<void>;
/**
 * Get token expiry info
 */
export declare function getTokenInfo(): Promise<{
    email: string | null;
    expiry: Date | null;
} | null>;
//# sourceMappingURL=oauth.d.ts.map