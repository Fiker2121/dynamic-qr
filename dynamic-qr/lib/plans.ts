export interface Plan {
  id: 'free' | 'pro';
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted: boolean;
}

/**
 * Single source of truth for plan copy. Billing is not connected, so no limits are
 * enforced; when you add Stripe, enforce `maxQrCodes` server-side in POST /api/qr-codes.
 */
export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'For trying Dynamic QR on a few projects.',
    features: ['5 QR codes', 'Basic customization', 'PNG download', 'Basic analytics'],
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9,
    description: 'For teams that print QR codes and need to know how they perform.',
    features: [
      'Unlimited QR codes',
      'Advanced customization',
      'PNG + SVG download',
      'Detailed analytics',
      'Device statistics',
      'Location analytics',
      'Priority support',
    ],
    highlighted: true,
  },
];
