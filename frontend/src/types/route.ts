export type RouteMatch = {
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
};

