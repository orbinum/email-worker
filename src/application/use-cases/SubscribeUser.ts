import { Subscriber } from '../../domain/entities/Subscriber';
import { ISubscriberRepository } from '../../domain/repositories/ISubscriberRepository';
import { ITurnstileService } from '../../domain/services/ITurnstileService';

export interface SubscribeUserRequest {
  email: string;
  turnstileToken: string;
}

export interface SubscribeUserResponse {
  success: boolean;
  message: string;
}

export class SubscribeUser {
  constructor(
    private subscriberRepo: ISubscriberRepository,
    private turnstileService: ITurnstileService
  ) {}

  async execute(request: SubscribeUserRequest): Promise<SubscribeUserResponse> {
    // 1. Verify Turnstile Token
    const isHuman = await this.turnstileService.verifyToken(request.turnstileToken);
    if (!isHuman) {
      return { success: false, message: 'Verification failed. Please try again.' };
    }

    // 2. Domain logic: Create Subscriber entity (validates email)
    let subscriber: Subscriber;
    try {
      subscriber = new Subscriber(request.email);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid subscriber data';
      return { success: false, message: errorMessage };
    }

    // 3. Check for duplicates
    const existing = await this.subscriberRepo.findByEmail(subscriber.email);
    if (existing) {
      return { success: true, message: 'You are already on the list!' };
    }

    // 4. Save to repository
    try {
      await this.subscriberRepo.save(subscriber);
      return { success: true, message: 'Welcome to the waitlist!' };
    } catch (error) {
      console.error('UseCase Error:', error);
      return { success: false, message: 'We encountered an error. Please try again later.' };
    }
  }
}
