import axios from 'axios';

import { APP_API_OPTIONS } from './api.config';
import { AxiosOptions, CustomOptions } from './api.type';
import { GoogleAccount } from '../user/user.type';

export async function appApi(axiosOptions: AxiosOptions, options: CustomOptions = {}) {
    const { apiKey, uri } = APP_API_OPTIONS;
    const { method, url, data } = axiosOptions;
    const headers: any = {};
    headers['X-Auth-Key'] = apiKey;
    if (options.idToken) {
        headers['X-User-Token'] = options.idToken;
    }
    return axios({
        baseURL: uri,
        headers,
        method,
        url,
        data,
    });
}

/**
 * app
 */
export async function appApiGETUserToken(idToken: string) {
    const response = await appApi({
        method: 'GET',
        url: `/user/token`,
    }, { idToken });
    return response.data;
}

export async function appApiPOSTUserSubscription(
    idToken: string, plan?: string, transaction?: any,
) {
    const requestData: any = {};
    requestData['plan'] = plan || 'free';
    if (transaction) requestData['transaction'] = transaction;
    const response = await appApi({
        method: 'POST',
        url: `/user/subscription`,
        data: requestData,
    }, { idToken });
    return response.data;
}

export async function appApiPOSTUserGoogleAccounts(idToken: string, googleAccount: GoogleAccount) {
    const response = await appApi({
        method: 'POST',
        url: `/user/google-accounts`,
        data: {
            googleAccount,
        },
    }, { idToken });
    return response.data;
}
