import {json} from '@sveltejs/kit';
import {Timesheet} from "../../../../../util/ZOHOWebService.js";

export async function POST(event) {
    const timeLog = await event.request.json()
    return json({
        data: await Timesheet.addGeneralLog(event, event.params.portalid, event.params.projectid, timeLog)
    });
}