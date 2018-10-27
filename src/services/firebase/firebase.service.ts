import { initializeApp, database, auth, User } from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';

import { o2a } from '../utils/utils.service';
import { PROJECT_SHEETBASE_NET_OPTIONS } from './firebase.config';

const defaultApp = initializeApp(PROJECT_SHEETBASE_NET_OPTIONS);

export function  databaseKey(path: string): string {
    return database().ref(path).push().key;
}
export async function databaseObject(path: string, raw = false) {
    return new Promise((resolve, reject) => {
        database().ref(path).once('value', snapshot => {
            const itemKey = snapshot.key; let snapshotVal = snapshot.val();
            if (raw) {
                resolve(snapshotVal);
            } else {
                snapshotVal = snapshotVal || {};
                if (typeof snapshotVal === 'object') {
                    snapshotVal['$key'] = itemKey;
                } else {
                    snapshotVal = {
                        $key: itemKey,
                        value: snapshotVal,
                    };
                }
                resolve(snapshotVal);
            }
        }, reject);
    });
}
export async function databaseList(path: string, query: any = null) {
    return new Promise((resolve, reject) => {
        const ref = database().ref(path);
        query = query || {};
        for (const qKey of Object.keys(query)) {
            if (qKey === 'orderByChild') { ref.orderByChild(query[qKey]); }
            if (qKey === 'orderByKey') { ref.orderByKey(); }
            if (qKey === 'orderByValue') { ref.orderByValue(); }
            if (qKey === 'limitToFirst') { ref.limitToFirst(query[qKey]); }
            if (qKey === 'limitToLast') { ref.limitToLast(query[qKey]); }
            if (qKey === 'startAt') { ref.startAt(query[qKey]); }
            if (qKey === 'endAt') { ref.endAt(query[qKey]); }
            if (qKey === 'equalTo') { ref.equalTo(query[qKey]); }
        }
        ref.once('value', snapshot => {
            resolve(o2a(snapshot.val() || {}, false));
        }, reject);
    });
}
export async function databaseUpdate(updates: any) {
    return database().ref('/').update(updates);
}

export async function authLogin(userEmail: string, password: string) {
    return auth().signInWithEmailAndPassword(userEmail, password);
}
export async function authLoginUsingToken(customToken: string) {
    return auth().signInWithCustomToken(customToken);
}
export async function authRegister(email: string, password: string) {
    return auth().createUserWithEmailAndPassword(email, password);
}
export async function authLogout() {
    return auth().signOut();
}
export async function authUpdateProfile(profile: { displayName: string, photoURL: string }) {
    return auth().currentUser.updateProfile(profile);
}