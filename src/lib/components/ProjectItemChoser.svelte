<script>
    import ProjectTaskChooser from "./ProjectTaskChooser.svelte";
    import ProjectBugChooser from "./ProjectBugChooser.svelte";
    import ProjectGeneralTaskName from "./ProjectGeneralTaskName.svelte";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    export let portalId
    export let selectedProjectId
    export let selectedTaskId
    export let selectedTaskName
    export let selectedBugId
    export let itemMode = 'task'

    const itemModes = {
        'task': {'key': 'task', 'name': 'Project Task'},
        'general': {'key': 'general', 'name': 'General Task'},
        'bug': {'key': 'bug', 'name': 'Issue'}
    }
    // let itemMode = itemModes.task.key

    const dispatchEvent = (event) => {
        dispatch('project-item-selected', {
            itemMode,
            item: event.detail
        })
    }

</script>

{#each Object.keys(itemModes) as mode}
    <label>
        <input type=radio bind:group={itemMode} name="itemMode" value={mode}>
        {itemModes[mode].name}
    </label>
{/each}
<br/>

{#if (itemMode === itemModes.task.key)}
    <label>Choose Task</label>
    <ProjectTaskChooser on:task-selected={dispatchEvent}
                        portalId={portalId}
                        bind:selectedProjectId={selectedProjectId}
                        selectedTaskId={selectedTaskId}/>
    <br/>
{:else if (itemMode === itemModes.bug.key)}
    <label>Choose Issue</label>
    <ProjectBugChooser on:bug-selected={dispatchEvent}
                       portalId={portalId}
                       bind:selectedProjectId={selectedProjectId}
                       selectedBugId={selectedBugId}/>
    <br/>
{:else }
    <label>Type a Task Name</label>
    <ProjectGeneralTaskName taskName={selectedTaskName}
                            on:task-name-changed={dispatchEvent}/>
    <br/>
{/if}
