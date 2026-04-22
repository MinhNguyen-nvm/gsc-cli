import { Command } from '@oclif/core';
export default class SitemapsSubmit extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        site: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        url: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    run(): Promise<void>;
}
//# sourceMappingURL=submit.d.ts.map