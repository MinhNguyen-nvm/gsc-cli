import { Command } from '@oclif/core';
export default class Login extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        secrets: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    run(): Promise<void>;
}
//# sourceMappingURL=login.d.ts.map