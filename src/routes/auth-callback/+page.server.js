import {ZOHO_CLIENT_SECRET} from '$env/static/private';
import {PUBLIC_ZOHO_CLIENT_ID, PUBLIC_ZOHO_OAUTH_URL} from '$env/static/public';

export async function load(requestEvent) {
    const code = requestEvent.url.searchParams.get('code')
    const response = await fetch(`${PUBLIC_ZOHO_OAUTH_URL}/token?code=${code}&redirect_uri=${requestEvent.url.origin}${requestEvent.url.pathname}&client_id=${PUBLIC_ZOHO_CLIENT_ID}&client_secret=${ZOHO_CLIENT_SECRET}&grant_type=authorization_code`, {
        method: 'POST'
    })
    const zohoAuthData = await response.json()
    requestEvent.cookies.set('zoho-access-token', zohoAuthData.access_token)
    return {
        zohoAuthData: zohoAuthData
    };
}
