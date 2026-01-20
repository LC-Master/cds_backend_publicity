import openapi, { fromTypes } from "@elysiajs/openapi";
import { CONFIG } from "@src/config/config";
import Elysia, { t } from "elysia";

export const apiDoc = new Elysia().use(
  openapi({
    documentation: {
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
        parameters: {
          DeviceToken: {
            name: "token",
            in: "query",
            description:
              "UUID devuelto por /auth/login/device. Usar como query param 'token' para autenticar rutas de Events (no usan header Authorization Bearer).",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        },
      },
      // Requiere autenticación por defecto (Bearer JWT). Excepciones:
      // - /auth/login/device es pública y devuelve un UUID (device token) que deberá pasarse
      //   en posteriores llamadas a rutas de Events como query param 'token' en lugar del header Bearer.
      security: [{ BearerAuth: [] }],
      tags: [
        {
          name: "Authentication",
          description:
            "Operaciones para registro y autenticación de dispositivos/usuarios. Incluye emisión y renovación de credenciales y comprobación del estado de autenticación.\n\nRuta importante: /auth/login/device (pública) acepta credenciales de dispositivo y devuelve un UUID ('device token') que debe usarse como query parameter 'token' en las rutas que lo requieran.",
        },
        {
          name: "Health",
          description:
            "Rutas públicas para comprobar el estado del servicio. No requieren autenticación. Usar para chequeos de disponibilidad y métricas básicas.",
        },
        {
          name: "Events",
          description:
            "Gestión de eventos relacionados con el sistema. Estas rutas NO usan el header Authorization Bearer; en su lugar se autentican con un uuid (device token) obtenido desde /auth/login/device y enviado como query param 'token'. Causas comunes de 401:\n- Token ausente en query param 'token'.\n- Token en formato incorrecto o expirado.\nSi el dispositivo es nuevo, complete primero el proceso de registro (/auth/login/device) para obtener el device token.",
        },
        {
          name: "Synchronization",
          description:
            "Operaciones para sincronizar contenido y estado entre el CDS y los dispositivos clientes. Incluye endpoints de subida, descarga y reconciliación.",
        },
        {
          name: "Token",
          description:
            "Endpoints para emisión, renovación y revocación de tokens de acceso. Asegúrese de seguir las políticas de seguridad al gestionar tokens.",
        },
        {
          name: "Playlist",
          description:
            "Gestión de playlists: creación, actualización, eliminación y consulta de listas de reproducción y sus metadatos.",
        },
      ],
      info: {
        title: "Content Distribution Service (CDS) API",
        version: CONFIG.VERSION,
        description:
          "Documentación de la API del Content Distribution Service (CDS). La mayoría de endpoints requieren autenticación mediante Bearer JWT salvo los explícitamente indicados como públicos (por ejemplo, Health y /auth/login/device). Algunas rutas (Events) usan device token pasado como query param 'token' en lugar de header Bearer.",
      },
    },
    references: fromTypes(
      process.env.NODE_ENV === "production" ? "dist/index.d.ts" : "src/index.ts"
    ),
  })
);
