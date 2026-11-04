"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useIsFetching } from "@tanstack/react-query";
import {
  ModuleDataLoadingOverlay,
  moduleContentMinHeightClass,
} from "@/components/ui/module-page-loading";
import { cn } from "@/lib/utils";

const SETTLE_MS = 50;
const WAIT_FOR_QUERIES_MS = 400;

export function ModuleRouteReady({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const fetching = useIsFetching();
  const fetchingRef = useRef(fetching);
  fetchingRef.current = fetching;
  const sawFetchingRef = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    sawFetchingRef.current = false;
  }, [pathname]);

  useEffect(() => {
    if (fetching > 0) {
      sawFetchingRef.current = true;
    }
  }, [fetching]);

  useEffect(() => {
    if (ready) return;
    if (fetching > 0) return;

    const delay = sawFetchingRef.current ? SETTLE_MS : WAIT_FOR_QUERIES_MS;
    const id = window.setTimeout(() => {
      if (fetchingRef.current === 0) {
        setReady(true);
      }
    }, delay);
    return () => window.clearTimeout(id);
  }, [pathname, fetching, ready]);

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col",
        moduleContentMinHeightClass,
      )}
    >
      {!ready ? <ModuleDataLoadingOverlay className="pointer-events-auto" /> : null}
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          !ready && "invisible",
        )}
        aria-hidden={!ready}
      >
        {children}
      </div>
    </div>
  );
}
