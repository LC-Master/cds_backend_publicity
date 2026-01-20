import { t } from "elysia";

export const headerBearer = t.Object(
  {
    Authorization: t.String({
      description: "API key tiene que ser enviada",
      required: true,
      schema: { type: "string" },
      title: "Authorization Header",
      error: "Invalid or missing Authorization header",
    }),
  },
  {
    title: "Header Bearer Schema",
    description: "Esquema para el header de autorización con Bearer token",
    $id: "HeaderBearerSchema",
    readOnly: true,
  }
);
