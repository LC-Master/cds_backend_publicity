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
        bytecode: true,
        sourcemap: "none",
        compile: {
            target: "bun-windows-x64",
            outfile: 'dist/cds.exe',
            windows: {
                icon: 'assets/locatel.ico',
                version: '1.0.0',
                copyright: '© 2026 Locatel',
                title: 'CDS Backend Service',
                publisher: 'Locatel',
                description: 'Servicio Backend de CDS',
            }
        },
    })

} catch (error) {
    logger.error({
        message: "Build failed",
        error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
}
