<script>
    import {Portal} from "./util/APIService.js";
    import {onMount} from "svelte";
    import {PUBLIC_ZOHO_CLIENT_ID, PUBLIC_ZOHO_OAUTH_URL, PUBLIC_ZOHO_SCOPE} from "$env/static/public";
    import {page} from "$app/stores";

    export let data
    let portals = []
    let oauthUrl = `${PUBLIC_ZOHO_OAUTH_URL}/auth?scope=${PUBLIC_ZOHO_SCOPE}&client_id=${PUBLIC_ZOHO_CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${$page.url.origin}/auth-callback&prompt=consent`

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
{:else }
    <div class="columns">
        <div class="column is-12 has-text-centered">
            <a class:is-hidden={data.isAuthorized}
               class="button is-info is-large mt-6"
               href="{oauthUrl}">
                Authorize with ZOHO to start tracking time
            </a>
        </div>
    </div>
{/if}
