import {json} from '@sveltejs/kit';
import {Portal} from "../../util/ZOHOWebService.js";

export async function GET(event) {
    return json({
        data: await Portal.fetchDetails(event)
    });
}