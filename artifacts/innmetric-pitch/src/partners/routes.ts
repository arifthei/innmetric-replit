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

/** Main demo page the visitor left when opening a partner pitch, so Back to the main demo lands there again. */
export const RETURN_PAGE_KEY = "innmetric-demo-return-page-v1";

export function rememberReturnPage(page: string) {
  try { sessionStorage.setItem(RETURN_PAGE_KEY, page); } catch {}
}

export function takeReturnPage(): string | null {
  try {
    const page = sessionStorage.getItem(RETURN_PAGE_KEY);
    sessionStorage.removeItem(RETURN_PAGE_KEY);
    return page;
  } catch {
    return null;
  }
}
