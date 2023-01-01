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
    const TimerStates = {RUNNING: 1, PAUSED: 2, STOPPED: 3}

    let isTimerInitialized = false
    let timerText
    let timeLogsReloadedAt = moment().format('Y-MM-DD HH:mm:ss')
    let timeLogsFetchLogsForDate = moment().startOf('isoweek').format('Y-[W]WW')
    let selectedPortalUserId
    let selectedProject = timerData?.selectedProject ?? {}
    let selectedTask = timerData?.selectedTask ?? {}
    let selectedBug = timerData?.selectedBug ?? {}
    let selectedTaskName = timerData?.selectedTaskName
    let isBillable = timerData?.isBillable
    let isBillingTypeDisabled = selectedTask.billingType === 'Billable' || selectedTask.billingType === 'Non Billable'
    let date = timerData?.date ?? moment().format('Y-MM-DD')
    let note = timerData?.note ?? ''
    let projectItemMode = timerData?.projectItemMode ?? 'task'
    let pausedAt = timerData?.pausedAt
    let timerStartedAt = timerData?.startedAt
    let totalPausedDuration = timerData?.totalPausedDuration ?? 0
    let timerState
    let timerIntervalId

    $ :{
        document.title = `Timer [${timerText}]`
    }

    onMount(async () => {
        await setDynamicUserDetails()
        setTimerState()
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
        selectedPortalUserId = zohoUser?.zpuid
    }

    const initTimer = () => {
        if (getTimeElapsed()) {
            timerText = getTimeElapsed()
            if (!getTimerPausedAt()) {
                timerIntervalId = setInterval(() => {
                    timerText = getTimeElapsed()
                }, 1000)
            }
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

    const onClickTimerBtn = async (nextTimerState) => {
        try {
            validateInputs()
        } catch (e) {
            error(e.message)
            return
        }
        switch (nextTimerState) {
            case TimerStates.RUNNING:
                if (timerState === TimerStates.STOPPED) {
                    Timer.start()
                } else if (timerState === TimerStates.PAUSED) {
                    Timer.continue()
                } else {
                    error('Invalid timer action')
                }
                break
            case TimerStates.STOPPED:
                if (timerState === TimerStates.PAUSED) {
                    updateTotalPausedDuration()
                }
                await Timer.stop()
                break
            case TimerStates.PAUSED:
                await Timer.pause()
                break
            default:
                error('Invalid timer action')
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

    const runTimeLog = (event) => {
        Timer.clear()
        const timeLog = event.detail
        selectedProject = {...timeLog.project, id: timeLog.project.id_string}

        setTimeout(() => {
            projectItemMode = 'general'
            if (timeLog.task) {
                selectedTask = {...timeLog.task, id: timeLog.task.id_string}
                projectItemMode = 'task'
            }
            if (timeLog.bug) {
                selectedBug = {...timeLog.bug, id: timeLog.bug.id_string}
                projectItemMode = 'bug'
            }
            if (timeLog.name) {
                selectedTaskName = timeLog.name
            }
            date = moment().format('Y-MM-DD')
            note = timeLog.notes
            onClickTimerBtn(TimerStates.RUNNING)
        }, 0)

    }

    const getTimerData = () => {
        return StorageService.timer.getData()
    }

    const getTimerStartedAt = () => {
        return getTimerData()?.startedAt
    }

    const getTimerPausedAt = () => {
        return getTimerData()?.pausedAt
    }

    const getTotalPausedDuration = () => {
        return getTimerData()?.totalPausedDuration
    }

    const updateTotalPausedDuration = () => {
        totalPausedDuration = getTotalPausedDuration() ?? 0
        totalPausedDuration += moment().unix() - +getTimerPausedAt()
    }

    const Timer = {
        start: () => {
            updateTimerDataStorage(true)
            initTimer()
            setTimerState()
        },
        pause: () => {
            pausedAt = moment().unix()
            updateTimerDataStorage()
            setTimerState()
            clearInterval(timerIntervalId)
        },
        continue: () => {
            updateTotalPausedDuration()
            pausedAt = false
            updateTimerDataStorage()
            setTimerState()
            initTimer()
        },
        stop: async () => {
            try {
                validateInputs()
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
                    error(`Failed to save the time log. ${response.error.message}`)
                } else {
                    success('Successfully saved the time log')
                    refreshTimeLogs(moment(date).format('Y-[W]WW'))
                }
                Timer.clear()
            } catch (e) {
                error(e.message)
            }
        },
        clear: () => {
            timerState = TimerStates.STOPPED
            StorageService.timer.clearData()
            selectedProject = {}
            selectedTask = {}
            selectedBug = {}
            selectedTaskName = ''
            isBillable = false
            date = moment().format('Y-MM-DD')
            note = ''
            projectItemMode = 'task'
            setTimerState()
            clearInterval(timerIntervalId)
            timerText = '-- : -- : --'
            pausedAt = false
            totalPausedDuration = 0
        }
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
            pausedAt,
            totalPausedDuration,
        }
        timerStartedAt = getTimerStartedAt()
        if (startTimer) {
            timerStartedAt = timerData.startedAt = moment().unix()
        } else if (timerStartedAt) {
            timerData.startedAt = timerStartedAt
        }
        StorageService.timer.setData(timerData)
    }

    const getTimeElapsed = (withSeconds = true) => {
        if (!getTimerStartedAt()) {
            return false
        }
        let totalPausedTime = 0
        if (getTimerPausedAt()) {
            totalPausedDuration = getTotalPausedDuration() ?? 0
            totalPausedTime = totalPausedDuration + (moment().unix() - +getTimerPausedAt())
        } else {
            totalPausedTime = totalPausedDuration
        }
        const duration = moment().unix() - (+getTimerStartedAt()) - (+totalPausedTime)
        if (withSeconds) {
            return moment.utc(duration * 1000).format('HH:mm:ss')
        }
        return moment.utc(duration * 1000).format('HH:mm')
    }

    const setTimerState = () => {
        if (getTimerPausedAt()) {
            timerState = TimerStates.PAUSED
        } else if (getTimerStartedAt()) {
            timerState = TimerStates.RUNNING
        } else {
            timerState = TimerStates.STOPPED
        }
    }

    const refreshTimeLogs = (fetchLogsForDate) => {
        timeLogsFetchLogsForDate = fetchLogsForDate
        timeLogsReloadedAt = moment().format('Y-MM-DD HH:mm:ss')
    }
</script>

<svelte:head>
    {#if timerState === TimerStates.RUNNING}
        <link rel="icon" href="/favicon-active.png"/>
    {:else }
        <link rel="icon" href="/favicon.png"/>
    {/if}

    {#if timerState === TimerStates.PAUSED}
        <title>Timer [{timerText}] ⏸</title>
    {:else if timerState === TimerStates.STOPPED}
        <title>Zoho - Time Tracker</title>
    {/if}
</svelte:head>
<div class="card card-border-left-primary"
     class:has-background-primary-light={timerState === TimerStates.RUNNING}
     class:has-background-warning-light={timerState === TimerStates.PAUSED}
>
    <header class="card-header">
        <p class="card-header-title is-small-font">
            Time tracker
        </p>
        <nav class="level">
            <div class="level-item has-text-centered mr-2 has-text-grey"
                 class:is-hidden={timerState === TimerStates.STOPPED}>
                <div>
                    <p class="is-small-font">
                        Started at: {moment.unix(timerStartedAt).format('HH:mm')}
                    </p>
                </div>
            </div>
            <div class="level-item has-text-centered mr-2 has-text-grey"
                 class:is-hidden={timerState === TimerStates.STOPPED}>
                <div>
                    <p class="is-small-font">
                        Paused at:
                        {#if !!pausedAt}
                            <span>{moment.unix(pausedAt).format('HH:mm')}</span>
                        {:else }
                            <span>N/A</span>
                        {/if}
                    </p>
                </div>
            </div>
            <div class="level-item has-text-centered">
                <div class="mr-2 has-text-weight-bold">
                    <span class="tag is-medium"
                          class:is-info={timerState === TimerStates.RUNNING}
                          class:is-warning={timerState === TimerStates.PAUSED}
                          class:is-light={timerState === TimerStates.STOPPED}
                    >
                        {timerText ? timerText : '-- : -- : --'}
                    </span>
                </div>
            </div>
            <div class="level-item has-text-centered" class:is-hidden={timerState === TimerStates.STOPPED}>
                <button class="button is-small mr-2" title="Clear Timer" on:click={Timer.clear}>
                    <span class="icon">
                      <i class="fas fa-ban"></i>
                    </span>
                </button>
            </div>
        </nav>
    </header>
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
                    <label class="checkbox">
                        <input type=checkbox disabled={isBillingTypeDisabled} bind:checked={isBillable}
                               on:change={() => updateTimerDataStorage()}>
                        <span class="is-small-font">Billable</span>
                    </label>
                </div>
            </div>
            <div class="columns is-vcentered">

                <div class="column is-11">
                    <input class="input is-small" type="text" maxlength="150" placeholder="Note" bind:value={note}
                           on:keyup={() => updateTimerDataStorage()}/>
                </div>
                <div class="column is-1">
                    <div class="field has-addons">
                        <button class="button is-small mr-1 is-success"
                                title={timerState === TimerStates.STOPPED ? 'Start Timer' : 'Resume Timer'}
                                class:is-hidden={timerState === TimerStates.RUNNING}
                                class:is-fullwidth={timerState === TimerStates.STOPPED}
                                class:is-full-widescreen={timerState === TimerStates.STOPPED}
                                on:click={() => onClickTimerBtn(TimerStates.RUNNING)}>
                          <span class="icon">
                            <i class="fas"
                               class:fa-forward-step={timerState === TimerStates.PAUSED}
                               class:fa-play={timerState === TimerStates.STOPPED}></i>
                          </span>
                        </button>
                        <button class="button is-small mr-1 is-danger"
                                class:is-hidden={timerState === TimerStates.STOPPED}
                                on:click={() => onClickTimerBtn(TimerStates.STOPPED)}>
                          <span class="icon">
                            <i class="fas fa-stop"></i>
                          </span>
                        </button>
                        <button class="button is-small"
                                class:is-hidden={timerState === TimerStates.PAUSED || timerState === TimerStates.STOPPED}
                                on:click={() => onClickTimerBtn(TimerStates.PAUSED)}>
                          <span class="icon">
                            <i class="fas fa-pause"></i>
                          </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

{#if isTimerInitialized}
    <TimeLogList on:run-time-log={runTimeLog} portalId={portalId} reloadedAt={timeLogsReloadedAt}
                 timeLogFilterDate={timeLogsFetchLogsForDate}/>
{/if}

