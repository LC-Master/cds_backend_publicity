import { dto } from "../schemas/dto.schema";
import { logger } from "./logger.provider";

export const fetchDto = async <T>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${Bun.env.API_KEY_CMS}`,
      },
    });

    if (!response.ok) {
      logger.error({ message: `[fetchDto] HTTP error: ${response.status}` });
      return null;
    }
    const result = dto.safeParse(await response.json());

    if (!result.success) {
      logger.error(
        {
          url,
          issues: result.error.issues,
        },
        "[fetchDto] DTO validation failed"
      );

      throw new Error("DTO validation failed");
    }
    return result.data as T;
  } catch (error) {
    logger.error({
      message: `[fetchDto] Error fetching DTO from ${url}: ${error}`,
    });
    return null;
  }
};
