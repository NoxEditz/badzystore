// Re-export the auto-generated Lovable Cloud Supabase client so existing
// services can keep importing from "@/lib/supabase". The client is always
// configured in this project (Lovable Cloud is enabled).

export { supabase } from "@/integrations/supabase/client";
export const isSupabaseConfigured = true;
