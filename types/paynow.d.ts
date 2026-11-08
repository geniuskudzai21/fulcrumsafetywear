declare module "paynow" {
  export type PaynowInitResponse = {
    success: boolean;
    hasRedirect: boolean;
    redirectUrl?: string;
    error?: string;
    pollUrl?: string;
    instructions?: string;
    status?: string;
    isInnbucks?: boolean;
    innbucks_info?: {
      authorizationcode: string;
      deep_link_url: string;
      qr_code: string;
      expires_at: string;
    }[];
  };

  export type PaynowStatusResponse = {
    reference: string;
    amount: string;
    paynowReference: string;
    pollUrl: string;
    status: string;
    error?: string;
  };

  export class Payment {
    reference: string;
    authEmail: string;
    add(title: string, amount: number, quantity?: number): Payment;
    total(): number;
    info(): string;
  }

  export class Paynow {
    constructor(
      integrationId?: string,
      integrationKey?: string,
      resultUrl?: string,
      returnUrl?: string,
    );

    integrationId: string;
    integrationKey: string;
    resultUrl: string;
    returnUrl: string;

    createPayment(reference: string, authEmail: string): Payment;
    send(payment: Payment): Promise<PaynowInitResponse | null>;
    sendMobile(
      payment: Payment,
      phone: string,
      method: string,
    ): Promise<PaynowInitResponse | null>;
    pollTransaction(pollUrl: string): Promise<PaynowInitResponse | null>;
    parseStatusUpdate(body: string): PaynowStatusResponse;
    generateHash(values: Record<string, string>, integrationKey: string): string;
    verifyHash(values: Record<string, string>): boolean;
  }
}
