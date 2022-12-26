import moment from "moment";
import {PUBLIC_ZOHO_CLIENT_ID, PUBLIC_ZOHO_OAUTH_URL} from "$env/static/public";
import {ZOHO_CLIENT_SECRET} from "$env/static/private";

export async function handle({event, resolve}) {
    const lastTokenFetchedAtMillis = event.cookies.get('zoho-access-token-recieved-at')
    const refreshToken = event.cookies.get('zoho-refresh-token')
    if (!lastTokenFetchedAtMillis) {
        return await resolve(event)
    }
    const millisSinceLastTokenFetch = moment().valueOf() - parseInt(lastTokenFetchedAtMillis, 10)

    if (millisSinceLastTokenFetch > 3540000) {
        const response = await fetch(`${PUBLIC_ZOHO_OAUTH_URL}/token?refresh_token=${refreshToken}&client_id=${PUBLIC_ZOHO_CLIENT_ID}&client_secret=${ZOHO_CLIENT_SECRET}&grant_type=refresh_token`, {
            method: 'POST'
        })
        const zohoAuthData = await response.json()
        event.cookies.set('zoho-access-token', zohoAuthData.access_token, {path: '/'});
        event.cookies.set('zoho-access-token-recieved-at', moment().valueOf(), {path: '/'});
    }
    return await resolve(event);
}