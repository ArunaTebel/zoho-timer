<script>
    import AutoComplete from "simple-svelte-autocomplete"
    import {onMount} from 'svelte'
    import {page} from '$app/stores'
    import {Project} from "../../util/APIService.js";

    let projects = []
    let selectedProjectId

    onMount(async () => {
        projects = await Project.fetchAll($page.params.portalid)
    });

    const colors = ["White", "Red", "Yellow", "Green", "Blue", "Black"]
    let selectedColor
</script>

<p>{selectedProjectId}</p>

<select bind:value={selectedProjectId}>
    {#each projects as project}
        <option value="{project.id}">
            {project.name}
        </option>
    {/each}
</select>
<br/>
<br/>
<br/>
<AutoComplete items="{colors}" bind:selectedItem="{selectedColor}" />