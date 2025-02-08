import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

type Theme = 'acid' | 'dracula';

// Vérifier si on est dans le navigateur avant d'accéder à localStorage
const isBrowser = typeof window !== 'undefined';

// Initialiser le thème depuis localStorage ou par défaut en 'light'
const storedTheme = isBrowser ? (localStorage.getItem('theme') as Theme | null) ?? 'acid' : 'acid';

// Créer un store réactif
export const theme: Writable<Theme> = writable(storedTheme);

// Met à jour localStorage et l'attribut HTML automatiquement
theme.subscribe(($theme) => {
    if (isBrowser) {
        localStorage.setItem('theme', $theme);
        document.documentElement.setAttribute('data-theme', $theme);
    }
});

// Fonction pour toggle le thème
export function switchTheme(): void {
    theme.update((current) => (current === 'acid' ? 'dracula' : 'acid'));
}
