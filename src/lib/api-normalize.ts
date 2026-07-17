export type CategoryNavItem = {
  _id?: string;
  slug?: string;
  name?: string;
  [key: string]: unknown;
};

export type CategoryNavData = [CategoryNavItem[], CategoryNavItem[]];

/** Normalize phimapi payloads ({ data: { items } } | array) into a list. */
export function extractListItems(payload: unknown): CategoryNavItem[] {
  if (Array.isArray(payload)) return payload as CategoryNavItem[];

  if (payload && typeof payload === 'object') {
    const root = payload as Record<string, unknown>;
    const data = root.data;

    if (data && typeof data === 'object') {
      const dataObj = data as Record<string, unknown>;
      if (Array.isArray(dataObj.items)) return dataObj.items as CategoryNavItem[];
      if (Array.isArray(data)) return data as CategoryNavItem[];
    }

    if (Array.isArray(root.items)) return root.items as CategoryNavItem[];
  }

  return [];
}

/** Always returns [categories, countries] — safe for null/undefined/raw API payloads. */
export function normalizeCategoryNavData(data: unknown): CategoryNavData {
  const safe = Array.isArray(data) ? data : [];

  const categories = Array.isArray(safe[0])
    ? (safe[0] as CategoryNavItem[])
    : extractListItems(safe[0]);

  const countries = Array.isArray(safe[1])
    ? (safe[1] as CategoryNavItem[])
    : extractListItems(safe[1]);

  return [categories, countries];
}
