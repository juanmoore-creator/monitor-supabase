import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const isConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isConfigured
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export const missingEnvVars = [
    !supabaseUrl && 'VITE_SUPABASE_URL',
    !supabaseKey && 'VITE_SUPABASE_KEY'
].filter(Boolean) as string[];
