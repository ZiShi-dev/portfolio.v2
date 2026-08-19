import "server-only";

import { brand } from "@/lib/brand";

function optionalEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function optionalHttpUrl(name: string): string | null {
  const value = optionalEnv(name);
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

/**
 * Informations publiques de l'éditeur. Elles restent côté serveur et ne sont
 * rendues que sur la page légale. Ne jamais inventer une donnée juridique.
 */
export function getLegalConfig() {
  return {
    publisherName: optionalEnv("LEGAL_PUBLISHER_NAME") ?? brand.name,
    legalForm: optionalEnv("LEGAL_FORM"),
    address: optionalEnv("LEGAL_ADDRESS"),
    registration: optionalEnv("LEGAL_REGISTRATION"),
    vatNumber: optionalEnv("LEGAL_VAT_NUMBER"),
    shareCapital: optionalEnv("LEGAL_SHARE_CAPITAL"),
    phone: optionalEnv("LEGAL_PHONE"),
    publicationDirector: optionalEnv("LEGAL_PUBLICATION_DIRECTOR"),
    mediatorName: optionalEnv("LEGAL_MEDIATOR_NAME"),
    mediatorAddress: optionalEnv("LEGAL_MEDIATOR_ADDRESS"),
    mediatorUrl: optionalHttpUrl("LEGAL_MEDIATOR_URL"),
  };
}
