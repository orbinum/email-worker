export interface ITurnstileService {
  verifyToken(token: string): Promise<boolean>;
}
