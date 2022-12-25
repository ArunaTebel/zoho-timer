<script>
    import AutoComplete from "simple-svelte-autocomplete";
    import {createEventDispatcher, onMount} from "svelte";
    import {Project} from "../../routes/util/APIService.js";

    const dispatch = createEventDispatcher();

    export let portalId
    export let selectedProjectId

    let projects = []
    let selectedProject = {}

    onMount(async () => {
        projects = (await Project.fetchAll(portalId))
            .map(project => {
                return {id: project.id_string, name: project.name}
            })
        const selectedProjectIdx = projects.findIndex(task => task.id === selectedProjectId)
        if (selectedProjectIdx !== -1) {
            selectedProject = projects[selectedProjectIdx]
        }
    });

</script>

<AutoComplete items="{projects}"
              labelFieldName="name"
              bind:selectedItem="{selectedProject}"
              onChange={() => dispatch('project-selected', selectedProject)}
              showClear/>