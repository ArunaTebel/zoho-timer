<script>
    import "bulma/css/bulma.min.css";
    import logo from '$lib/assets/img/logo.png';
    import {Auth} from "./util/APIService.js";
    import {SvelteToast} from '@zerodevx/svelte-toast'
    import {PUBLIC_ZOHO_CLIENT_ID, PUBLIC_ZOHO_OAUTH_URL, PUBLIC_ZOHO_SCOPE} from "$env/static/public";
    import {page} from "$app/stores";
    export let data

    let oauthUrl = `${PUBLIC_ZOHO_OAUTH_URL}/auth?scope=${PUBLIC_ZOHO_SCOPE}&client_id=${PUBLIC_ZOHO_CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${$page.url.origin}/auth-callback&prompt=consent`

    const onLogout = async () => {
        await Auth.logout()
        localStorage.clear()
        location.href = '/'
    }

</script>
<nav class="navbar has-box-shadow" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
        <a class="navbar-item" href="/">
            <img height="100%" src="{logo}" alt="Logo">
            <h2 class="ml-3 has-text-weight-bold">Essentials</h2>
        </a>

        <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
        </a>
    </div>

    <div class="navbar-menu">
        <div class="navbar-end">
            <div class="navbar-item">
                <div class="buttons">
                    <button class:is-hidden={!data.isAuthorized} on:click={onLogout} class="button is-danger is-small">
                        Log out
                    </button>
                    <a class:is-hidden={data.isAuthorized} class="button is-primary is-small" href="{oauthUrl}">
                        Authorize ZOHO
                    </a>
                </div>
            </div>
        </div>
    </div>
</nav>
<SvelteToast/>
<main class="has-background-light pt-4" style="min-height: 100vh">
    <section class="container">
        <slot></slot>
    </section>
</main>