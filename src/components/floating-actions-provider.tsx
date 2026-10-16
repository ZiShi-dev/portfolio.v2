"use client";

import { createContext, useCallback, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

type FloatingAction = "language" | "contact";
const FloatingActions = createContext<{
  active: FloatingAction | null;
  setActive: Dispatch<SetStateAction<FloatingAction | null>>;
} | null>(null);

export function FloatingActionsProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<FloatingAction | null>(null);
  return <FloatingActions.Provider value={{ active, setActive }}>{children}</FloatingActions.Provider>;
}

/** A single owner keeps both panels mutually exclusive, including keyboard use. */
export function useFloatingAction(name: FloatingAction) {
  const context = useContext(FloatingActions);
  if (!context) throw new Error("Floating actions require their provider");
  const { active, setActive } = context;
  const setOpen = useCallback<Dispatch<SetStateAction<boolean>>>((next) => {
    setActive((current) => {
      const open = typeof next === "function" ? next(current === name) : next;
      return open ? name : current === name ? null : current;
    });
  }, [name, setActive]);
  return [active === name, setOpen] as const;
}
