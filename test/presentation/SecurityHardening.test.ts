import { describe, it, expect, vi } from 'vitest';
import app from '../../src/index';
import { Bindings } from '../../src/infrastructure/types/Bindings';

describe('Security Hardening Integration Tests', () => {
    const mockEnv: Bindings = {
        ALLOWED_ORIGINS: 'http://localhost:5173',
        DB: {
            prepare: vi.fn().mockReturnThis(),
        } as unknown as D1Database,
        TURNSTILE_SECRET_KEY: 'test-secret-key',
    };

    it('should reject payloads larger than 10KB (Body Limit)', async () => {
        // Create a body larger than 10KB
        const largeData = 'a'.repeat(11 * 1024);
        const res = await app.request(
            '/newsletter/subscribe',
            {
                method: 'POST',
                body: JSON.stringify({ email: 'test@example.com', data: largeData }),
                headers: { 'Content-Type': 'application/json' },
            },
            mockEnv
        );

        expect(res.status).toBe(413);
        const body = await res.json() as { error: string };
        expect(body.error).toBe('Payload too large');
    });

    it('should reject requests with filled honeypot (Server-side Honeypot)', async () => {
        const res = await app.request(
            '/newsletter/subscribe',
            {
                method: 'POST',
                body: JSON.stringify({
                    email: 'bot@example.com',
                    turnstileToken: 'token',
                    website_url: 'http://malicious-bot.com' // Honeypot filled
                }),
                headers: { 'Content-Type': 'application/json' },
            },
            mockEnv
        );

        // Should return success: true but do nothing (silent ignore as per requirements)
        expect(res.status).toBe(200);
        const body = await res.json() as { success: boolean, message: string };
        expect(body.success).toBe(true);
        expect(body.message).toBe('Welcome to the waitlist!');
    });

    it('should reject non-JSON content types (Strict Media Type)', async () => {
        const res = await app.request(
            '/newsletter/subscribe',
            {
                method: 'POST',
                body: 'email=test@example.com&turnstileToken=token',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            },
            mockEnv
        );

        expect(res.status).toBe(415);
        const body = await res.json() as { error: string };
        expect(body.error).toBe('Unsupported Media Type');
    });

    it('should reject invalid JSON structure (Strict Validation)', async () => {
        const res = await app.request(
            '/newsletter/subscribe',
            {
                method: 'POST',
                body: JSON.stringify({ email: 12345, turnstileToken: {} }), // Invalid types
                headers: { 'Content-Type': 'application/json' },
            },
            mockEnv
        );

        expect(res.status).toBe(400);
        const body = await res.json() as { error: string };
        expect(body.error).toBe('Valid email is required');
    });
});
