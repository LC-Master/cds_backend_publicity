import { logger } from "@src/providers/logger.provider";
import { ZodType } from "zod";

/**
 * Valida un DTO utilizando el esquema Zod.
 * @template T
 * @param {any} data - Datos a validar.
 * @param {ZodType<any>} schema - Esquema Zod para validar.
 * @returns {T} DTO validado.
 * @throws {Error} Si la validación falla.
 */
export const parseSchema = <T>(data: any, schema: ZodType<any>): T => {
    const result = schema.safeParse(data);

    if (!result.success) {
        logger.error(
            {
                issues: result.error.issues,
            },
            "[parseDTO] DTO validation failed"
        );

        throw new Error("DTO validation failed");
    }

    return result.data as T;
};
