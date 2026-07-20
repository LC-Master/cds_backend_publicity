import { SseTokenService } from "./services/sse-token.service";

async function init() {
    await SseTokenService.bootstrapSecurity();
}

init().catch(err => {
    console.error("Initialization failed:", err);
    process.exit(1);
});