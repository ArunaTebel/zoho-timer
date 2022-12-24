import {json} from '@sveltejs/kit';
import {SubTask} from "../../../../../../../util/ZOHOWebService.js";

export async function GET(event) {
    return json({
        data: await SubTask.fetchAll(event, event.params.portalid, event.params.projectid, event.params.taskid)
    });
}