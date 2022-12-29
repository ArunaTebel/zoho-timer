import {json} from '@sveltejs/kit';
import {Bug} from "../../../../../util/ZOHOWebService.js";

export async function GET(event) {
    return json({
        data: await Bug.fetchBugsToSubmitTime(event, event.params.portalid, event.params.projectid, event.url.searchParams.get('zpuid'))
    });
}