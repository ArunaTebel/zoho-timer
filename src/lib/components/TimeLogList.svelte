<script>
    import {Timesheet} from "../../routes/util/APIService.js";
    import moment from "moment";
    import {onMount} from "svelte";

    export let portalId

    let timeLogFilterDate = '2022-12-25';
    let timeLogs = {};
    let timeLogEditModalIsOpen = false
    let timeLogDeleteModalIsOpen = false
    let timeLogToEdit = {}
    let timeLogToDelete = {}
    let timeLogEditSelectedProjectId
    let timeLogEditSelectedTaskId
    let timeLogEditSelectedBugId
    let timeLogEditSelectedTaskName
    let isBillable
    let timeLogEditSelectedTimeDurationHrs
    let timeLogEditSelectedTimeDurationMins
    let timeLogEditSelectedDate
    let timeLogEditSelectedNote
    let projectItemMode

    onMount(() => {
        fetchTimeLogs()
    })

    const fetchTimeLogs = async () => {
        // timeLogs = await Timesheet.fetchWeeklyLogsForCurrentUser(portalId, moment(timeLogFilterDate).format('MM-D-Y'))
    }

    const validateInputs = () => {
        if (!timeLogEditSelectedDate) {
            throw new Error('Please select a Date')
        }

        if (timeLogEditSelectedTimeDurationHrs < 0 || timeLogEditSelectedTimeDurationMins < 0 || timeLogEditSelectedTimeDurationMins > 59) {
            throw new Error('Please choose a valid time duration')
        }

        if (timeLogEditSelectedTimeDurationHrs > 11) {
            throw new Error('Cannot log more than 11 hrs')
        }
    }

    const saveTimeLog = async () => {
        validateInputs()
        await Timesheet.saveLog(
            portalId,
            timeLogEditSelectedProjectId,
            projectItemMode,
            timeLogEditSelectedTaskId,
            timeLogEditSelectedBugId,
            timeLogEditSelectedTaskName,
            moment(timeLogEditSelectedDate).format('MM-D-Y'),
            `${timeLogEditSelectedTimeDurationHrs}:${timeLogEditSelectedTimeDurationMins}`,
            timeLogEditSelectedNote,
            isBillable ? 'Billable' : 'Non Billable',
            timeLogToEdit.id_string
        )
        await fetchTimeLogs()
        closeTimeLogEditModal()
    }

    const deleteTimeLog = async () => {
        await Timesheet.deleteTimeLog(
            portalId,
            timeLogToDelete.project.id_string,
            timeLogToDelete.task?.id_string,
            timeLogToDelete.bug?.id_string,
            timeLogToDelete.id_string,
            projectItemMode
        )
        await fetchTimeLogs()
        closeTimeLogDeleteModal()
    }

    const onTimeLogEditClicked = async (date, timeLogId) => {
        timeLogToEdit = timeLogs.logs[date].find(timeLog => timeLog.id_string === timeLogId)
        timeLogEditSelectedProjectId = timeLogToEdit.project.id_string
        timeLogEditSelectedTaskId = timeLogToEdit.task?.id_string
        timeLogEditSelectedBugId = timeLogToEdit.bug?.id_string
        timeLogEditSelectedTaskName = timeLogToEdit.name
        isBillable = timeLogToEdit.bill_status === 'Billable'
        timeLogEditSelectedTimeDurationHrs = timeLogToEdit.hours
        timeLogEditSelectedTimeDurationMins = timeLogToEdit.minutes
        timeLogEditSelectedDate = moment(date).format('Y-MM-D')
        timeLogEditSelectedNote = timeLogToEdit.notes
        projectItemMode = getItemModeForLog(timeLogToEdit)
        openTimeLogEditModal()
    }

    const onTimeLogDeleteClicked = async (date, timeLogId) => {
        timeLogToDelete = timeLogs.logs[date].find(timeLog => timeLog.id_string === timeLogId)
        projectItemMode = getItemModeForLog(timeLogToDelete)
        openTimeLogDeleteModal()
    }

    const openTimeLogEditModal = () => {
        timeLogEditModalIsOpen = true
    }

    const closeTimeLogEditModal = () => {
        timeLogEditModalIsOpen = false
    }

    const openTimeLogDeleteModal = () => {
        timeLogDeleteModalIsOpen = true
    }

    const closeTimeLogDeleteModal = () => {
        timeLogDeleteModalIsOpen = false
    }

    const getTaskOrBugName = (timeLog) => {
        if (timeLog.task && timeLog.task.id) {
            return timeLog.task.name
        }
        if (timeLog.bug && timeLog.bug.id) {
            return timeLog.bug.title
        }
        return timeLog.name
    }

    const getItemModeForLog = (timeLog) => {
        if (timeLog.task && timeLog.task.id) {
            return 'task'
        }
        if (timeLog.bug && timeLog.bug.id) {
            return 'bug'
        }
        return 'general'
    }

</script>

<input type="date" bind:value={timeLogFilterDate} on:change={() => fetchTimeLogs()}/>

<div class="modal is-clipped" class:is-active={timeLogDeleteModalIsOpen}>
    <div class="modal-background"></div>
    <div class="modal-card">
        <header class="modal-card-head">
            <p class="modal-card-title">Delete the time log?</p>
            <button on:click={closeTimeLogDeleteModal} class="delete" aria-label="close"></button>
        </header>
        {#if (timeLogDeleteModalIsOpen)}
            <section class="modal-card-body">
                Are you sure you want to delete the selected time log?
            </section>
        {/if}
        <footer class="modal-card-foot">
            <button on:click={deleteTimeLog} class="button is-success">Yes, Delete</button>
            <button on:click={closeTimeLogDeleteModal} class="button">Cancel</button>
        </footer>
    </div>
</div>

<div class="modal is-clipped" class:is-active={timeLogEditModalIsOpen}>
    <div class="modal-background"></div>
    <div class="modal-card">
        <header class="modal-card-head">
            <p class="modal-card-title">Modal title</p>
            <button on:click={closeTimeLogEditModal} class="delete" aria-label="close"></button>
        </header>
        {#if (timeLogEditModalIsOpen)}
            <section class="modal-card-body">
                Project: {timeLogToEdit.project.name}
                <br/>
                Task: {getTaskOrBugName(timeLogToEdit)}
                <br/>
                <label>Date</label>
                <input type="date" bind:value={timeLogEditSelectedDate}/>
                <br/>
                <label>Time Duration</label>
                <input type="number" min="0" max="11" bind:value={timeLogEditSelectedTimeDurationHrs}/> Hrs
                <input type="number" min="0" max="59" bind:value={timeLogEditSelectedTimeDurationMins}/> Mins
                <br/>
                <br/>
                <label>
                    <input type=checkbox bind:checked={isBillable}>
                    Is Billable?
                </label>
                <label>Notes</label>
                <input maxlength="150" bind:value={timeLogEditSelectedNote}/>
            </section>
        {/if}
        <footer class="modal-card-foot">
            <button on:click={saveTimeLog} class="button is-success">Save changes</button>
            <button on:click={closeTimeLogEditModal} class="button">Cancel</button>
        </footer>
    </div>
</div>

<br/>
{#if (timeLogs.logs)}
    {#each Object.keys(timeLogs.logs) as date }
        Time logs for {date}
        <table style="width: 100%">
            <thead>
            <tr>
                <th>Project</th>
                <th>Task/Issue</th>
                <th>Daily Log</th>
                <th>Billing Type</th>
                <th>Approval Status</th>
                <th>Notes</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {#each timeLogs.logs[date] as timeLog (timeLog.id_string) }
                <tr>
                    <td>{timeLog.project.name}</td>
                    <td>{getTaskOrBugName(timeLog)}</td>
                    <td>{timeLog.hours_display}</td>
                    <td>{timeLog.bill_status}</td>
                    <td>{timeLog.approval_status}</td>
                    <td>{timeLog.notes}</td>
                    <td>
                        <button on:click={() => onTimeLogEditClicked(date, timeLog.id_string)}>Edit</button>
                        <button on:click={() => onTimeLogDeleteClicked(date, timeLog.id_string)}>Delete</button>
                    </td>
                </tr>
            {/each}

            </tbody>
        </table>
        <br/>
        <br/>
    {/each}
{/if}
