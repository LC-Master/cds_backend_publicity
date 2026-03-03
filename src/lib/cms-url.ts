import { CONFIG } from "@src/config/config";

const API_PREFIX = "api";

function buildCmsApiBase(): URL {
  const base = new URL(CONFIG.CMS_BASE_URL);
  const normalizedPath = base.pathname.replace(/\/+$/g, "");

  if (!normalizedPath || normalizedPath === "/") {
    base.pathname = `/${API_PREFIX}/`;
    return base;
  }

  const pathParts = normalizedPath.split("/").filter(Boolean);
  if (pathParts[pathParts.length - 1] !== API_PREFIX) {
    pathParts.push(API_PREFIX);
  }

  base.pathname = `/${pathParts.join("/")}/`;
  return base;
}

export function cmsApiUrl(pathname: string): string {
  const base = buildCmsApiBase();
  const safePath = pathname.replace(/^\/+/, "");
  return new URL(safePath, base).toString();
}

export function cmsMediaUrl(mediaId: string): string {
  const safeId = encodeURIComponent(mediaId);
  return cmsApiUrl(`media/${safeId}`);
}
