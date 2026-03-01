/// <reference types="@cloudflare/workers-types" />

/**
 * Cloudflare Worker Environment Bindings.
 * This defines the contract between the platform and the application.
 */
export type Bindings = {
  DB: D1Database;
  TURNSTILE_SECRET_KEY: string;
  ALLOWED_ORIGINS?: string;
};
