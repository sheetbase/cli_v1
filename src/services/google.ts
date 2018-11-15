import * as http from 'http';
import * as url from 'url';
import { pathExists, readJson, remove } from 'fs-extra';
import * as querystring from 'querystring';
import { OAuth2Client } from 'google-auth-library';
import { constantCase } from 'change-case';
const opn = require('opn');
const config = require('configstore');
const configstore = new config('sheetbase_cli');

import { GoogleAccount, GoogleAccounts, GoogleAccountProfile } from './user';

export const GOOGLE_RC = '.googlerc.json';
export const OAUHT2_CLIENT_SETTINGS = {
    clientId: '719937802037-rc4r6ct75hhu7ns5e6nomptvb37e84mj.apps.googleusercontent.com',
    clientSecret: 'np2V_mWKlsrZP314tArUJ0sg',
    redirectUri: 'http://localhost:3160/oauth2callback',
};
export const OAUTH2_URL_OPTS = (fullDrive = false) => {
    return {
        access_type: 'offline',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/drive' + (!!fullDrive ? '' : '.file'),
            'https://www.googleapis.com/auth/script.deployments',
            'https://www.googleapis.com/auth/script.projects',
            'https://www.googleapis.com/auth/cloud-platform.read-only',
            'https://www.googleapis.com/auth/logging.read',
        ],
    };
};

/**
 * google account
 */
export async function getAllGoogleAccounts(): Promise<GoogleAccounts> {
    const googleAccounts: GoogleAccounts = configstore.get('google_accounts') as GoogleAccounts;
    if (
        !googleAccounts || !(googleAccounts instanceof Object) ||
        Object.keys(googleAccounts).length <= 0
    ) {
        return null;
    }
    return googleAccounts;
}
export async function getGoogleAccount(id: string = null): Promise<GoogleAccount> {
    let googleAccount: GoogleAccount;
    if (id) {
        const googleAccounts: GoogleAccounts = await getAllGoogleAccounts();
        googleAccount = (googleAccounts || {})[id];
    } else {
        const localAccount = await getLocalGoogleAccount();
        if (localAccount) {
            googleAccount = localAccount;
        } else {
            googleAccount = await getDefaultGoogleAccount();
        }
    }
    return googleAccount;
}
export async function getDefaultGoogleAccount(): Promise<GoogleAccount> {
    const id: string = getDefaultGoogleAccountId();
    const googleAccounts: GoogleAccounts = await getAllGoogleAccounts();
    return (googleAccounts || {})[id];
}
export async function getLocalGoogleAccount(): Promise<GoogleAccount> {
    let googleAccount: GoogleAccount;
    if (await pathExists(GOOGLE_RC)) {
        googleAccount = await readJson(GOOGLE_RC);
    }
    return googleAccount;
}
export async function removeAllGoogleAccounts(): Promise<GoogleAccounts> {
    removeTemporaryRefeshToken(); // try remove any not yet retrieve refresh token
    // get all accounts for reporting purpose
    const disconnectedGoogleAccounts: GoogleAccounts = await getAllGoogleAccounts();
    // delete all accounts
    configstore.delete(`google_accounts`);
    removeDefaultGoogleAccountId(); // remove default account id
    // report
    return disconnectedGoogleAccounts;
}
export async function removeGoogleAccount(id: string): Promise<GoogleAccounts> {
    removeTemporaryRefeshToken(); // try remove any not yet retrieve refresh token
    // check against default id
    if (id === getDefaultGoogleAccountId()) {
        return await removeDefaultGoogleAccount();
    }
    // get the account for reporting purpose
    const googleAccount: GoogleAccount = await getGoogleAccount(id);
    if (!id || !googleAccount) { throw new Error('Invalid id.'); }
    // delete the account
    configstore.delete(`google_accounts.${id}`);
    // report
    const disconnectedGoogleAccounts: GoogleAccounts = {};
    disconnectedGoogleAccounts[id] = googleAccount;
    return disconnectedGoogleAccounts;
}
export async function removeDefaultGoogleAccount(): Promise<GoogleAccounts> {
    removeTemporaryRefeshToken(); // try remove any not yet retrieve refresh token
    // get the account for reporting purpose
    const defaultAccount: GoogleAccount = await getDefaultGoogleAccount();
    if (!defaultAccount) { throw new Error('No default account.'); }
    // delete the account
    const { id } = defaultAccount.profile;
    configstore.delete(`google_accounts.${id}`);
    // try to set default account to the first one found if available
    const googleAccounts: GoogleAccounts = await getAllGoogleAccounts();
    if (googleAccounts) {
        const [ firstId ] = Object.keys(googleAccounts);
        await setDefaultGoogleAccountId(firstId);
    } else {
        removeDefaultGoogleAccountId();
    }
    // report
    const disconnectedGoogleAccounts: GoogleAccounts = {};
    disconnectedGoogleAccounts[id] = defaultAccount;
    return disconnectedGoogleAccounts;
}
export async function removeLocalGoogleAccount(): Promise<GoogleAccounts> {
    const localAccount = await getLocalGoogleAccount();
    if (!localAccount) {
        throw new Error('No local account.');
    }
    await remove(GOOGLE_RC);
    // report
    const disconnectedGoogleAccounts: GoogleAccounts = {};
    disconnectedGoogleAccounts[localAccount.profile.id] = localAccount;
    return disconnectedGoogleAccounts;
}
export async function setGoogleAccount(googleAccount: GoogleAccount): Promise<GoogleAccounts> {
    const { id } = googleAccount.profile;
    configstore.set(`google_accounts.${id}`, googleAccount);
    if (!getDefaultGoogleAccountId()) {
        await setDefaultGoogleAccountId(id); // set default to this account
    }
    return await getAllGoogleAccounts();
}
export async function retrieveTemporaryRefeshToken(): Promise<GoogleAccount> {
    let account: GoogleAccount;
    try {
        const tempRefreshToken: string = getTemporaryRefeshToken();
        if (tempRefreshToken) {
            const profile: GoogleAccountProfile = await getUserProfile(tempRefreshToken);
            const googleAccount: GoogleAccount = {
                refreshToken: tempRefreshToken,
                profile,
                grantedAt: (new Date()).getTime(),
            };
            const accounts = await setGoogleAccount(googleAccount);
            account = accounts[googleAccount.profile.id];
        }
    } catch (error) {
        /** */
    }
    return account;
}

/**
 * default account id
 */
export function getDefaultGoogleAccountId(): string {
    return configstore.get(`google_accounts_default_id`);
}
export async function setDefaultGoogleAccountId(id: string): Promise<string> {
    const googleAccounts: GoogleAccounts = await getAllGoogleAccounts();
    if (!(googleAccounts || {})[id]) throw new Error('Invalid id.');
    configstore.set(`google_accounts_default_id`, id);
    return id;
}
function removeDefaultGoogleAccountId(): void {
    configstore.delete(`google_accounts_default_id`);
}

/**
 * temporary refresh token
 */
function getTemporaryRefeshToken(): string {
    const tempRefreshToken: string = configstore.get(`google_refresh_token`);
    removeTemporaryRefeshToken(); // remove right after retrieve
    return tempRefreshToken;
}
function removeTemporaryRefeshToken(): void {
    configstore.delete(`google_refresh_token`);
}

/**
 * google oauth2 client
 */
export async function getOAuth2Client(id: string = null, refreshToken: string = null): Promise<OAuth2Client> {
    if (refreshToken) {
        return await getOAuth2ClientByRefreshToken(refreshToken);
    } else {
        return await getOAuth2ClientById(id);
    }
}
async function getOAuth2ClientById(id: string = null): Promise<OAuth2Client> {
    let client: OAuth2Client;
    try {
        id = id || getDefaultGoogleAccountId(); // default account
        const { refreshToken } = await getGoogleAccount(id);
        client = await getOAuth2ClientByRefreshToken(refreshToken);
    } catch (error) {
        client = null;
    }
    return client;
}
async function getOAuth2ClientByRefreshToken(refreshToken: string): Promise<OAuth2Client> {
    let client: OAuth2Client;
    try {
        client = new OAuth2Client(OAUHT2_CLIENT_SETTINGS);
        client.setCredentials({ refresh_token: refreshToken });
        await client.getRequestHeaders();
    } catch (error) {
        client = null;
    }
    return client;
}

/**
 * account profile
 */
async function getUserProfile(refreshToken: string): Promise<GoogleAccountProfile> {
    const client = await getOAuth2ClientByRefreshToken(refreshToken);
    if (!client) { throw new Error('No oauth2 client!'); }
    const userData = await client.verifyIdToken({
        idToken: client.credentials.id_token,
        audience: OAUHT2_CLIENT_SETTINGS.clientId,
    });
    const payload = userData.getPayload();
    const { aud, sub, email, name, picture } = payload;
    if (aud !== OAUHT2_CLIENT_SETTINGS.clientId) {
        throw new Error('Not a valid id token!');
    }
    return {
        id: sub,
        email,
        name: name || constantCase(email.split('@')[0]),
        imageUrl: picture,
    };
}

/**
 * authorization
 */
export function authorizeWithLocalhost(fullDrive?: boolean): Promise<OAuth2Client> {
    return new Promise((resolve, reject) => {
        const oAuth2Client = new OAuth2Client(OAUHT2_CLIENT_SETTINGS);
        oAuth2Client.on('tokens', (tokens) => {
            if (tokens.refresh_token) {
                // temporary save to configstore for later use
                configstore.set('google_refresh_token', tokens.refresh_token);
            }
        });

        const authorizeUrl = oAuth2Client.generateAuthUrl(OAUTH2_URL_OPTS(fullDrive));
        const server = http.createServer(async (req, res) => {
            if (req.url.indexOf('/oauth2callback') > -1) {
                const qs: any = querystring.parse(url.parse(req.url).query);
                if(qs.error) {
                    res.end(message(
                        'https://png.icons8.com/dusk/128/000000/cancel.png',
                        'Failed!',
                        'Please try again.',
                    ));
                } else {
                    res.end(message(
                        'https://png.icons8.com/dusk/128/000000/ok.png',
                        'Succeed!',
                        'You may close this browser tab and return to the console.',
                    ));
                }
                server.close();

                if(qs.code) {
                    try {
                        const r = await oAuth2Client.getToken(qs.code);
                        oAuth2Client.setCredentials(r.tokens);
                        resolve(oAuth2Client);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject();
                }
            }
        }).listen(3160, () => {
            opn(authorizeUrl, {wait: false});
        });
    });
}

function message(icon, title, message) {
    return '' +
`
<style>
    .container {
        text-align: center;
        padding-top: 100px;
    }
    img {
        max-width: 150px;
    }
</style>
<div class="container">
    <img src="${icon}">
    <h1>${title}</h1>
    <p>${message}</p>
</div>
`;
}
