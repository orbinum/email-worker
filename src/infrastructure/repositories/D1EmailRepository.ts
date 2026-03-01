/// <reference types="@cloudflare/workers-types" />
import { ISubscriberRepository } from '../../domain/repositories/ISubscriberRepository';
import { Subscriber } from '../../domain/entities/Subscriber';

interface SubscriberRow {
  id: number;
  email: string;
  created_at: string;
}

export class D1EmailRepository implements ISubscriberRepository {
  constructor(private db: D1Database) {}

  async findByEmail(email: string): Promise<Subscriber | null> {
    const result = await this.db
      .prepare('SELECT * FROM subscribers WHERE email = ?')
      .bind(email)
      .first<SubscriberRow | null>();

    if (!result) return null;

    return new Subscriber(result.email, result.id, new Date(result.created_at));
  }

  async save(subscriber: Subscriber): Promise<void> {
    await this.db
      .prepare('INSERT INTO subscribers (email) VALUES (?)')
      .bind(subscriber.email)
      .run();
  }
}
