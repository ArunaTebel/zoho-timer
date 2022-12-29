<script>
    import {onMount} from 'svelte'
    import {page} from '$app/stores'
    import moment from "moment";
    import {Portal, Project, Task, Timesheet} from "../../util/APIService.js";
    import StorageService from "../../util/StorageService.js";
    import ProjectChooser from "$lib/components/ProjectChooser.svelte";
    import TimeLogList from "$lib/components/TimeLogList.svelte";
    import ProjectItemChooser from "$lib/components/ProjectItemChooser.svelte";
    import {success, error} from '$lib/util/toast-message'

    const portalId = $page.params.portalid
    const timerData = StorageService.timer.getData()
    let isTimerInitialized = false

    let timerText
    let timerBtnState = {icon: 'fa-play'}
    let timeLogsReloadedAt = moment().format('Y-MM-DD HH:mm:ss')
    let timeLogsFetchLogsForDate = moment().format('Y-MM-DD')
    let selectedPortalUserId
    let selectedProject = timerData?.selectedProject ?? {}
    let selectedTask = timerData?.selectedTask ?? {}
    let selectedBug = timerData?.selectedBug ?? {}
    let selectedTaskName = timerData?.selectedTaskName
    let isBillable = timerData?.isBillable
    let isBillingTypeDisabled = selectedTask.billingType === 'Billable' || selectedTask.billingType === 'Non Billable'
    let date = timerData?.date ?? moment().format('Y-MM-DD')
    let note = timerData?.note
    let projectItemMode = timerData?.projectItemMode ?? 'task'

    onMount(async () => {
        await setDynamicUserDetails()
        setTimerBtnState()
        initTimer()
        isTimerInitialized = true
    });

    const setDynamicUserDetails = async (projectId) => {
        let zohoUserId = StorageService.common.getZohoUserId()
        let zohoUser = StorageService.common.getZohoPortalUser()
        if (!zohoUserId) {
            const portal = await Portal.fetchDetails(portalId)
            StorageService.common.setZohoUserId(portal.login_id)
            zohoUserId = StorageService.common.getZohoUserId()
        }
        if (projectId && !(zohoUser && zohoUser.id)) {
            const portalUser = (await Project.fetchUsers(portalId, projectId)).find(u => u.id === zohoUserId)
            StorageService.common.setZohoPortalUser(portalUser)
            zohoUser = StorageService.common.getZohoPortalUser()
        }
        selectedPortalUserId = zohoUser.zpuid
    }

    const initTimer = () => {
        if (getTimeElapsed()) {
            setInterval(() => {
                timerText = getTimeElapsed()
            }, 1000)
        }
    }

    const onProjectChange = async (event) => {
        if (!isTimerInitialized) {
            return
        }
        selectedProject = event.detail ?? {}
        if (!selectedProject || !selectedProject.id) {
            updateTimerDataStorage()
            return
        }
        await setDynamicUserDetails(selectedProject?.id)
        const tasks = (await Task.fetchTasksToSubmitTime(portalId, selectedProject?.id, selectedPortalUserId)).map(
            (task) => {
                return {id: task.id, name: task.name}
            }
        )
        if (tasks.findIndex(task => task.id === selectedTask?.id) === -1) {
            selectedTask = {}
        }
        updateTimerDataStorage()
    }

    const onProjectItemChange = (event) => {
        if (!isTimerInitialized) {
            return
        }
        isBillable = false
        isBillingTypeDisabled = false
        const itemData = event.detail
        if (itemData.itemMode === 'task') {
            selectedTask = itemData.item
            isBillable = selectedTask && selectedTask.billingType === 'Billable'
            isBillingTypeDisabled = selectedTask && (selectedTask.billingType === 'Billable' || selectedTask.billingType === 'Non Billable')
            projectItemMode = itemData.itemMode
        } else if (itemData.itemMode === 'bug') {
            selectedBug = itemData.item
            projectItemMode = itemData.itemMode
        } else if (itemData.itemMode === 'general') {
            selectedTaskName = itemData.item
            projectItemMode = itemData.itemMode
        }
        updateTimerDataStorage()
    }

    const onClickTimerBtn = async () => {
        try {
            validateInputs()
            if (getTimerStartedAt()) {
                const response = await Timesheet.saveLog(
                    portalId,
                    selectedProject.id,
                    projectItemMode,
                    selectedTask.id,
                    selectedBug.id,
                    selectedTaskName,
                    moment(date).format('MM-DD-Y'),
                    getTimeElapsed(false),
                    note,
                    isBillable ? 'Billable' : 'Non Billable'
                )
                if (response.error) {
                    error(`Failed saving the time log. ${response.error.message}`)
                } else {
                    success('Successfully saved the time log')
                    refreshTimeLogs(moment(date).format('Y-MM-DD'))
                }
                clearTimer()
            } else {
                startTimer()
            }
            setTimerBtnState()
        } catch (e) {
            error(e.message)
        }
    }

    const validateInputs = () => {
        if (!(selectedProject && selectedProject.id)) {
            throw new Error('Please select a Project')
        }

        if (projectItemMode === 'task' && !(selectedTask && selectedTask.id)) {
            throw new Error('Please choose a Task')
        }

        if (projectItemMode === 'bug' && !(selectedBug && selectedBug.id)) {
            throw new Error('Please choose an Issue')
        }

        if (projectItemMode === 'general' && !(selectedTaskName && selectedTaskName.trim().length > 0)) {
            throw new Error('Please enter a Task name')
        }

        if (!date) {
            throw new Error('Please select a Date')
        }
    }

    const getTimerData = () => {
        return StorageService.timer.getData()
    }

    const getTimerStartedAt = () => {
        return getTimerData()?.startedAt
    }

    const startTimer = () => {
        updateTimerDataStorage(true)
        initTimer()
    }

    const updateTimerDataStorage = (startTimer = false) => {
        const timerData = {
            selectedProject,
            selectedTask,
            selectedBug,
            selectedTaskName,
            date,
            isBillable,
            note,
            projectItemMode,
        }
        const timerStartedAt = getTimerStartedAt()
        if (startTimer) {
            timerData.startedAt = moment().unix()
        } else if (timerStartedAt) {
            timerData.startedAt = timerStartedAt
        }
        StorageService.timer.setData(timerData)
    }

    const clearTimer = () => {
        StorageService.timer.clearData()
        selectedProject = {}
        selectedTask = {}
        selectedBug = {}
        selectedTaskName = ''
        isBillable = false
        date = moment().format('Y-MM-DD')
        note = ''
        projectItemMode = 'task'
        initTimer()
    }

    const getTimeElapsed = (withSeconds = true) => {
        if (!getTimerStartedAt()) {
            return false
        }
        const duration = moment().unix() - +getTimerStartedAt()
        if (withSeconds) {
            return moment.utc(duration * 1000).format('HH:mm:ss')
        }
        return moment.utc(duration * 1000).format('HH:mm')
    }

    const setTimerBtnState = () => {
        timerBtnState.icon = getTimerStartedAt() ? 'fa-stop' : 'fa-play'
    }

    const refreshTimeLogs = (fetchLogsForDate) => {
        timeLogsFetchLogsForDate = fetchLogsForDate
        timeLogsReloadedAt = moment().format('Y-MM-DD HH:mm:ss')
    }
</script>

<div class="card card-border-left-primary">
    <div class="card-content">
        <div class="content">
            <div class="columns is-vcentered">
                <div class="column is-4 mt-2">
                    <label class="label is-small">Choose a Project</label>
                    <div class="control mt-2">
                        <ProjectChooser on:project-selected={onProjectChange}
                                        portalId="{portalId}"
                                        selectedProjectId={selectedProject?.id}/>
                    </div>
                </div>
                <div class="column is-5">
                    <ProjectItemChooser on:project-item-selected={onProjectItemChange}
                                       portalId="{portalId}"
                                       bind:selectedProjectId={selectedProject.id}
                                       bind:selectedPortalUserId={selectedPortalUserId}
                                       itemMode={projectItemMode}
                                       selectedTaskId={selectedTask?.id}
                                       selectedBugId={selectedBug?.id}
                                       selectedTaskName={selectedTaskName}/>
                </div>
                <div class="column is-2">
                    <label class="label pb-1 is-small">Choose a Date</label>
                    <div class="control">
                        <input max={moment().format('Y-MM-DD')} class="input is-small" type="date" bind:value={date}
                               on:change={() => updateTimerDataStorage()}/>
                    </div>
                </div>
                <div class="column is-1" style="margin-top: 25px">
                    <div class="field has-addons">
                        <button class="button is-small is-full-widescreen is-fullwidth" on:click={onClickTimerBtn}>
                      <span class="icon">
                        <i class="fas {timerBtnState.icon}"></i>
                      </span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="columns is-vcentered">

                <div class="column is-9">
                    <input class="input is-small" type="text" maxlength="150" placeholder="Note" bind:value={note}
                           on:keyup={() => updateTimerDataStorage()}/>
                </div>
                <div class="column is-2">
                    <label class="checkbox">
                        <input type=checkbox disabled={isBillingTypeDisabled} bind:checked={isBillable}
                               on:change={() => updateTimerDataStorage()}>
                        <span class="is-small-font">Billable</span>
                    </label>
                </div>
                <div class="column is-1 has-text-centered">
                    {timerText ? timerText : '-- : -- : --'}
                </div>
            </div>
        </div>
    </div>
</div>

<TimeLogList portalId={portalId} reloadedAt={timeLogsReloadedAt}
             timeLogFilterDate={timeLogsFetchLogsForDate}/>
