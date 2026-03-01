import { cors } from 'hono/cors';
import { MiddlewareHandler } from 'hono';
import { Bindings } from '../types/Bindings';

/**
 * Configures CORS for the application.
 */
export const corsMiddleware = (): MiddlewareHandler<{ Bindings: Bindings }> => {
  return async (c, next) => {
    const allowedOrigins = c.env.ALLOWED_ORIGINS
      ? c.env.ALLOWED_ORIGINS.split(',').map((o: string) => o.trim())
      : []; // Strict: No origins allowed if not explicitly configured

    const corsHandler = cors({
      origin: allowedOrigins,
      allowMethods: ['POST', 'OPTIONS', 'GET'],
      allowHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400,
      credentials: true,
    });

    return corsHandler(c, next);
  };
};
