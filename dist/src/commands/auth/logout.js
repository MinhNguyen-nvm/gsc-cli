import { Command } from '@oclif/core';
import chalk from 'chalk';
import { logout } from '../../lib/auth/oauth.js';
import { hasToken } from '../../lib/config.js';
export default class Logout extends Command {
    static description = 'Remove stored Google credentials';
    static examples = [
        '<%= config.bin %> <%= command.id %>',
    ];
    async run() {
        const hasAuth = await hasToken();
        if (!hasAuth) {
            this.log(chalk.yellow('Not currently authenticated'));
            return;
        }
        await logout();
        this.log(chalk.green('✓ Logged out successfully'));
    }
}
//# sourceMappingURL=logout.js.map