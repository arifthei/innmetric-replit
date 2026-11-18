/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Same-origin path of the programme API. Defaults to `/api`. */
  readonly VITE_DEMO_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
