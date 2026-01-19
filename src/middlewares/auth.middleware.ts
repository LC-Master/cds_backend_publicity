import { auth } from "@src/plugin/auth.plugin";
import Elysia from "elysia";

export const authMiddleware = new Elysia().use(auth).onBeforeHandle(() => {});
