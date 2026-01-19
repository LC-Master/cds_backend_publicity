import { prisma } from "../providers/prisma";

export abstract class TokenRepository {
  public static async get() {
    const token = await prisma.apiKeY.findUnique({ where: { id: 1 } });
    return token?.key || null;
  }
  public static async exists() {
    const token = await prisma.apiKeY.findUnique({ where: { id: 1 } });
    return !!token;
  }
  public static async save(hashedToken: string) {
    const result = await prisma.apiKeY.upsert({
      where: { id: 1 },
      create: { key: hashedToken },
      update: { key: hashedToken },
    });
    return { key: result.key };
  }
}
