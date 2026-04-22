import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import * as http from 'http';
import * as url from 'url';
import open from 'open';
import chalk from 'chalk';
import { loadClientSecrets, loadToken, saveToken, deleteToken, } from '../config.js';
const SCOPES = ['https://www.googleapis.com/auth/webmasters'];
/**
 * Create OAuth2 client from secrets with dynamic redirect URI
 */
function createOAuth2Client(secrets, redirectUri) {
    const credentials = secrets.web || secrets.installed;
    if (!credentials) {
        throw new Error('Invalid client secrets file: missing "web" or "installed" key');
    }
    const { client_id, client_secret } = credentials;
    return new OAuth2Client(client_id, client_secret, redirectUri || credentials.redirect_uris[0]);
}
/**
 * Start local server to receive OAuth callback
 * Similar to Python's run_local_server(port=0)
 */
async function startCallbackServer() {
    let codeResolver;
    let codeRejecter;
    const codePromise = new Promise((resolve, reject) => {
        codeResolver = resolve;
        codeRejecter = reject;
    });
    const server = http.createServer(async (req, res) => {
        try {
            const parsedUrl = url.parse(req.url || '', true);
            const code = parsedUrl.query.code;
            const error = parsedUrl.query.error;
            if (error) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end(`
          <html>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #d93025;">Authentication Failed</h1>
              <p>${error}</p>
              <p>You can close this window and return to the terminal.</p>
            </body>
          </html>
        `);
                codeRejecter(new Error(`OAuth error: ${error}`));
                return;
            }
            if (code) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
          <html>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #188038;">Authentication Successful!</h1>
              <p>You can close this window and return to the terminal.</p>
            </body>
          </html>
        `);
                codeResolver(code);
            }
        }
        catch (err) {
            codeRejecter(err);
        }
    });
    // Start server on random port (port 0 = random available)
    const port = await new Promise((resolve, reject) => {
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            resolve(address.port);
        });
        server.on('error', reject);
    });
    console.log(chalk.blue(`Waiting for authentication on port ${port}...`));
    // Timeout after 5 minutes
    const timeout = setTimeout(() => {
        codeRejecter(new Error('Authentication timeout - please try again'));
    }, 5 * 60 * 1000);
    const waitForCode = async () => {
        try {
            const code = await codePromise;
            clearTimeout(timeout);
            return code;
        }
        catch (error) {
            clearTimeout(timeout);
            throw error;
        }
    };
    return { port, server, waitForCode };
}
/**
 * Authenticate with OAuth
 * Opens browser for user to grant permission
 * Uses random port like Python's run_local_server(port=0)
 */
export async function authenticate(customSecretsPath) {
    const secrets = await loadClientSecrets(customSecretsPath);
    const credentials = secrets.web || secrets.installed;
    if (!credentials) {
        throw new Error('Invalid client secrets file: missing "web" or "installed" key');
    }
    // Start server first on random port to get the actual port
    const { port, server, waitForCode } = await startCallbackServer();
    const redirectUri = `http://localhost:${port}`;
    // Create OAuth2 client with dynamic redirect URI
    const oauth2Client = new OAuth2Client(credentials.client_id, credentials.client_secret, redirectUri);
    // Generate auth URL (no PKCE - Desktop clients don't need it)
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
        redirect_uri: redirectUri,
    });
    console.log(chalk.blue('Opening browser for Google authentication...'));
    console.log(chalk.gray(`If browser doesn't open, visit: ${authUrl}`));
    // Open browser
    await open(authUrl);
    try {
        // Wait for callback
        const code = await waitForCode();
        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken({
            code,
            redirect_uri: redirectUri,
        });
        oauth2Client.setCredentials(tokens);
        // Save token for future use
        await saveToken(tokens);
        // Get user info
        try {
            const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
            const { data: userInfo } = await oauth2.userinfo.get();
            console.log(chalk.green(`✓ Authenticated as ${userInfo.email}`));
        }
        catch {
            console.log(chalk.green('✓ Authentication successful'));
        }
        return oauth2Client;
    }
    finally {
        server.close();
    }
}
/**
 * Load saved credentials and refresh if needed
 */
export async function loadSavedCredentials() {
    const tokenData = await loadToken();
    if (!tokenData) {
        return null;
    }
    let secrets;
    try {
        secrets = await loadClientSecrets();
    }
    catch {
        // Can't load secrets file - can't use saved credentials
        return null;
    }
    const oauth2Client = createOAuth2Client(secrets);
    oauth2Client.setCredentials(tokenData);
    // Check if token needs refresh
    const expiryDate = tokenData.expiry_date;
    const isExpired = expiryDate && Date.now() >= expiryDate;
    if (isExpired && tokenData.refresh_token) {
        try {
            const { credentials } = await oauth2Client.refreshAccessToken();
            oauth2Client.setCredentials(credentials);
            await saveToken(credentials);
        }
        catch {
            throw new Error('Your session has expired and could not be refreshed. Please re-authenticate:\n\n' +
                '  gsc auth login');
        }
    }
    return oauth2Client;
}
/**
 * Get authenticated client (load saved or throw error)
 */
export async function getAuthenticatedClient() {
    const client = await loadSavedCredentials();
    if (!client) {
        throw new Error('Not authenticated. Please run:\n\n' +
            '  gsc auth login\n\n' +
            'Or specify a client secrets file:\n' +
            '  gsc auth login --secrets /path/to/client_secrets.json');
    }
    return client;
}
/**
 * Get current authenticated user email
 */
export async function getCurrentUser() {
    try {
        const client = await loadSavedCredentials();
        if (!client)
            return null;
        const oauth2 = google.oauth2({ version: 'v2', auth: client });
        const { data: userInfo } = await oauth2.userinfo.get();
        return userInfo.email || null;
    }
    catch {
        return null;
    }
}
/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
    try {
        const client = await loadSavedCredentials();
        return client !== null;
    }
    catch {
        return false;
    }
}
/**
 * Logout - delete saved credentials
 */
export async function logout() {
    await deleteToken();
}
/**
 * Get token expiry info
 */
export async function getTokenInfo() {
    const tokenData = await loadToken();
    if (!tokenData) {
        return null;
    }
    const email = await getCurrentUser();
    const expiry = tokenData.expiry_date ? new Date(tokenData.expiry_date) : null;
    return { email, expiry };
}
//# sourceMappingURL=oauth.js.map