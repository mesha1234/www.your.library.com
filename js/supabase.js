import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


const SUPABASE_URL = "https://fhxzihgkphudlxjkxbrb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoeHppaGdrcGh1ZGx4amt4YnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNTgyNTksImV4cCI6MjA5NjgzNDI1OX0.697fHkT7N8U8sd8qpZO0HHayx8d-72AYqLI0SoWSDGQ";

// ✅ Create client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);