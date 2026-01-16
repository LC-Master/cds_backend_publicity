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
    return (await response.json()) as T;
  } catch (error) {
    logger.error({
      message: `[fetchDto] Error fetching DTO from ${url}: ${error}`,
    });
    return null;
  }
};
