import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Hardcoded for Expo Go compatibility
// TODO: Move back to env vars before production build
const SUPABASE_URL = "https://libjhfhrvmxtntemcsvi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpYmpoZmhydm14dG50ZW1jc3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDkwMjAsImV4cCI6MjA5MzgyNTAyMH0.S5vxDmzvnZoeQ_PVlxMQ3teo05FREjwV1Yc_XzVgyLk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Connection test — results appear in Metro bundler terminal logs
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error("[Supabase] Connection FAILED:", error.message, error.status);
  } else {
    console.log("[Supabase] Connection OK. Session:", data.session ? "active" : "none");
  }
});