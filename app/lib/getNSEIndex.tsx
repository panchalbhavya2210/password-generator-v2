import { NSE_INDEX_MAP } from "./index-map";

export function getNseIndexUrl(label: string) {
  const indexName = NSE_INDEX_MAP[label];

  if (!indexName) return null;

  const encoded = encodeURIComponent(indexName);

  return `/dashboard/equity-stockindices/${encoded}`;
}
