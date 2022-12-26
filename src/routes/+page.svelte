<script>
    import {PUBLIC_ZOHO_CLIENT_ID, PUBLIC_ZOHO_SCOPE, PUBLIC_ZOHO_OAUTH_URL} from '$env/static/public';
    import {page} from '$app/stores'
    import {Portal} from "./util/APIService.js";

    export let data
    let portals = []
    let oauthUrl = `${PUBLIC_ZOHO_OAUTH_URL}/auth?scope=${PUBLIC_ZOHO_SCOPE}&client_id=${PUBLIC_ZOHO_CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${$page.url.origin}/auth-callback&prompt=none`

    async function fetchPortals() {
        portals = await Portal.fetchAll()
    }
</script>

{#if data.isAuthorized}
    <button on:click={fetchPortals}>fetchPortals</button>
    <ul>
        {#each portals as portal}
            <li>
                <a href="/tracker/{portal.id}" rel="noreferrer">
                    Go to {portal.name}'s Tracker
                </a>
            </li>
        {/each}
    </ul>
{:else }
    <a href="{oauthUrl}">Authorize ZOHO</a>
{/if}
