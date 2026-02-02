import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our database tables
export interface Event {
    id: string;
    user_id: string;
    name: string;
    deadline: string;
    location: string;
    created_at: string;
}

export interface Todo {
    id: string;
    user_id: string;
    title: string;
    completed: boolean;
    type: 'big' | 'medium' | 'small';
    created_at: string;
}
