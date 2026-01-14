export const fetchDto = async <T>(url: string): Promise<T | null> => {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${Bun.env.API_KEY_CMS}`,
      },
    });

    if (!response.ok) {
      console.error(`❌ Error HTTP: ${response.status}`);
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("❌ Error al obtener el DTO:", error);
    return null;
  }
};
