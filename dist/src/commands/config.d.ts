import { Command } from '@oclif/core';
export default class Config extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        'set-secrets': import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    run(): Promise<void>;
}
//# sourceMappingURL=config.d.ts.map