import { CONFIG } from "@src/config/config";
import TokenService from "@src/services/token.service";
import { TokenRepository } from "@src/repository/token.repository";
import { startApp } from "@src/plugin/startApp.plugin";
import { logger } from "@src/providers/logger.provider";
import Elysia, { t } from "elysia";

export const internalRoute = new Elysia({
    detail: {
        summary: "Internal Routes",
        description: "Endpoints para el handshake interno entre servicios.",
        tags: ["Authentication", "Internal"],
    }
})
    .get("/internal/handshake", async ({ headers, status }) => {
        if (headers["x-master-key"] !== CONFIG.MASTER_KEY) {
            return status(401, { message: "Unauthorized" }) as any;
        }

        // Check DB record
        const apiKey = await TokenRepository.getFull();

        const now = new Date();
        const isExpired = !apiKey || (apiKey.expiresAt && apiKey.expiresAt <= now);

        // If token raw exists and not expired, return it
        if (TokenService.tokenRaw && !isExpired) {
            return { token: TokenService.tokenRaw };
        }

        // Otherwise, generate a new token on demand and return it
        try {
            logger.info("Internal handshake: token missing or expired, generating new token on-demand");
            await TokenService.createApiKey(startApp.decorator.jwt);
            logger.info("Internal handshake: token generated on-demand successfully");
            return { token: TokenService.tokenRaw };
        } catch (err: any) {
            logger.error({ message: "Error generating token on-demand", error: err?.message || err });
            return status(500, { message: "Error generating token" }) as any;
        }
    },
        {
            response: {
                200: t.Object({
                    token: t.String()
                },
                    {
                        description: "Access token for internal synchronization",
                    }),
                401: t.Object({
                    message: t.String()
                },
                    { description: "Error message for incorrect master key" })
                , 500: t.Object({
                    message: t.String()
                }, { description: "Error message when token is not generated yet" })
            },
            headers: t.Object({
                "x-master-key": t.String(),
            }),
            detail: {
                summary: "Internal Handshake",
                description: "Internal endpoint to obtain the authentication token (protected by MASTER_KEY).",
                tags: ["Internal"],
            }
        }
    )