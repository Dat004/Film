import { describe, it, expect, vi } from 'vitest';

import { pushRoute, replaceRoute } from '@/lib/route-navigation';

describe('Route Navigation with View Transitions API', () => {
  it('calls router.push correctly when navigating to a new route', () => {
    const mockPush = vi.fn();
    pushRoute({ push: mockPush }, '/phim/doraemon');
    expect(mockPush).toHaveBeenCalledWith('/phim/doraemon');
  });

  it('calls router.replace correctly', () => {
    const mockReplace = vi.fn();
    replaceRoute({ replace: mockReplace }, '/phim/doraemon');
    expect(mockReplace).toHaveBeenCalledWith('/phim/doraemon');
  });
});
