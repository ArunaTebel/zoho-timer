import {json} from '@sveltejs/kit';
import {Project} from "../../../../../util/ZOHOWebService.js";

export async function GET(event) {
    const searchParams = event.url.searchParams
    return json({
        data: await Project.searchTasks(event, event.params.portalid, event.params.projectid, searchParams.get('index'), searchParams.get('range'), searchParams.get('searchTerm'))
    });
}