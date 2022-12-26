<script>
    import AutoComplete from "simple-svelte-autocomplete";
    import {createEventDispatcher} from "svelte";
    import {Bug} from "../../routes/util/APIService.js";

    const dispatch = createEventDispatcher();

    export let portalId
    export let selectedProjectId
    export let selectedBugId

    let bugs = []
    let selectedBug = {}

    const initBugList = async () => {
        selectedBug = {}
        if (!selectedProjectId) {
            return []
        }
        bugs = (await Bug.fetchMyBugsForProject(portalId, selectedProjectId))
            .map((bug) => {
                return {id: bug.id_string, name: bug.title}
            })
        const selectedBugIdx = bugs.findIndex(bug => bug.id === selectedBugId)
        if (selectedBugIdx !== -1) {
            selectedBug = bugs[selectedBugIdx]
        }
    }

    $: initBugList(selectedProjectId)
</script>

<AutoComplete items="{bugs}"
              labelFieldName="name"
              bind:selectedItem="{selectedBug}"
              onChange={() => dispatch('bug-selected', selectedBug)}
              showClear/>