<script>
    import AutoComplete from "simple-svelte-autocomplete"
    import {onMount} from 'svelte'
    import {page} from '$app/stores'
    import moment from "moment";
    import {Project, Task, Timesheet} from "../../util/APIService.js";
    import StorageService from "../../util/StorageService.js";

    const timerData = StorageService.timer.getData()

    let timerText = '-'
    let timerBtnText = 'Loading ...'
    let projects = []
    let tasks = []
    let zohoUserId = StorageService.common.getZohoUserId()
    let selectedProject = timerData?.selectedProject
    let selectedTask = timerData?.selectedTask
    let selectedTaskName = timerData?.selectedTaskName
    let isBillable = timerData?.isBillable
    let date = timerData?.date ?? moment().format('Y-M-D')
    let note = timerData?.note

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

    const onProjectChange = async () => {
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

    const onTaskChange = () => {
        updateTimerDataStorage()
    }

    const onClickTimerBtn = async () => {
        try {
            validateInputs()
            if (getTimerStartedAt()) {
                await Timesheet.addLog(
                    $page.params.portalid,
                    selectedProject.id,
                    selectedTask.id,
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
        const taskMissing = !(selectedTask && selectedTask.id)
        const taskNameMissing = !(selectedTaskName && selectedTaskName.trim().length > 0)
        if (taskMissing && taskNameMissing) {
            throw new Error('Please select a Task or provide a Task Name')
        }
        if (!date) {
            throw new Error('Please select a Date')
        }
        if (getTimeElapsed(false) === '00:00') {
            // throw new Error('Minimum time duration must be one minute')
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
            selectedTaskName,
            date,
            isBillable,
            note,
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
        selectedTaskName = ''
        isBillable = false
        date = moment().format('Y-M-D')
        note = ''
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

<input type="text" placeholder="ZOHO User ID" bind:value={zohoUserId}
       on:keyup={event => StorageService.common.setZohoUserId(event.target.value)}>
<h3>Time: {timerText}</h3>
<pre>Project ID: {selectedProject?.id}</pre>
<pre>Task ID: {selectedTask?.id}</pre>
<pre>Task Name: {selectedTaskName}</pre>
<pre>Date: {date}</pre>
<pre>Is Billable: {isBillable}</pre>
<pre>Note: {note}</pre>
<button on:click={onClickTimerBtn}>{timerBtnText}</button>

<AutoComplete items="{projects}"
              labelFieldName="name"
              bind:selectedItem="{selectedProject}"
              onChange={onProjectChange}
              showClear/>

<AutoComplete items="{tasks}"
              labelFieldName="name"
              bind:selectedItem="{selectedTask}"
              onChange={onTaskChange}
              showClear/>

{#if !(selectedTask && selectedTask.id)}
    <input type="text" placeholder="Task Name" bind:value={selectedTaskName} on:keyup={() => updateTimerDataStorage()}/>
{/if}

<input type="date" bind:value={date} on:change={() => updateTimerDataStorage()}/>

<label>
    <input type=checkbox bind:checked={isBillable} on:change={() => updateTimerDataStorage()}>
    Is Billable?
</label>

<input type="text" placeholder="Note" bind:value={note} on:keyup={() => updateTimerDataStorage()}/>