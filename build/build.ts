import { logger } from "../src/providers/logger.provider";

try {
    await Bun.build({
        entrypoints: ["src/index.ts"],
        target: "bun",
        minify: {
            whitespace: true,
            syntax: true,
            identifiers: false,
        },
        sourcemap: "none",
        outdir: "./dist",
        naming: "server.ts"
    })

} catch (error) {
    logger.error({
        message: "Build failed",
        error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
}
