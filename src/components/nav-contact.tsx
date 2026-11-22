"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { FooterSocialLink } from "@/lib/brand";
import { getConfiguredSocialLinks } from "@/lib/social/public-links";

export type NavContactData = {
  contactEmail: string;
  socials: FooterSocialLink[];
};

const NavContactContext = createContext<NavContactData | null>(null);
const SetNavContactContext = createContext<(value: NavContactData | null) => void>(() => {});

export function NavContactProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<NavContactData | null>(null);
  return (
    <SetNavContactContext.Provider value={setValue}>
      <NavContactContext.Provider value={value}>{children}</NavContactContext.Provider>
    </SetNavContactContext.Provider>
  );
}

export function useNavContact() {
  return useContext(NavContactContext);
}

/** Reçoit les réglages publics déjà résolus et les rend disponibles dans la barre. */
export function PublishNavContact({ contactEmail, socials }: NavContactData) {
  const setValue = useContext(SetNavContactContext);
  useEffect(() => {
    setValue({ contactEmail, socials });
  }, [contactEmail, socials, setValue]);
  return null;
}

export function navContactEntries(data: NavContactData | null, emailLabel: string) {
  const socials = getConfiguredSocialLinks(data?.socials ?? []);
  const email = data?.contactEmail?.trim() ?? "";
  return [
    ...socials.map((social) => ({
      id: social.id,
      href: social.href,
      label: social.label,
      preferred: Boolean(social.preferred),
      external: true,
    })),
    ...(email
      ? [{ id: "email" as const, href: `mailto:${email}`, label: emailLabel, preferred: false, external: false }]
      : []),
  ];
}
