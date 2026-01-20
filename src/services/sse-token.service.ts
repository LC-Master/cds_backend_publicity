const Token_SSE_Container: Set<string> = new Set();

export abstract class SseTokenService {
  public static generate() {
    const token = Bun.randomUUIDv7();
    Token_SSE_Container.add(token);
    return token;
  }
  public static validate(token: string) {
    return Token_SSE_Container.has(token);
  }
}
