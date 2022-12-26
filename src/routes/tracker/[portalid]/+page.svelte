<script>
    import {onMount} from 'svelte'
    import {page} from '$app/stores'
    import moment from "moment";
    import {Project, Task, Timesheet} from "../../util/APIService.js";
    import StorageService from "../../util/StorageService.js";
    import ProjectChooser from "$lib/components/ProjectChooser.svelte";
    import TimeLogList from "../../../lib/components/TimeLogList.svelte";
    import ProjectItemChoser from "../../../lib/components/ProjectItemChoser.svelte";

    const timerData = StorageService.timer.getData()

    let timerText
    let timerBtnState = {icon: 'fa-play'}
    let projects = []
    let tasks = []
    let zohoUserId = StorageService.common.getZohoUserId()
    let selectedProject = timerData?.selectedProject ?? {}
    let selectedTask = timerData?.selectedTask ?? {}
    let selectedBug = timerData?.selectedBug ?? {}
    let selectedTaskName = timerData?.selectedTaskName
    let isBillable = timerData?.isBillable
    let date = timerData?.date ?? moment().format('Y-M-D')
    let note = timerData?.note
    let projectItemMode = timerData?.projectItemMode

    onMount(async () => {
        projects = (await Project.fetchAll($page.params.portalid))
            .map((project) => {
                return {id: project.id_string, name: project.name}
            })
        setTimerBtnState()
        initTimer()
    });

    const initTimer = () => {
        if (getTimeElapsed()) {
            setInterval(() => {
                timerText = getTimeElapsed()
            }, 1000)
        }
    }

    const onProjectChange = async (event) => {
        selectedProject = event.detail ?? {}
        if (!selectedProject || !selectedProject.id) {
            updateTimerDataStorage()
            return
        }
        tasks = []
        tasks = (await Task.fetchMyTasks($page.params.portalid, selectedProject?.id))
            .map((task) => {
                return {id: task.id_string, name: task.name}
            })
        if (tasks.findIndex(task => task.id === selectedTask?.id) === -1) {
            selectedTask = {}
        }
        updateTimerDataStorage()
    }

    const onProjectItemChange = (event) => {
        const itemData = event.detail
        if (itemData.itemMode === 'task') {
            selectedTask = itemData.item
        } else if (itemData.itemMode === 'bug') {
            selectedBug = itemData.item
        } else {
            selectedTaskName = itemData.item
        }
        projectItemMode = itemData.itemMode
        updateTimerDataStorage()
    }

    const onClickTimerBtn = async () => {
        try {
            validateInputs()
            if (getTimerStartedAt()) {
                await Timesheet.saveLog(
                    $page.params.portalid,
                    selectedProject.id,
                    projectItemMode,
                    selectedTask.id,
                    selectedBug.id,
                    selectedTaskName,
                    moment(date).format('M-D-Y'),
                    getTimeElapsed(false),
                    note,
                    isBillable ? 'Billable' : 'Non Billable'
                )
                clearTimer()
            } else {
                startTimer()
            }
            setTimerBtnState()
        } catch (e) {
            console.error(e)
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
        date = moment().format('Y-M-D')
        note = ''
        projectItemMode = ''
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
</script>

<!--<input type="text" placeholder="ZOHO User ID" bind:value={zohoUserId}-->
<!--       on:keyup={event => StorageService.common.setZohoUserId(event.target.value)}>-->

<div class="columns is-vcentered">
    <div class="column is-4">
        <label class="label">Choose a Project</label>
        <div class="control">
            <ProjectChooser on:project-selected={onProjectChange}
                            portalId="{$page.params.portalid}"
                            selectedProjectId={selectedProject?.id}/>
        </div>
    </div>
    <div class="column is-5">
        <ProjectItemChoser on:project-item-selected={onProjectItemChange}
                           portalId="{$page.params.portalid}"
                           bind:selectedProjectId={selectedProject.id}
                           selectedTaskId={selectedTask?.id}
                           selectedBugId={selectedBug?.id}
                           selectedTaskName={selectedTaskName}/>
    </div>
    <div class="column is-2">
        <label class="label pb-1">Choose a Date</label>
        <div class="control">
            <input class="input" type="date" bind:value={date} on:change={() => updateTimerDataStorage()}/>
        </div>
    </div>
    <div class="column is-1 pt-6">
        <div class="field has-addons">
            <button class="button is-full-widescreen is-fullwidth" on:click={onClickTimerBtn}>
                      <span class="icon is-large">
                        <i class="fas {timerBtnState.icon}"></i>
                      </span>
            </button>
        </div>
    </div>
</div>
<div class="columns is-vcentered">

    <div class="column is-10">
        <input class="input" type="text" maxlength="150" placeholder="Note" bind:value={note}
               on:keyup={() => updateTimerDataStorage()}/>
    </div>
    <div class="column is-1">
        <label class="checkbox">
            <input type=checkbox bind:checked={isBillable} on:change={() => updateTimerDataStorage()}>
            Billable
        </label>
    </div>
    <div class="column is-1 has-text-centered">
        {timerText ? timerText : '-- : -- : --'}
    </div>
</div>

<!--<TimeLogList portalId={$page.params.portalid}/>-->