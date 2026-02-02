import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our database tables
export type TodoStatus = 'todo' | 'done';
export type TodoType = 'big_mission' | 'medium' | 'small';

export interface Todo {
    id: string;
    title: string;
    status: TodoStatus;
    type: TodoType;
    created_at: string;
}

export type EventStatus = 'applying' | 'building' | 'submitted';

export interface Event {
    id: string;
    title: string;
    deadline_date: string;
    status: EventStatus;
    created_at: string;
}
