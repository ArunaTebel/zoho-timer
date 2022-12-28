<script>
    import {Timesheet} from "../../routes/util/APIService.js";
    import moment from "moment";

    export let portalId
    export let reloadedAt = moment().format('Y-MM-DD HH:mm:ss')
    export let timeLogFilterDate = moment().format('Y-[W]W')

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
    let isDeleting = false
    let isSaving = false
    let timeLogEditErrorMessage

    const fetchTimeLogs = async () => {
        timeLogFilterDate = moment(timeLogFilterDate).format('Y-[W]W')
        timeLogs = {}
        timeLogs = await Timesheet.fetchWeeklyLogsForCurrentUser(portalId, moment(timeLogFilterDate).format('MM-DD-Y'))
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
        isSaving = true
        try {
            validateInputs()
            await Timesheet.saveLog(
                portalId,
                timeLogEditSelectedProjectId,
                projectItemMode,
                timeLogEditSelectedTaskId,
                timeLogEditSelectedBugId,
                timeLogEditSelectedTaskName,
                moment(timeLogEditSelectedDate).format('MM-DD-Y'),
                `${timeLogEditSelectedTimeDurationHrs}:${timeLogEditSelectedTimeDurationMins}`,
                timeLogEditSelectedNote,
                isBillable ? 'Billable' : 'Non Billable',
                timeLogToEdit.id_string
            )
            closeTimeLogEditModal()
            await fetchTimeLogs()
        } catch (e) {
            timeLogEditErrorMessage = e.message
        }
        isSaving = false
    }

    const deleteTimeLog = async () => {
        isDeleting = true
        await Timesheet.deleteTimeLog(
            portalId,
            timeLogToDelete.project.id_string,
            timeLogToDelete.task?.id_string,
            timeLogToDelete.bug?.id_string,
            timeLogToDelete.id_string,
            projectItemMode
        )
        closeTimeLogDeleteModal()
        await fetchTimeLogs()
        isDeleting = false
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
        timeLogEditSelectedDate = moment(date).format('Y-MM-DD')
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

    $: fetchTimeLogs(reloadedAt)

</script>

<div class="columns is-vcentered">
    <div class="column is-2">

    </div>
</div>


<div class="modal is-clipped" class:is-active={timeLogDeleteModalIsOpen}>
    <div class="modal-background"></div>
    <div class="modal-card">
        <header class="modal-card-head">
            <p class="modal-card-title">Confirmation</p>
            <button on:click={closeTimeLogDeleteModal} class="delete" aria-label="close"></button>
        </header>
        {#if (timeLogDeleteModalIsOpen)}
            <section class="modal-card-body">
                Are you sure you want to delete the selected time log?
            </section>
        {/if}
        <footer class="modal-card-foot">
            <button on:click={deleteTimeLog} class="button is-success" class:is-loading={isDeleting}>Yes, Delete
            </button>
            <button on:click={closeTimeLogDeleteModal} class="button">Cancel</button>
        </footer>
    </div>
</div>

<div class="modal is-clipped" class:is-active={timeLogEditModalIsOpen}>
    <div class="modal-background"></div>
    <div class="modal-card">
        <header class="modal-card-head">
            <p class="modal-card-title">Edit Time Log</p>
            <button on:click={closeTimeLogEditModal} class="delete" aria-label="close"></button>
        </header>
        {#if (timeLogEditModalIsOpen)}
            <section class="modal-card-body">
                {#if (timeLogEditErrorMessage)}
                    <div class="notification is-danger">
                        <button class="delete" on:click={() => timeLogEditErrorMessage = ''}></button>
                        {timeLogEditErrorMessage}
                    </div>
                {/if}
                <div class="field">
                    <label class="label">Project</label>
                    <div class="control">
                        <input disabled class="input is-disabled" type="text" value={timeLogToEdit.project.name}/>
                    </div>
                </div>

                <div class="field">
                    <label class="label">Task</label>
                    <div class="control">
                        <input disabled class="input is-disabled" type="text" value={getTaskOrBugName(timeLogToEdit)}/>
                    </div>
                </div>

                <div class="columns is-vcentered">
                    <div class="column is-4">
                        <div class="field">
                            <label class="label">Date</label>
                            <div class="control">
                                <input class="input" type="date" bind:value={timeLogEditSelectedDate}/>
                            </div>
                        </div>
                    </div>
                    <div class="column is-3">
                        <div class="field">
                            <label class="label">Duration</label>
                            <div class="control is-inline-flex">
                                <input class="input is-inline time-duration-input mr-2" type="number" min="0" max="11"
                                       bind:value={timeLogEditSelectedTimeDurationHrs}/>
                                <input class="input is-inline time-duration-input" type="number" min="0" max="59"
                                       bind:value={timeLogEditSelectedTimeDurationMins}/>
                            </div>
                        </div>
                    </div>
                    <div class="column is-4">
                        <div class="field mt-5">
                            <div class="control">
                                <label class="checkbox">
                                    <input type=checkbox bind:checked={isBillable}>
                                    Is Billable?
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="field">
                    <label class="label">Notes</label>
                    <div class="control is-inline-flex full-width">
                        <input class="input is-fullwidth" maxlength="150" bind:value={timeLogEditSelectedNote}/>
                    </div>
                </div>

            </section>
        {/if}
        <footer class="modal-card-foot">
            <button on:click={saveTimeLog} class="button is-success" class:is-loading={isSaving}>Save changes</button>
            <button on:click={closeTimeLogEditModal} class="button">Cancel</button>
        </footer>
    </div>
</div>
<div class="card mt-4">
    <header class="card-header">
        <p class="card-header-title">
            Weekly Time Logs
            <span class="ml-3 field has-addons">
                <input class="input is-inline is-small" type="week"
                       bind:value={timeLogFilterDate}
                       on:change={() => fetchTimeLogs()}/>
                <button class="button is-small is-centered is-center" on:click={fetchTimeLogs}>
                  <span class="icon is-small">
                    <i class="fas fa-sync"></i>
                  </span>
                </button>
            </span>
        </p>
    </header>
    <div class="card-content">
        <div class="content">
            {#if (timeLogs.logs)}
                {#each Object.keys(timeLogs.logs) as date }
                    <label class="label is-small">{moment(date).format('Y-MM-DD')}</label>
                    <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth"
                           style="width: 100%">
                        <thead style="font-size: 0.9rem">
                        <tr>
                            <th style="width: 25%">Project</th>
                            <th style="width: 30%">Task/Issue</th>
                            <th style="width: 5%">Duration</th>
                            <th style="width: 5%">Billable?</th>
                            <th style="width: 5%">Status</th>
                            <th style="width: 22%;">Notes</th>
                            <th style="width: 8%">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {#each timeLogs.logs[date] as timeLog (timeLog.id_string) }
                            <tr style="font-size: 0.8rem">
                                <td>{timeLog.project.name}</td>
                                <td class="wrap">{getTaskOrBugName(timeLog)}</td>
                                <td>{timeLog.hours_display}</td>
                                <td>{timeLog.bill_status === 'Billable' ? 'Yes' : 'No'}</td>
                                <td>{timeLog.approval_status}</td>
                                <td class="wrap">{timeLog.notes}</td>
                                <td>
                                    <div class="field has-addons is-inline">
                                        <button class="button is-small"
                                                on:click={() => onTimeLogEditClicked(date, timeLog.id_string)}>
                                <span class="icon is-small">
                                    <i class="fas fa-edit"></i>
                                </span>
                                        </button>
                                    </div>
                                    <div class="field has-addons is-inline">
                                        <button class="button is-small"
                                                on:click={() => onTimeLogDeleteClicked(date, timeLog.id_string)}>
                                <span class="icon is-small">
                                    <i class="fas fa-trash"></i>
                                </span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        {/each}

                        </tbody>
                    </table>
                {/each}
            {:else }
                <progress class="progress is-small is-primary" max="100">15%</progress>
            {/if}
        </div>
    </div>
</div>
