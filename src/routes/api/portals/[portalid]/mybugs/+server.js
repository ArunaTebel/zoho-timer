import {json} from '@sveltejs/kit';
import {Bug} from "../../../util/ZOHOWebService.js";

export async function GET(event) {
    return json({
        data: await Bug.fetchMyBugs(event, event.params.portalid)
    });
}