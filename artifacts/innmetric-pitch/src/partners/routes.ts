import { Briefcase, Network } from "lucide-react";

/** Paths are relative to the app base (`/innmetric-pitch/` on Replit, `/collab/` on innmetric.com). */
export const PARTNER_ROUTES = [
  { id: "ireckonu", path: "/partners/ireckonu/", label: "Ireckonu", icon: Network },
  { id: "torus-legacy", path: "/partners/torus-legacy/", label: "Torus Legacy", icon: Briefcase },
] as const;

export type PartnerId = (typeof PARTNER_ROUTES)[number]["id"];

/** Base path without its trailing slash, e.g. "/collab". Empty when the app is served from the origin root. */
export const APP_BASE = import.meta.env.BASE_URL.replace(/\/+$/, "");

/** Absolute href for a path inside the app, e.g. appHref("/partners/ireckonu/") → "/collab/partners/ireckonu/". */
export const appHref = (path: string) => `${APP_BASE}${path}`;

/**
 * The main demo page this tab last showed. Saved on every change and restored on every mount, so leaving for a
 * partner page and coming back with Back/Forward (any number of times) never changes the page or the role.
 */
const PAGE_KEY = "innmetric-demo-page-v1";

export function storePage(page: string) {
  try { sessionStorage.setItem(PAGE_KEY, page); } catch {}
}

export function readStoredPage(): string | null {
  try {
    return sessionStorage.getItem(PAGE_KEY);
  } catch {
    return null;
  }
}
