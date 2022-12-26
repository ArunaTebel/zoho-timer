import {json} from '@sveltejs/kit';
import {Timesheet} from "../../../../../../../../util/ZOHOWebService.js";

export async function DELETE(event) {
    return json({
        data: await Timesheet.deleteBugLog(event, event.params.portalid, event.params.projectid, event.params.bugid, event.params.logid)
    });
}