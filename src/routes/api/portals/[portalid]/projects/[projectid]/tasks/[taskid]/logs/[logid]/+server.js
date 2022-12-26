import {json} from '@sveltejs/kit';
import {Timesheet} from "../../../../../../../../util/ZOHOWebService.js";

export async function DELETE(event) {
    return json({
        data: await Timesheet.deleteTaskLog(event, event.params.portalid, event.params.projectid, event.params.taskid, event.params.logid)
    });
}