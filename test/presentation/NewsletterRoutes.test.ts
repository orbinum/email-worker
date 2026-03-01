import { describe, it, expect, vi } from 'vitest';
import app from '../../src/index';
import { Bindings } from '../../src/infrastructure/types/Bindings';

interface MockResponse {
  success?: boolean;
  message?: string;
  error?: string;
  status?: string;
}

describe('Newsletter Integration (Presentation - Full Type Safety)', () => {
  // We mock the DB with a type-safe approach for Vitest
  const mockPrepare = vi.fn().mockReturnThis();
  const mockBind = vi.fn().mockReturnThis();
  const mockFirst = vi.fn();
  const mockRun = vi.fn();

  const mockEnv: Bindings = {
    ALLOWED_ORIGINS: 'http://localhost:5173',
    DB: {
      prepare: mockPrepare,
    } as unknown as D1Database,
    TURNSTILE_SECRET_KEY: 'test-secret-key',
  };

  // Helper to setup mock chain
  mockPrepare.mockReturnValue({
    bind: mockBind.mockReturnValue({
      first: mockFirst,
      run: mockRun,
    }),
  });

  it('should return 200 for health check', async () => {
    const res = await app.request('/health', {}, mockEnv);
    expect(res.status).toBe(200);
    const body = (await res.json()) as MockResponse;
    expect(body.status).toBe('ok');
  });

  it('should return 400 for invalid email format', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ success: true }),
    } as Response);

    const res = await app.request(
      '/newsletter/subscribe',
      {
        method: 'POST',
        body: JSON.stringify({ email: 'not-an-email', turnstileToken: 'token' }),
        headers: { 'Content-Type': 'application/json' },
      },
      mockEnv
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as MockResponse;
    expect(body.error).toContain('Invalid email');
  });

  it('should handle duplicate subscriptions correctly', async () => {
    mockFirst.mockResolvedValue({
      email: 'duplicate@test.com',
      created_at: new Date().toISOString(),
    });

    const res = await app.request(
      '/newsletter/subscribe',
      {
        method: 'POST',
        body: JSON.stringify({ email: 'duplicate@test.com', turnstileToken: 'token' }),
        headers: { 'Content-Type': 'application/json' },
      },
      mockEnv
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as MockResponse;
    expect(body.message).toContain('already on the list');
  });
});
