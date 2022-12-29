<script>
    import ProjectTaskChooser from "./ProjectTaskChooser.svelte";
    import ProjectBugChooser from "./ProjectBugChooser.svelte";
    import ProjectGeneralTaskName from "./ProjectGeneralTaskName.svelte";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    export let portalId
    export let selectedProjectId
    export let selectedTaskId
    export let selectedPortalUserId
    export let selectedTaskName
    export let selectedBugId
    export let itemMode = 'task'

    const itemModes = {
        'task': {'key': 'task', 'name': 'Project Task'},
        'general': {'key': 'general', 'name': 'General Task'},
        'bug': {'key': 'bug', 'name': 'Issue'}
    }

    const dispatchEvent = (event) => {
        dispatch('project-item-selected', {
            itemMode,
            item: event.detail
        })
    }

</script>

<div class="control">
    {#each Object.keys(itemModes) as mode}
        <label class="radio has-text-weight-bold pb-3 is-small">
            <input class="is-small" type=radio bind:group={itemMode} name="itemMode" value={mode}>
            <span class="is-small-font">{itemModes[mode].name}</span>
        </label>
    {/each}
</div>
{#if (itemMode === itemModes.task.key)}
    <ProjectTaskChooser on:task-selected={dispatchEvent}
                        portalId={portalId}
                        bind:selectedProjectId={selectedProjectId}
                        bind:selectedPortalUserId={selectedPortalUserId}
                        selectedTaskId={selectedTaskId}/>
    <br/>
{:else if (itemMode === itemModes.bug.key)}
    <ProjectBugChooser on:bug-selected={dispatchEvent}
                       portalId={portalId}
                       bind:selectedProjectId={selectedProjectId}
                       bind:selectedPortalUserId={selectedPortalUserId}
                       selectedBugId={selectedBugId}/>
    <br/>
{:else }
    <ProjectGeneralTaskName taskName={selectedTaskName}
                            on:task-name-changed={dispatchEvent}/>
    <br/>
{/if}
