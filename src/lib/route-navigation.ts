/** Emits navigation state before delegating to the App Router. */
type Listener = () => void;

const listeners = new Set<Listener>();

export function startRouteNavigation(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeRouteNavigationStart(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function isSameAppPath(href: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const current = new URL(window.location.href);
    const next = new URL(href, window.location.href);
    return (
      next.origin === current.origin &&
      next.pathname === current.pathname &&
      next.search === current.search
    );
  } catch {
    return false;
  }
}

export function pushRoute(router: { push: (href: string) => void }, href: string): void {
  if (isSameAppPath(href)) return;
  startRouteNavigation();
  router.push(href);
}

export function replaceRoute(router: { replace: (href: string) => void }, href: string): void {
  if (isSameAppPath(href)) return;
  startRouteNavigation();
  router.replace(href);
}

export function backRoute(router: { back: () => void }): void {
  startRouteNavigation();
  router.back();
}
