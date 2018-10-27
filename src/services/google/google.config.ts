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