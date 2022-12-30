<script>
    import {Portal} from "./util/APIService.js";
    import {onMount} from "svelte";

    export let data
    let portals = []

    onMount(fetchPortals)

    async function fetchPortals() {
        portals = await Portal.fetchAll()
        if (portals.length === 1) {
            location.href = `/tracker/${portals[0].id}`
        }
    }

</script>

{#if data.isAuthorized}
    <ul>
        {#each portals as portal}
            <li class="box">
                <a href="/tracker/{portal.id}" rel="noreferrer">
                    Go to {portal.name}'s Tracker
                </a>
            </li>
        {/each}
    </ul>
{/if}
