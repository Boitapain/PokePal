import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from "$env/static/public";
import { createBrowserClient} from "@supabase/ssr";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ fetch, depends }: any) => {
    depends('supabase:auth');

    const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: { fetch },
    });

    const { data: sessionData } = await supabase.auth.getSession();

    return { supabase, session: sessionData?.session ?? null };
};
