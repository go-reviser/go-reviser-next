export const SubscriptionStatus = {
    FREE: 'Free',
    PREMIUM: 'Premium',
} as const;

export type SubscriptionStatusType =
    (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export enum Difficulty {
    EASY = 'Easy',
    MEDIUM = 'Medium',
    HARD = 'Hard'
}

export type DiffcultyType = (typeof Difficulty)[keyof typeof Difficulty];