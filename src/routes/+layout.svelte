<script>
    import "bulma/css/bulma.min.css";
    import logo from '$lib/assets/img/logo.png';
    import {Auth} from "./util/APIService.js";

    const onLogout = async () => {
        await Auth.logout()
        location.reload()
    }

</script>
<nav class="navbar is-warning" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
        <a class="navbar-item" href="/">
            <img height="100%" src="{logo}" alt="Logo"> <span class="subtitle is-4 ml-3 has-text-weight-bold">Essentials</span>
        </a>

        <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
        </a>
    </div>

    <div id="navbarBasicExample" class="navbar-menu">
        <div class="navbar-end">
            <div class="navbar-item">
                <div class="buttons">
                    <button on:click={onLogout} class="button is-danger is-small">
                        Log out
                    </button>
                </div>
            </div>
        </div>
    </div>
</nav>
<main class="has-background-light pt-4" style="min-height: 100vh">
    <section class="container">
        <slot></slot>
    </section>
</main>