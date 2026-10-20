"use client";

import LoadingBar, { type LoadingBarRef } from "react-top-loading-bar";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

type TopLoaderApi = { begin: () => () => void };

const TopLoaderContext = createContext<TopLoaderApi | null>(null);

export function TopLoaderProvider({ children }: { children: ReactNode }) {
  const barRef = useRef<LoadingBarRef>(null);
  const pendingCount = useRef(0);
  const navigating = useRef(false);
  const running = useRef(false);
  const navTimeout = useRef<number | undefined>(undefined);

  const sync = useCallback(() => {
    const busy = pendingCount.current > 0 || navigating.current;
    if (busy && !running.current) {
      running.current = true;
      barRef.current?.continuousStart(14, 400);
    } else if (!busy && running.current) {
      running.current = false;
      barRef.current?.complete();
    }
  }, []);

  const begin = useCallback(() => {
    pendingCount.current += 1;
    sync();
    let released = false;
    return () => {
      if (released) return;
      released = true;
      pendingCount.current = Math.max(0, pendingCount.current - 1);
      sync();
    };
  }, [sync]);

  const endNavigation = useCallback(() => {
    window.clearTimeout(navTimeout.current);
    if (!navigating.current) return;
    navigating.current = false;
    sync();
  }, [sync]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!(anchor instanceof HTMLAnchorElement) || !anchor.href) return;
      if ((anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;

      const next = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);
      if (next.origin !== current.origin) return;
      if (next.pathname === current.pathname && next.search === current.search) return;

      navigating.current = true;
      sync();
      window.clearTimeout(navTimeout.current);
      navTimeout.current = window.setTimeout(() => {
        navigating.current = false;
        sync();
      }, 15000);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [sync]);

  const api = useMemo(() => ({ begin }), [begin]);

  return (
    <TopLoaderContext.Provider value={api}>
      <LoadingBar
        ref={barRef}
        color="linear-gradient(90deg, #15803d, #65a30d 45%, #a3e635 80%, #d4f65a)"
        height={3}
        shadow={false}
        waitingTime={350}
        className="shadow-[0_0_14px_rgb(101_163_13/0.55)]"
      />
      <Suspense fallback={null}>
        <RouteChangeListener onChange={endNavigation} />
      </Suspense>
      {children}
    </TopLoaderContext.Provider>
  );
}

function RouteChangeListener({ onChange }: { onChange: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    onChange();
  }, [routeKey, onChange]);

  return null;
}

export function useTopLoaderWhile(active: boolean) {
  const api = useContext(TopLoaderContext);

  useEffect(() => {
    if (!active || !api) return;
    return api.begin();
  }, [active, api]);
}
