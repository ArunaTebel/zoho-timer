<script>
    import AutoComplete from "simple-svelte-autocomplete";
    import {createEventDispatcher} from "svelte";
    import {Task} from "../../routes/util/APIService.js";

    const dispatch = createEventDispatcher();

    export let portalId
    export let selectedProjectId = undefined
    export let selectedTaskId

    let tasks = []
    let selectedTask = {}

    const initTaskList = async () => {
        selectedTask = {}
        if (!selectedProjectId) {
            return []
        }
        tasks = (await Task.fetchMyTasks(portalId, selectedProjectId))
            .map((task) => {
                return {id: task.id_string, name: task.name, billingType: task.billingtype}
            })
        const selectedTaskIdx = tasks.findIndex(task => task.id === selectedTaskId)
        if (selectedTaskIdx !== -1) {
            selectedTask = tasks[selectedTaskIdx]
        }
    }

    $: initTaskList(selectedProjectId)
</script>

<AutoComplete items="{tasks}"
              labelFieldName="name"
              bind:selectedItem="{selectedTask}"
              onChange={() => dispatch('task-selected', selectedTask)}
              showClear inputClassName="auto-complete-chooser"/>