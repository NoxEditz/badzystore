import { createClient } from "@supabase/supabase-js";
import { CONFIG } from "./config";

export const isSupabaseConfigured = Boolean(
  CONFIG.supabaseUrl && CONFIG.supabaseAnonKey,
);

export const supabase = isSupabaseConfigured
  ? createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey)
  : null;
