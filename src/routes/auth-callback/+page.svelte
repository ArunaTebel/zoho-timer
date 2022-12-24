<script>
    export let data;
</script>

{#if data.zohoAuthData.access_token}
    <p>Successfully Authorized with Zoho!</p>
    <a href="/">Go to App</a>
{:else }
    <p>Authorization failed! Try again in a moment</p>
{/if}
