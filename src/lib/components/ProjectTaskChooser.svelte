<script>
    import AutoComplete from "simple-svelte-autocomplete";
    import {createEventDispatcher} from "svelte";
    import {Task} from "../../routes/util/APIService.js";

    const dispatch = createEventDispatcher();

    export let portalId
    export let selectedProjectId = undefined
    export let selectedTaskId
    export let selectedPortalUserId = undefined

    let tasks = []
    let selectedTask = {}

    const initTaskList = async () => {
        selectedTask = {}
        if (!(selectedProjectId && selectedPortalUserId)) {
            return []
        }
        tasks = (await Task.fetchTasksToSubmitTime(portalId, selectedProjectId, selectedPortalUserId))
            .map((task) => {
                if (task.cascading_log_hours && task.is_parent) {
                    return false
                }
                return {...task, billingType: task.billable_type}
            }).filter(e => e)
        const selectedTaskIdx = tasks.findIndex(task => task.id === selectedTaskId)
        if (selectedTaskIdx !== -1) {
            selectedTask = tasks[selectedTaskIdx]
        }
    }

    $: initTaskList(selectedProjectId)
    $: initTaskList(selectedPortalUserId)
</script>

<AutoComplete items="{tasks}"
              labelFieldName="name"
              bind:selectedItem="{selectedTask}"
              onChange={() => dispatch('task-selected', selectedTask)}
              showClear inputClassName="auto-complete-chooser is-small-font">
    <div class="box chooser-item-wrapper" slot="item" let:item let:label>
        <span class:closed-task={item.is_closed}>{@html label}</span>
        <span class="ml-2 icon is-small" class:is-hidden={!item.is_parent} title="Has Sub Tasks"><i class="fas fa-sitemap project-item-icon"></i></span>
        <span class="ml-2 icon is-small" class:is-hidden={!item.is_assigned} title="Assigned"><i class="fas fa-user-check project-item-icon"></i></span>
        <div></div>
        <span title="Task Prefix" class="tag is-small is-warning mt-3">{item.prefix}</span>
        <span title="Milestone" class="tag is-small is-primary mt-3">{@html item.milestone.name}</span>
        <span title="Task List" class="tag is-small is-success mt-3">{@html item.tasklist.name}</span>
    </div>
</AutoComplete>