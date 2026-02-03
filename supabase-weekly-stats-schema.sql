-- Step 1: Add completed_at to todos table
ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

-- Step 2: Create focus_sessions table
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  duration_minutes integer not null,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow all to view focus sessions"
  ON public.focus_sessions FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert focus sessions"
  ON public.focus_sessions FOR INSERT
  WITH CHECK (true);

-- Step 3: Create get_weekly_stats RPC function
CREATE OR REPLACE FUNCTION get_weekly_stats(p_user_id uuid)
RETURNS json AS $$
DECLARE
  v_week_start date;
  v_completed_tasks_count int;
  v_focus_hours numeric;
  v_streak_days int;
  v_completion_rate numeric;
  v_total_tasks int;
BEGIN
  -- Get start of current week (Monday)
  v_week_start := date_trunc('week', CURRENT_DATE);
  
  -- Count completed tasks this week
  SELECT COUNT(*)
  INTO v_completed_tasks_count
  FROM public.todos
  WHERE user_id = p_user_id
    AND completed = true
    AND completed_at >= v_week_start;
  
  -- Calculate focus hours this week
  SELECT COALESCE(SUM(duration_minutes) / 60.0, 0)
  INTO v_focus_hours
  FROM public.focus_sessions
  WHERE user_id = p_user_id
    AND started_at >= v_week_start;
  
  -- Calculate streak (consecutive days with at least 1 completed task)
  WITH daily_completions AS (
    SELECT DATE(completed_at) as completion_date
    FROM public.todos
    WHERE user_id = p_user_id
      AND completed = true
      AND completed_at IS NOT NULL
    GROUP BY DATE(completed_at)
    ORDER BY DATE(completed_at) DESC
  ),
  streak_calc AS (
    SELECT 
      completion_date,
      ROW_NUMBER() OVER (ORDER BY completion_date DESC) as rn,
      completion_date - (ROW_NUMBER() OVER (ORDER BY completion_date DESC) || ' days')::interval as grp
    FROM daily_completions
  )
  SELECT COUNT(*)
  INTO v_streak_days
  FROM streak_calc
  WHERE grp = (SELECT grp FROM streak_calc LIMIT 1)
    AND completion_date >= CURRENT_DATE - interval '30 days';
  
  -- Calculate completion rate this week
  SELECT COUNT(*)
  INTO v_total_tasks
  FROM public.todos
  WHERE user_id = p_user_id
    AND created_at >= v_week_start;
  
  IF v_total_tasks > 0 THEN
    v_completion_rate := (v_completed_tasks_count::numeric / v_total_tasks::numeric) * 100;
  ELSE
    v_completion_rate := 0;
  END IF;
  
  -- Return as JSON
  RETURN json_build_object(
    'completed_tasks_count', COALESCE(v_completed_tasks_count, 0),
    'focus_hours', ROUND(COALESCE(v_focus_hours, 0), 1),
    'streak_days', COALESCE(v_streak_days, 0),
    'completion_rate', ROUND(COALESCE(v_completion_rate, 0), 1)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
