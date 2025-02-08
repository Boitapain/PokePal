<script lang="ts">

    let { data } = $props();

    import { Auth } from '@supabase/auth-ui-svelte';
    import { goto } from '$app/navigation';

    let { supabase, session } = $derived(data);

    $effect(() => {
        if(session) {
            goto(`/${session.user.email}`);
        }
    });
</script>

<div class="hero min-h-screen">
    <div class="hero-content bg-base-100">
        <div class="flex flex-col">
            <p>Create an account or login below!</p>
            <Auth 
                supabaseClient= {supabase}
                appearance={{
                    extend: false,
                    style: {
                        input: "width: 400px;",
                    },
                    className: {
                        button: "btn btn-secondary shadow !rounded-2xl mb-4",
                        input: "input input-secondary shadow mb-4",
                        label: "label",
                    }
                }}

            />
        </div>
    </div>
</div>
