import { ITurnstileService } from '../../domain/services/ITurnstileService';

interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export class CloudflareTurnstileService implements ITurnstileService {
  constructor(private secretKey: string) {}

  async verifyToken(token: string): Promise<boolean> {
    const formData = new FormData();
    formData.append('secret', this.secretKey);
    formData.append('response', token);

    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    try {
      const result = await fetch(url, {
        body: formData,
        method: 'POST',
      });

      const outcome = (await result.json()) as TurnstileResponse;
      return !!outcome.success;
    } catch (error) {
      console.error('Turnstile verification error:', error);
      return false;
    }
  }
}
