export async function load(requestEvent) {
    return {
        isAuthorized: !!requestEvent.cookies.get('zoho-access-token')
    };
}
