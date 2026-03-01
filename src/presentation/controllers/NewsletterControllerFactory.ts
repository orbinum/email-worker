import { NewsletterController } from '../controllers/NewsletterController';
import { SubscribeUser } from '../../application/use-cases/SubscribeUser';
import { D1EmailRepository } from '../../infrastructure/repositories/D1EmailRepository';
import { CloudflareTurnstileService } from '../../infrastructure/services/CloudflareTurnstileService';
import { SubscribeUserRequest } from '../../application/use-cases/SubscribeUser';

/**
 * Factory for the NewsletterController with all its dependencies.
 */
export const createNewsletterController = (env: any) => {
    const subscriberRepo = new D1EmailRepository(env.DB);
    const turnstileService = new CloudflareTurnstileService(env.TURNSTILE_SECRET_KEY);
    const subscribeUser = new SubscribeUser(subscriberRepo, turnstileService);
    return new NewsletterController(subscribeUser);
};
