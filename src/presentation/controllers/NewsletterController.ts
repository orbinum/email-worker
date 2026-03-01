import { Context } from 'hono';
import { SubscribeUser, SubscribeUserRequest } from '../../application/use-cases/SubscribeUser';

export class NewsletterController {
  constructor(private subscribeUser: SubscribeUser) { }

  /**
   * Handles the subscription HTTP request.
   */
  async subscribe(c: Context) {
    try {
      // 1. Validate content-type
      const contentType = c.req.header('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        return c.json({ error: 'Unsupported Media Type' }, 415);
      }

      const body = await c.req.json<SubscribeUserRequest>();
      const { email, turnstileToken } = body;

      // 2. Strict type validation
      if (typeof email !== 'string' || !email.trim()) {
        return c.json({ error: 'Valid email is required' }, 400);
      }

      if (turnstileToken && typeof turnstileToken !== 'string') {
        return c.json({ error: 'Invalid token format' }, 400);
      }

      // 3. Execute Use Case
      const response = await this.subscribeUser.execute({ email, turnstileToken });

      // 2. Map Response to HTTP
      if (!response.success) {
        const status = response.message.includes('Verification') ? 403 : 400;
        return c.json({ error: response.message }, status);
      }

      return c.json({ success: true, message: response.message });
    } catch (error) {
      if (error instanceof SyntaxError || (error instanceof Error && error.name === 'SyntaxError')) {
        return c.json({ error: 'Invalid JSON payload' }, 400);
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown server error';

      if (errorMessage === 'Payload Too Large') {
        return c.json({ error: 'Payload too large' }, 413);
      }

      console.error('Controller Error:', errorMessage);
      return c.json({ error: 'Server error' }, 500);
    }
  }
}
