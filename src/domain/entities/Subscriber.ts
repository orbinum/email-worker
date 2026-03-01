export class Subscriber {
  constructor(
    public readonly email: string,
    public readonly id?: number,
    public readonly createdAt?: Date
  ) {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email address');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
}
