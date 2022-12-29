<script>
    import AutoComplete from "simple-svelte-autocomplete";
    import {createEventDispatcher} from "svelte";
    import {Bug} from "../../routes/util/APIService.js";

    const dispatch = createEventDispatcher();

    export let portalId
    export let selectedProjectId
    export let selectedBugId
    export let selectedPortalUserId = undefined

    let bugs = []
    let selectedBug = {}

    const initBugList = async () => {
        selectedBug = {}
        if (!selectedProjectId && selectedPortalUserId) {
            return []
        }
        bugs = await Bug.fetchBugsToSubmitTime(portalId, selectedProjectId, selectedPortalUserId)
        const selectedBugIdx = bugs.findIndex(bug => bug.id === selectedBugId)
        if (selectedBugIdx !== -1) {
            selectedBug = bugs[selectedBugIdx]
        }
    }

    $: initBugList(selectedProjectId)
    $: initBugList(selectedPortalUserId)
</script>

<AutoComplete items="{bugs}"
              labelFieldName="name"
              bind:selectedItem="{selectedBug}"
              onChange={() => dispatch('bug-selected', selectedBug)}
              showClear inputClassName="auto-complete-chooser is-small-font">
    <div class="box chooser-item-wrapper" slot="item" let:item let:label>
        <span class:closed-task={item.is_closed}>{@html label}</span>
        <span class="ml-2 icon is-small" class:is-hidden={!item.is_assigned} title="Assigned"><i class="fas fa-user-check project-item-icon"></i></span>
        <div></div>
        <span title="Issue Prefix" class="tag is-small is-warning mt-3">{item.prefix}</span>
    </div>
</AutoComplete>