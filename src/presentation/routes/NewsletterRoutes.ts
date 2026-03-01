import { Hono } from 'hono';
import { Bindings } from '../../infrastructure/types/Bindings';
import { createNewsletterController } from '../controllers/NewsletterControllerFactory';
import { honeypotMiddleware } from '../../infrastructure/middleware/honeypot';

const newsletter = new Hono<{ Bindings: Bindings }>();

// 1. Feature specific middlewares
newsletter.use('/subscribe', honeypotMiddleware());

/**
 * POST /subscribe
 */
newsletter.post('/subscribe', async (c) => {
  const controller = createNewsletterController(c.env);
  return controller.subscribe(c);
});

export { newsletter };
