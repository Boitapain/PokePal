const POKEMON_API = "https://tyradex.vercel.app/api/v1/pokemon";

export async function getPokemonList() {
    const response = await fetch(POKEMON_API);
    const data = await response.json();
    
    return data;
}

export async function getPokemonById(id: number) {
    if (id < 1 || id > 1025) {
        throw new Error("Invalid ID");
    }
    const response = await fetch(POKEMON_API + `/${id}`);
    const data = await response.json();
    return data;
}