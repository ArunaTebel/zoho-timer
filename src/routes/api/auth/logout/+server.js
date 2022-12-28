import {json} from '@sveltejs/kit';

export async function GET(event) {
    const cookieExpiryOpts = {
        path: '/',
        expires: new Date("Thu, 01 Jan 1970 00:00:01 GMT")
    }
    event.cookies.set('zoho-access-token', '', cookieExpiryOpts)
    event.cookies.set('zoho-refresh-token', '', cookieExpiryOpts)
    event.cookies.set('zoho-access-token-recieved-at', '', cookieExpiryOpts)

    return json({
        data: {message: "Logged out"}
    });
}