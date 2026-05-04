import { CONFIG } from "@src/config/config";
import TokenService from "@src/services/token.service";
import Elysia, { t } from "elysia";

export const internalRoute = new Elysia({
    detail: {
        summary: "Internal Routes",
        description: "Endpoints para el handshake interno entre servicios.",
        tags: ["Authentication", "Internal"],
    }
})
    .get("/internal/handshake", ({ headers, status }) => {
        if (headers["x-master-key"] !== CONFIG.MASTER_KEY) {
            return status(401, { message: "Unauthorized" });
        }
        if (!TokenService.tokenRaw) {
            return status(500, { message: "Token not generated yet" });
        }
        return { token: TokenService.tokenRaw };
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