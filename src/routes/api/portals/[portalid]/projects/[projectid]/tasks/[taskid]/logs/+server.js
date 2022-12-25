import {json} from '@sveltejs/kit';
import {Timesheet} from "../../../../../../../util/ZOHOWebService.js";

export async function POST(event) {
    const timeLog = await event.request.json()
    return json({
        data: await Timesheet.addLogWithTaskId(event, event.params.portalid, event.params.projectid, event.params.taskid, timeLog)
    });
}