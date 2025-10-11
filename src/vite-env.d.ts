/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_PROXY: string;
  readonly VITE_AIRPORT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
    