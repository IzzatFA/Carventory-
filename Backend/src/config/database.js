const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

// Create a single supabase client for interacting with your database
// Note: We use service_role key to bypass RLS in the backend
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = supabase;
