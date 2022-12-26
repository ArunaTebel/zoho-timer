import {json} from '@sveltejs/kit';
import {Timesheet} from "../../../util/ZOHOWebService.js";

export async function POST(event) {
    const requestData = await event.request.json()
    return json({
        data: await Timesheet.fetchWeeklyLogsForUser(event, event.params.portalid, requestData.userId, requestData.date)
    });
}