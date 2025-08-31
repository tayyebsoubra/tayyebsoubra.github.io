import { createClient } from "https://esm.sh/@supabase/supabase-js";

export const supabase = createClient(
  "https://dytpofqccvfdurxppsye.supabase.co", // replace with your project URL
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dHBvZnFjY3ZmZHVyeHBwc3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTY3NjgsImV4cCI6MjA3MjIzMjc2OH0.vCeu-9koCgJgcPDkcjMymmNdhBmvOLlbxtVlw2Id3NE" // replace with your anon key
);
