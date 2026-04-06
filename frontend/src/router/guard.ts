import { isAdminLoggedIn } from "../api/backend";
import type { RouteMatch } from "../types/route";
import { currentHashPath, navigateTo } from "./index";

export const applyAuthGuard = (route: RouteMatch): boolean => {
  const loggedIn = isAdminLoggedIn();
  const isPublic = route.path === "/login";

  if (!isPublic && !loggedIn) {
    const currentHash = currentHashPath();
    navigateTo(`/login?redirect=${encodeURIComponent(currentHash || "/")}`);
    return false;
  }

  if (isPublic && loggedIn) {
    navigateTo("/");
    return false;
  }

  return true;
};

