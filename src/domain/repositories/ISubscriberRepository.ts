import { Subscriber } from '../entities/Subscriber';

export interface ISubscriberRepository {
  findByEmail(email: string): Promise<Subscriber | null>;
  save(subscriber: Subscriber): Promise<void>;
}
