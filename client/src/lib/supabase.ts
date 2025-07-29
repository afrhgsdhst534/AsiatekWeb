import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://shygdhtjhowiyljbcthc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoeWdkaHRqaG93aXlsamJjdGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTk2NTAsImV4cCI6MjA2OTI3NTY1MH0.xMSZZcqwYp9rk3lbaShgRraxX50-fZ_sB86lMbg-vHY"
);
