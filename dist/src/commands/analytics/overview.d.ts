import { Command } from '@oclif/core';
export default class AnalyticsOverview extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        site: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        days: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<number, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        format: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        output: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    run(): Promise<void>;
}
//# sourceMappingURL=overview.d.ts.map