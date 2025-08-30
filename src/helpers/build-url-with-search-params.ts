export function buildUrlWithSearchParams(url: string, params: Record<string, string | number | boolean>) {
  const stringParams = Object.entries(params).map(([key, value]) => [key, String(value)] as [string, string]);
  const searchParams = new URLSearchParams(stringParams);

  return `${url}?${searchParams.toString()}`;
}
