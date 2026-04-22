import { Command } from '@oclif/core';
export default class AnalyticsQuery extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        site: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        days: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<number, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        dimensions: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        limit: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<number, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        filter: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        format: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
        output: import("@oclif/core/lib/interfaces/parser.js").OptionFlag<string | undefined, import("@oclif/core/lib/interfaces/parser.js").CustomOptions>;
    };
    run(): Promise<void>;
}
//# sourceMappingURL=query.d.ts.map