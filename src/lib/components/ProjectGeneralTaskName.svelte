<script>
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher();

    export let taskName

</script>
<input bind:value={taskName} on:change={() => dispatch('task-name-changed', taskName)}/>
