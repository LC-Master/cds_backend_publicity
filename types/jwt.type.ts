import { JWTPayloadInput, JWTPayloadSpec } from "@elysiajs/jwt";
type NormalizedClaim = "nbf" | "exp" | "iat";
type AllowClaimValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | AllowClaimValue[]
  | {
      [key: string]: AllowClaimValue;
    };
import { type JWTVerifyOptions } from "jose";
type ClaimType = Record<string, AllowClaimValue>;

export type jwt = {
  sign(
    signValue: Omit<ClaimType, NormalizedClaim> & JWTPayloadInput
  ): Promise<string>;
  verify(
    jwt?: string,
    options?: JWTVerifyOptions
  ): Promise<false | (ClaimType & Omit<JWTPayloadSpec, never>)>;
};
