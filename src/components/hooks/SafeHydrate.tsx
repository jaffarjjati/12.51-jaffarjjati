"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const emptySubscribe = () => () => {};

const SafeHydrate = ({ children }: { children: ReactNode }) => {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) return null; // Prevent hydration mismatch

  return <>{children}</>;
};

export default SafeHydrate;
