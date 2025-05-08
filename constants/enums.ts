export const SubscriptionStatus = {
    FREE: 'Free',
    PREMIUM: 'Premium',
} as const;

export type SubscriptionStatusType =
    (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];