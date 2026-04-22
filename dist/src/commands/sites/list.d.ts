import { Command } from '@oclif/core';
export default class SitesList extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        format: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    run(): Promise<void>;
}
//# sourceMappingURL=list.d.ts.map