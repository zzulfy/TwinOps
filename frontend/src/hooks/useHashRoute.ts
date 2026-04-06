import { useEffect, useState } from "react";
import type { RouteMatch } from "../types/route";
import { parseRoute } from "../router";

export default function useHashRoute(): RouteMatch {
  const [route, setRoute] = useState<RouteMatch>(() => parseRoute());

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHashChange);
    onHashChange();
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}

