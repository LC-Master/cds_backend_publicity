import { t } from "elysia";

export const Unauthorized = t.Object(
  {
    error: t.String({
      description: "Mensaje de error",
      examples: ["Unauthorized"],
      title: "Error Message",
      $id: "error",
    }),
  },
  {
    title: "Unauthorized Response",
    description: "Respuesta de error por falta de autorización",
    examples: [{ error: "Unauthorized" }],
    $id: "UnauthorizedResponse",
  }
);

export type IUnauthorized = typeof Unauthorized.static;
