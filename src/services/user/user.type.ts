export interface GoogleAccountProfile {
    id: string;
    email: string;
    name?: string;
    imageUrl?: string;
}

export interface GoogleAccount {
    refreshToken: string;
    profile: GoogleAccountProfile;
    grantedAt?: number;
}

export interface GoogleAccounts {
    [id: string]: GoogleAccount;
}

export interface GSuiteAccount {
    email: string;
    createdAt?: number;
    name?: string;
}

export interface Settings {
    lang?: string;
    defaultGoogleAccount?: string;
}

export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    createdAt?: number;
}

export interface SubscriptionItem {
    id: string;
    plan: string;
    updatedAt?: number;
    transaction?: Transaction;
}
export interface Subscription extends SubscriptionItem {
    startedAt?: number;
    previousPlans?: {
        [id: string]: SubscriptionItem;
    };
}

export interface NativeProfile {
    uid: string;
    email?: string;
    emailVerified?: boolean;
    displayName?: string;
    photoUrl?: string;
    providerId?: string;
    providerData?: any[];
}
export interface AdditionalProfile {
    updatedAt?: number;
    pin?: number;
    gsuiteAccount?: GSuiteAccount;
}
export interface Profile extends NativeProfile, AdditionalProfile {}

export interface GoogleLoginResponse {
    profile?: GoogleAccountProfile;
    refreshToken?: string;
    grantedAt?: number;
}
