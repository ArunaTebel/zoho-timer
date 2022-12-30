<script>
    import {onMount} from "svelte";

    export let data;

    onMount(() => {
        if (data.zohoAuthData.access_token) {
            location.href = '/'
        }
    })

</script>

{#if !data.zohoAuthData.access_token}
    <p>Authorization failed! Try again in a moment</p>
{/if}
