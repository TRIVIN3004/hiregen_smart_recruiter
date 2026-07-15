const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('\n================================================================');
  console.warn('WARNING: Supabase URL and Key are missing in backend/.env.');
  console.warn('Please add SUPABASE_URL and SUPABASE_KEY to your environment.');
  console.warn('================================================================\n');
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseKey || 'placeholder-key'
);

module.exports = supabase;
