import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uoblqdheayshyfilnynd.supabase.co'; // Your Supabase project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvYmxxZGhlYXlzaHlmaWxueW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NjI1ODgsImV4cCI6MjA2MjUzODU4OH0.B6QqISqJf8qXZn-7Bjl1D4Yf4XX6aAgb7mz6DTgH_I4'; // Your anon public API key

if (!supabaseUrl || !supabaseKey) {
  throw new Error('supabaseUrl and supabaseKey are required to initialize Supabase');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;