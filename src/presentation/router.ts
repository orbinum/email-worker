import { Hono } from 'hono';
import { Bindings } from '../infrastructure/types/Bindings';
import { newsletter } from './routes/NewsletterRoutes';

/**
 * Centralized router for the application.
 * Aggregates all feature-specific routes into a single entry point for the presentation layer.
 */
const router = new Hono<{ Bindings: Bindings }>();

// Register feature routes
router.route('/newsletter', newsletter);

// Health check route moved to centralized router
router.get('/health', (c) =>
  c.json({
    status: 'ok',
    service: 'email-worker',
    timestamp: new Date().toISOString(),
  })
);

export { router };
