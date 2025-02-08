<script lang="ts">
    let { data } = $props();
    console.log(data);
    let { supabase, session } = $derived(data);

    import { getPokemonById, getPokemonList } from "$lib/pokemonAPI";

    import { page } from "$app/state";
    let email = $derived(page.params.email);
    let profile: any = $state({
        description: "Feel free to talk about you or your favorite Pokemon!",
        pokemon_ids: [1, 2, 3],
        username: "",
        fav_page: [],
    });

    let pokemonList: any = $state([]);
    let pokemonData: any = $state([]);

    async function refreshPokemonData() {
        const promises = profile.pokemon_ids.map((id: number) =>
            getPokemonById(id),
        );
        pokemonList = await getPokemonList();
        pokemonData = await Promise.all(promises);
    }

    async function saveProfile() {
        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", session?.user?.email);

        if (profileData?.length === 0) {
            const { data, error } = await supabase
                .from("profiles")
                .insert({
                    ...profile,
                    user_id: session?.user?.id,
                    email: session?.user?.email,
                });
        } else {
            const { data, error } = await supabase
                .from("profiles")
                .update({ ...profile })
                .eq("user_id", session?.user?.id);
        }
    }

    $effect(() => {
        async function fetchData() {
            // update profile data
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("description, pokemon_ids, username, fav_page")
                .eq("email", email);
            if (profileData?.length == 0 && email == session?.user?.email) {
                await saveProfile();
            } else if (profileData != null && profileData.length > 0) {
                // extract data
                profile = profileData[0];
            } else {
                profile = {
                    description: "This user has not set a profile yet",
                    pokemon_ids: [],
                };
            }
            // refresh pokemon data with the ids from user profile
            await refreshPokemonData();
        }
        fetchData();
    });

    let isModalOpen = $state(false);
    let searchInput = $state("");

    async function savePageEdit() {
        await saveProfile();
        await refreshPokemonData();
        isModalOpen = false;
    }

    async function togglePokemon(id: number) {
        let pokemonIDs = [...profile.pokemon_ids];

        if (pokemonIDs.length >= 6 && !pokemonIDs.includes(id)) {
            alert("You can only have 6 pokemon on your page");
            return;
        }

        if (pokemonIDs.includes(id)) {
            let index = pokemonIDs.indexOf(id);
            pokemonIDs.splice(index, 1);
        } else {
            pokemonIDs.push(id);
        }

        profile = { ...profile, pokemon_ids: pokemonIDs };
        await refreshPokemonData();
    }
</script>

<div class="hero min-h-screen bg-base-100">
    <div class="text-center hero-content">
        <div class="max-w-2xl">
            <h1 class="mb-5 text-5xl font-bold">
                {#if !profile.username && session?.user?.email === email}
                    Your page
                {:else if !profile.username && session?.user?.email !== email }
                    {email.split("@")[0]}'s page
                {:else}
                    {profile.username}'s page
                {/if}
            </h1>
            <p class="py-3 mx-auto">{profile.description}</p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full h-[300px] sm:h-auto overflow-y-scroll">
                {#if pokemonData === undefined}
                    <p>Loading...</p>
                    <span class="loading loading-ring loading-lg"></span>
                {:else}
                    {#each pokemonData as pokemon}
                        <div
                            class="card card-compact bg-base-300 m-4 glass shadow"
                        >
                            <div class="card-body">
                                <div class="text-center">
                                    <img
                                        src={pokemon.sprites.regular}
                                        class="w-32 h-32 mx-auto"
                                        alt="Pokemon"
                                    />
                                    <h2
                                        class="card-title justify-center text-2xl mb-2 font-bold text-shadow"
                                    >
                                        {pokemon.name.fr}
                                    </h2>
                                    <p class="text-center text-secondary">
                                        {#each pokemon.types as type}
                                            {type.name + " "}
                                        {/each}
                                    </p>
                                </div>
                            </div>
                        </div>
                    {/each}
                {/if}
            </div>
            {#if session?.user?.email === email && session?.user?.email}
                <button
                    class="btn justify-self-center mt-4 self-center"
                    aria-label="Add a Pokemon"
                    onclick={() => (isModalOpen = true)}
                >
                    Edit Page
                </button>

                <dialog
                    class="modal modal-bottom sm:modal-middle"
                    class:modal-open={isModalOpen}
                >
                    <div class="modal-box">
                        <h3 class="text-lg font-bold">Edit your page</h3>

                        <p class="py-4">
                            Here you can edit your page, like the description,
                            or your favorite pokemons
                        </p>
                        <span class="label">Edit your username</span>
                        <input
                            type="text"
                            class="input input-bordered w-full"
                            bind:value={profile.username}
                            placeholder="Username"
                        />
                        <span class="label">Edit the description</span>
                        <textarea
                            bind:value={profile.description}
                            class="textarea textarea-bordered w-full"
                            placeholder="Description"
                        >
                        </textarea>

                        <span class="label">Select your Pokemons</span>
                        <input
                                    type="text"
                                    class="input input-bordered w-full"
                                    placeholder="Search for a Pokemon"
                                    bind:value={searchInput}
                                />
                        <div
                            class="grid xs:grid-cols-3 gap-4 overflow-y-scroll max-h-[300px] m-3"
                        >
                            <div class="col-span-3">
                                
                            </div>
                            {#each pokemonList as pokemon, index}
                                {#if searchInput === "" || pokemon.name.fr
                                        .toLowerCase()
                                        .includes(searchInput.toLowerCase())}
                                    {#if index != 0}
                                        <button
                                            class={"btn btn-neutral " +
                                                (profile.pokemon_ids.includes(
                                                    index,
                                                )
                                                    ? "border-2 border-secondary"
                                                    : "")}
                                            onclick={() => togglePokemon(index)}
                                        >
                                            {pokemon.name.fr}
                                        </button>
                                    {/if}
                                {/if}
                            {/each}
                        </div>

                        <button
                            class="btn mx-4 btn-secondary"
                            onclick={() => savePageEdit()}>Save Edits</button
                        >
                        <button
                            class="btn"
                            onclick={() => (isModalOpen = false)}>Cancel</button
                        >
                    </div>
                </dialog>
            {:else if session?.user?.email !== email && session?.user?.email} 
                <button class="btn justify-self-center mt-4 self-center"
                aria-label="Add a Pokemon">Add to favorite</button>
            {/if}
        </div>
    </div>
</div>
