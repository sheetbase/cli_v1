import axios from 'axios';
import { User } from 'firebase/app';
const config = require('configstore');
const configstore = new config('sheetbase_cli');

import { timeDeltaByHour } from './utils';
import { PROJECT_SHEETBASE_NET_OPTIONS,
    databaseObject, databaseUpdate, authLogin, authLoginUsingToken, authRegister, authLogout,
} from './firebase';
import {
    appApiGETUserToken, appApiPOSTUserSubscription, appApiPOSTUserGoogleAccounts,
} from './api';

export const NATIVE_PROFILE_KEYS = ['displayName', 'photoURL'];
export const CUSTOM_PROFILE_KEYS = ['pin'];
export const MAX_SILENTLY_LOGIN_ATTEMPT = 3;

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

/**
 * auth basic actions
 */
export async function isSignedIn(): Promise<boolean> {
    const refreshToken: string = await getUserRefreshToken();
    return !!refreshToken;
}

export async function login(userEmail: string, password: string): Promise<User> {
    const { user } =  await authLogin(userEmail, password);
    await saveUserCredentials(user); // save credentials to configstore
    return user;
}

async function loginUsingToken(customToken: string): Promise<User> {
    const { user } = await authLoginUsingToken(customToken);
    return user;
}

export async function register(email: string, password: string): Promise<User> {
    const { user } = await authRegister(email, password);
    await saveUserCredentials(user); // save credentials to configstore
    return user;
}

export async function logout() {
    removeUserProfileFromCache();
    removeUserSubscriptionFromCache();
    removeUserCredentials();
    return await authLogout();
}

async function loginSilently(retryCounter: number = null): Promise<User> {
    if (!retryCounter || isNaN(retryCounter)) { retryCounter = 1; }
    let customToken: string;
    customToken = await getUserCustomToken();
    if (!customToken) {
        if ((retryCounter - 1) < MAX_SILENTLY_LOGIN_ATTEMPT) {
            deleteUserCustomToken();
            return await loginSilently(++retryCounter);
        } else {
            throw new Error('Errors, please try again!');
        }
    }
    const user: User = await loginUsingToken(customToken);
    return user;
}

/**
 * user profile
 */
export async function getUserProfile(cache = false): Promise<Profile> {
    let profile: Profile;
    const cachedProfile = getUserProfileFromCache();
    if (cache && cachedProfile) {
        profile = cachedProfile;
    } else {
        const user: User = await loginSilently();
        profile = await getUserProfileFromUser(user);
        // cache
        setUserProfileToCache(profile);
    }
    return profile;
}

export async function updateProfile(data: any): Promise<Profile> {
    const user: User = await loginSilently();
    const uid = user.uid;
    // preapare updating data
    const additionalProfilePath = `/userProfile/${uid}`;
    const nativeProfileUpdates: any = {};
    const customProfileUpdates: any = {};
    for (const key of Object.keys(data)) {
        const value = data[key];
        if (NATIVE_PROFILE_KEYS.includes(key)) {
            nativeProfileUpdates[key] = value;
        }
        if (CUSTOM_PROFILE_KEYS.includes(key)) {
            customProfileUpdates[`${additionalProfilePath}/${key}`] = value;
        }
    }
    // update
    if (Object.keys(customProfileUpdates).length > 0) {
        customProfileUpdates[`${additionalProfilePath}/updatedAt`] = (new Date()).getTime();
        await databaseUpdate(customProfileUpdates); // save to custom profile
    }
    if (Object.keys(nativeProfileUpdates).length > 0) {
        await user.updateProfile(nativeProfileUpdates); // and native profile
    }
    // return new general profile
    return await getUserProfile();
}

async function getUserProfileFromUser(user: User): Promise<Profile> {
    const { uid, email, emailVerified, displayName, providerId, providerData } = user;
    // fetch additional profile
    const additionalProfile: AdditionalProfile = await getUserAdditionalProfile(uid);
    return { ...additionalProfile, uid, email, emailVerified, displayName, providerId, providerData };
}

async function getUserAdditionalProfile(uid: string): Promise<AdditionalProfile> {
    const additionalProfilePath = `/userProfile/${uid}`;
    const additionalProfile: AdditionalProfile = await databaseObject(additionalProfilePath);
    // create inital values if not exists
    const updates: any = {};
    if (!additionalProfile.pin) {
        updates[`${additionalProfilePath}/pin`] = Math.floor(Math.random() * 9000) + 1000;
    }
    if (Object.keys(updates).length > 0) {
        updates[`${additionalProfilePath}/updatedAt`] = (new Date()).getTime();
        await databaseUpdate(updates);
    }
    return await databaseObject(additionalProfilePath);
}

function getUserProfileFromCache(): Profile {
    let profile: Profile;
    const userProfile = configstore.get('user_profile');
    // TODO: check cache expiration
    if (userProfile && userProfile.profile) {
        profile = userProfile.profile;
    }
    return profile;
}

function setUserProfileToCache(profile: Profile): void {
    return configstore.set('user_profile', {
        profile,
        at: (new Date()).getTime(),
    });
}

function removeUserProfileFromCache(): void {
    return configstore.delete('user_profile');
}

/**
 * user credentials
 */
export async function getUserCredentials(): Promise<{
    refreshToken: string;
    idToken: string;
    customToken: string;
}> {
    const refreshToken: string = await getUserRefreshToken();
    const idToken: string = await getUserIdToken();
    const customToken: string = await getUserCustomToken();
    return { refreshToken, idToken, customToken }; // return as is
}

async function saveUserCredentials(user: User): Promise<void> {
    // save user credentials to configstore
    const refreshToken = user.refreshToken;
    const idToken = await user.getIdToken();
    if (refreshToken) {
        configstore.set('user_credentials.refreshToken', refreshToken);
    }
    if (idToken) {
        configstore.set('user_credentials.idToken', {
            idToken, obtainedAt: (new Date()).getTime(),
        });
    }
}

function removeUserCredentials(): void {
    return configstore.delete('user_credentials');
}

async function getUserRefreshToken(): Promise<string> {
    let refreshToken: string;
    try {
        refreshToken = configstore.get('user_credentials.refreshToken');
    } catch (error) {
        refreshToken = null;
    }
    return refreshToken; // return as is
}

export async function getUserCustomToken(): Promise<string> {
    let customToken: string;
    let obtainedAt: number;
    try {
        const localCustomToken = configstore.get('user_credentials.customToken') as
                                {customToken?: string, obtainedAt?: number};
        if (!localCustomToken) { throw new Error('No local custom token.'); }
        customToken = localCustomToken.customToken;
        obtainedAt = localCustomToken.obtainedAt;
    } catch (error) {
        customToken = null;
        obtainedAt = 0;
    }
    // try renew the token 1 time
    if (!customToken || timeDeltaByHour(obtainedAt) > 0) {
        try {
            customToken = await renewUserCustomToken();
        } catch (error) {
            customToken = null;
        }
    }
    return customToken; // return as is
}
async function renewUserCustomToken(): Promise<string> {
    deleteUserCustomToken();
    const idToken = await getUserIdToken();
    if (!idToken) { throw new Error('No id token.'); }
    const { error, message, token } = await appApiGETUserToken(idToken);
    if (error) { throw new Error(message); }
    configstore.set('user_credentials.customToken', {
        customToken: token,
        obtainedAt: (new Date()).getTime(),
    });
    return token;
}
function deleteUserCustomToken(): void {
    return configstore.delete('user_credentials.customToken');
}

export async function getUserIdToken(): Promise<string> {
    let idToken: string;
    let obtainedAt: number;
    try {
        const localIdToken = configstore.get('user_credentials.idToken') as
                            {idToken?: string, obtainedAt?: number};
        if (!localIdToken) { throw new Error('No local id token.'); }
        idToken = localIdToken.idToken;
        obtainedAt = localIdToken.obtainedAt;
    } catch (error) {
        idToken = null;
        obtainedAt = 0;
    }
    // try renew the token 1 time
    if (!idToken || timeDeltaByHour(obtainedAt) > 0) {
        try {
            idToken = await renewUserIdToken();
        } catch (error) {
            idToken = null;
        }
    }
    return idToken; // return as is
}
async function renewUserIdToken(): Promise<string> {
    deleteUserIdToken();
    const refreshToken = await getUserRefreshToken();
    if (!refreshToken) { throw new Error('No refresh token.'); }
    const idToken: string = await exchangeRefreshTokenForIdToken(refreshToken);
    configstore.set('user_credentials.idToken', {
        idToken,
        obtainedAt: (new Date()).getTime(),
    });
    return idToken;
}
function deleteUserIdToken(): void {
    return configstore.delete('user_credentials.idToken');
}

async function exchangeRefreshTokenForIdToken(refreshToken: string): Promise<string> {
    const { data } = await axios({
        method: 'POST',
        url: `https://securetoken.googleapis.com/v1/token?key=${PROJECT_SHEETBASE_NET_OPTIONS.apiKey}`,
        data: {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        },
    });
    return data.id_token;
}

/**
 * user subscription
 */
export async function getUserSubscription(cache = false): Promise<Subscription> {
    let subscription: Subscription;
    const cachedSubscription = getUserSubscriptionFromCache();
    if (cache && cachedSubscription) {
        subscription = cachedSubscription;
    } else {
        const { uid } = await getUserProfile();
        const idToken = await getUserIdToken();
        if (!idToken) { throw new Error('No id token.'); }
        const subscriptionPath = `/userSubscriptions/${uid}`;
        const userSubscription: Subscription = await databaseObject(subscriptionPath) as Subscription;
        // initialize default subscription
        if (!userSubscription.id) {
            const { error, message, subscription } = await appApiPOSTUserSubscription(idToken, 'free');
            if (error) throw new Error(message);
            return subscription;
        }
        subscription = await databaseObject(subscriptionPath) as Subscription;
        // cache
        setUserSubscriptionToCache(subscription);
    }
    return subscription;
}

function getUserSubscriptionFromCache(): Subscription {
    let subscription: Subscription;
    const userSubscription = configstore.get('user_subscription');
    // TODO: check cache expiration
    if (userSubscription && userSubscription.subscription) {
        subscription = userSubscription.subscription;
    }
    return subscription;
}

function setUserSubscriptionToCache(subscription: Subscription): void {
    return configstore.set('user_subscription', {
        subscription,
        at: (new Date()).getTime(),
    });
}

function removeUserSubscriptionFromCache(): void {
    return configstore.delete('user_subscription');
}

/**
 * user settings
 */
export async function getUserSettings(): Promise<Settings> {
    const { uid } = await getUserProfile();
    return await databaseObject(`/userSubscriptions/${uid}`);
}

/**
 * user google accounts
 */
export async function getUserGoogleAccounts(): Promise<GoogleAccounts> {
    const { uid } = await getUserProfile();
    return await databaseObject(`/userGoogleAccounts/${uid}`) as GoogleAccounts;
}

export async function updateUserGoogleAccounts(googleAccount: GoogleAccount): Promise<GoogleAccounts> {
    const idToken = await getUserIdToken();
    if (!idToken) { throw new Error('No id token.'); }
    const { error, message, googleAccounts } = await appApiPOSTUserGoogleAccounts(idToken, googleAccount);
    if (error) throw new Error(message);
    return googleAccounts;
}