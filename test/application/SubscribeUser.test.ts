import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubscribeUser } from '../../src/application/use-cases/SubscribeUser';
import { ISubscriberRepository } from '../../src/domain/repositories/ISubscriberRepository';
import { ITurnstileService } from '../../src/domain/services/ITurnstileService';
import { Subscriber } from '../../src/domain/entities/Subscriber';

describe('SubscribeUser Use Case (Deep Validation)', () => {
  let useCase: SubscribeUser;
  let mockRepo: ISubscriberRepository;
  let mockTurnstile: ITurnstileService;

  beforeEach(() => {
    mockRepo = {
      findByEmail: vi.fn(),
      save: vi.fn(),
    };
    mockTurnstile = {
      verifyToken: vi.fn(),
    };
    useCase = new SubscribeUser(mockRepo, mockTurnstile);
  });

  it('should verify turnstile BEFORE checking repository', async () => {
    vi.mocked(mockTurnstile.verifyToken).mockResolvedValue(false);

    await useCase.execute({ email: 'test@test.com', turnstileToken: 'invalid' });

    expect(mockTurnstile.verifyToken).toHaveBeenCalledWith('invalid');
    expect(mockRepo.findByEmail).not.toHaveReturned();
  });

  it('should NOT save if subscriber already exists', async () => {
    vi.mocked(mockTurnstile.verifyToken).mockResolvedValue(true);
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(new Subscriber('existing@test.com'));

    const result = await useCase.execute({ email: 'existing@test.com', turnstileToken: 'valid' });

    expect(result.success).toBe(true);
    expect(result.message).toContain('already on the list');
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should handle repository save errors gracefully', async () => {
    vi.mocked(mockTurnstile.verifyToken).mockResolvedValue(true);
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(null);
    vi.mocked(mockRepo.save).mockRejectedValue(new Error('DB Error'));

    const result = await useCase.execute({ email: 'new@test.com', turnstileToken: 'valid' });

    expect(result.success).toBe(false);
    expect(result.message).toContain('encountered an error');
  });

  it('should successfully save a new subscriber', async () => {
    vi.mocked(mockTurnstile.verifyToken).mockResolvedValue(true);
    vi.mocked(mockRepo.findByEmail).mockResolvedValue(null);
    vi.mocked(mockRepo.save).mockResolvedValue(undefined);

    const result = await useCase.execute({ email: 'new@test.com', turnstileToken: 'valid' });

    expect(result.success).toBe(true);
    expect(result.message).toContain('Welcome');
    expect(mockRepo.save).toHaveBeenCalled();

    // Verify that the saved subscriber has the correct email
    const savedSubscriber = vi.mocked(mockRepo.save).mock.calls[0][0];
    expect(savedSubscriber.email).toBe('new@test.com');
  });
});
