export type RoleKey = 'admin' | 'seller' | 'sales_manager';

export const normalizeRole = (role?: string): RoleKey | null => {
  const normalized = role?.toLowerCase() ?? '';

  if (normalized === 'admin') return 'admin';
  if (normalized === 'seller') return 'seller';
  if (normalized === 'sales_manager') return 'sales_manager';

  return null;
};

export const getDefaultRouteForRole = (role?: string): string => {
  const normalized = normalizeRole(role);

  if (normalized === 'admin') return '/analytics';
  if (normalized === 'seller' || normalized === 'sales_manager') return '/production';

  return '/production';
};
