import { describe, it, expect } from 'vitest';
import { Subscriber } from '../../src/domain/entities/Subscriber';

describe('Subscriber Entity', () => {
  it('should create a valid subscriber', () => {
    const email = 'test@example.com';
    const subscriber = new Subscriber(email);
    expect(subscriber.email).toBe(email);
  });

  it('should throw error for invalid email', () => {
    expect(() => new Subscriber('invalid-email')).toThrow('Invalid email address');
  });

  it('should throw error for empty email', () => {
    expect(() => new Subscriber('')).toThrow('Invalid email address');
  });
});
