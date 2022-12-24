import {json} from '@sveltejs/kit';
import {Portal} from "../util/ZOHOWebService.js";

export async function GET(event) {
    console.log(event.cookies.get('zoho-access-token'))
    console.log(await Portal.fetchAll(event))
    return json({
        data: await Portal.fetchAll(event)
    });
}