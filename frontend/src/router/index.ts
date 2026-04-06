import type { RouteMatch } from "../types/route";

export const parseRoute = (): RouteMatch => {
  const rawHash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const full = rawHash || "/";
  const [rawPath, rawQuery = ""] = full.split("?");
  const path = rawPath || "/";
  const query = new URLSearchParams(rawQuery);
  const deviceMatch = path.match(/^\/devices\/([^/]+)$/);
  if (deviceMatch) {
    return {
      path: "/devices/:deviceCode",
      params: { deviceCode: decodeURIComponent(deviceMatch[1]) },
      query,
    };
  }
  return { path, params: {}, query };
};

export const toHashPath = (target: string) =>
  target.startsWith("/") ? target : `/${target}`;

export const navigateTo = (target: string) => {
  window.location.hash = toHashPath(target);
};

export const currentHashPath = (): string =>
  window.location.hash.startsWith("#")
    ? window.location.hash.slice(1) || "/"
    : "/";

