import openapi, { fromTypes } from "@elysiajs/openapi";
import { CONFIG } from "@src/config/config";
import Elysia from "elysia";

export const apiDoc = new Elysia().use(
  openapi({
    documentation: {
      info: {
        title: "Content Distribution Service (CDS) API",
        version: CONFIG.VERSION,
        description:
          "API documentation for the Content Distribution Service (CDS).",
      },
    },
    references: fromTypes(
      process.env.NODE_ENV === "production" ? "dist/index.d.ts" : "src/index.ts"
    ),
  })
);
