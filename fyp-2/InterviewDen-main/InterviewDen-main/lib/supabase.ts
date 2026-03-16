import { createBrowserClient, createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createSupabaseBrowserClient = () =>
  createBrowserClient(supabaseUrl, supabaseKey)

export const createSupabaseServerClient = (cookies: any) =>
  createServerClient(supabaseUrl, supabaseKey, {
    cookies,
  }) 