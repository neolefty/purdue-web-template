/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    __DJANGO_CONTEXT__: {
      debug: boolean
      authMethod: 'email' | 'saml'
      csrfToken: string
    }
  }
}
