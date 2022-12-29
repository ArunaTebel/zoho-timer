import {json} from '@sveltejs/kit';
import {Project} from "../../../../../util/ZOHOWebService.js";

export async function GET(event) {
    return json({
        data: await Project.fetchUsers(event, event.params.portalid, event.params.projectid)
    });
}