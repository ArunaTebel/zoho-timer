<script>
    import AutoComplete from "simple-svelte-autocomplete";
    import {createEventDispatcher} from "svelte";
    import {Project} from "../../routes/util/APIService.js";

    const dispatch = createEventDispatcher();

    export let portalId
    export let selectedProjectId

    let projects = []
    let selectedProject = {}

    const initProjectList = async () => {
        projects = (await Project.fetchAll(portalId))
            .map(project => {
                return {id: project.id_string, name: project.name}
            })
        const selectedProjectIdx = projects.findIndex(project => project.id === selectedProjectId)
        selectedProject = {}
        if (selectedProjectIdx !== -1) {
            selectedProject = projects[selectedProjectIdx]
        }
    }

    $: initProjectList(selectedProjectId)

</script>

<AutoComplete items="{projects}"
              labelFieldName="name"
              bind:selectedItem="{selectedProject}"
              onChange={() => dispatch('project-selected', selectedProject)}
              showClear inputClassName="auto-complete-chooser"/>