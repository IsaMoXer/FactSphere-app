import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uxsvzcqlyflgkhzlxtim.supabase.co";
/* const supabaseKey = process.env.SUPABASE_KEY; */
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4c3Z6Y3FseWZsZ2toemx4dGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY4MDI4MzIsImV4cCI6MjAzMjM3ODgzMn0.qP3gxs0HHx0trJCKgPzAG21vA1RbkedK6qRIZsdBIc4";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
