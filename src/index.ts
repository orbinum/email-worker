import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { secureHeaders } from 'hono/secure-headers';
import { Bindings } from './infrastructure/types/Bindings';
import { corsMiddleware } from './infrastructure/middleware/cors';
import { router } from './presentation/router';

const app = new Hono<{ Bindings: Bindings }>();

// 1. Global Middlewares
app.use(
  '*',
  bodyLimit({
    maxSize: 10 * 1024, // 10KB
    onError: (c) => {
      console.error('Body limit exceeded');
      return c.json({ error: 'Payload too large' }, 413);
    },
  })
);
app.use('*', secureHeaders());
app.use('*', corsMiddleware());

// 2. Centralized Routing
app.route('/', router);

export default app;
