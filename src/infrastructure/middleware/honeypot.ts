import { MiddlewareHandler } from 'hono';

/**
 * Server-side Honeypot protection.
 * Discards requests where the hidden 'website_url' field is populated.
 */
export const honeypotMiddleware = (): MiddlewareHandler => {
    return async (c, next) => {
        if (c.req.method !== 'POST') {
            return next();
        }

        try {
            // Use clone to avoid consuming the body stream
            const body = (await c.req.raw.clone().json()) as Record<string, unknown>;
            if (body && body.website_url) {
                console.warn('Bot detected via server-side honeypot');
                return c.json({
                    success: true,
                    message: 'Welcome to the waitlist!'
                }); // Silent ignore
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Payload Too Large') {
                return c.json({ error: 'Payload too large' }, 413);
            }
            // If body is not JSON, we ignore and let other middlewares/controllers handle it
        }

        return next();
    };
};
