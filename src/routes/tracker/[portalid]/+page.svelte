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

    let timerText = '-'
    let timerBtnText = 'Loading ...'
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
        setTimerBtnText()
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
            setTimerBtnText()
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

    const setTimerBtnText = () => {
        timerBtnText = getTimerStartedAt() ? 'Stop' : 'Start'
    }
</script>

<!--<input type="text" placeholder="ZOHO User ID" bind:value={zohoUserId}-->
<!--       on:keyup={event => StorageService.common.setZohoUserId(event.target.value)}>-->

<button on:click={onClickTimerBtn}>{timerBtnText}</button>

<ProjectChooser on:project-selected={onProjectChange}
                portalId="{$page.params.portalid}"
                selectedProjectId={selectedProject?.id}/>

<ProjectItemChoser on:project-item-selected={onProjectItemChange}
                   portalId="{$page.params.portalid}"
                   bind:selectedProjectId={selectedProject.id}
                   selectedTaskId={selectedTask?.id}
                   selectedBugId={selectedBug?.id}
                   selectedTaskName={selectedTaskName}/>

<input type="date" bind:value={date} on:change={() => updateTimerDataStorage()}/>

<label>
    <input type=checkbox bind:checked={isBillable} on:change={() => updateTimerDataStorage()}>
    Is Billable?
</label>

<input type="text" maxlength="150" placeholder="Note" bind:value={note} on:keyup={() => updateTimerDataStorage()}/>

<hr/>

<TimeLogList portalId={$page.params.portalid}/>