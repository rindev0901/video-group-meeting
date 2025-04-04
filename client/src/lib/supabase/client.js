import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  return createSupabaseClient(
    "https://rpopfhnpvgkpnjzchcid.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwb3BmaG5wdmdrcG5qemNoY2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NTAwOTgsImV4cCI6MjA1MDQyNjA5OH0.KCLXyfh1pAtn0pEvEGtrnzKT0KInA52ss2jJt2o-sI0"
  );
}
