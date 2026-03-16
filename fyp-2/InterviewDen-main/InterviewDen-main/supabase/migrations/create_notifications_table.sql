-- =====================================================
-- NOTIFICATIONS TABLE SCHEMA
-- Create this table in your Supabase SQL Editor
-- =====================================================

-- Create the notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'general',
  -- Types: 'status_update', 'message', 'interview', 'quiz', 'general'
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}',
  -- metadata can store additional info like job_id, application_id, etc.
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create index for faster queries by user
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);

-- Create index for unread notifications
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON public.notifications(user_id, read) WHERE read = false;

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Allow service role to insert notifications (for the company portal)
CREATE POLICY "Service role can insert notifications" ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Optional: Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS notifications_updated_at ON public.notifications;
CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- =====================================================
-- SAMPLE QUERIES
-- =====================================================

-- Get all unread notifications for a user:
-- SELECT * FROM notifications WHERE user_id = 'user-uuid' AND read = false ORDER BY created_at DESC;

-- Mark notification as read:
-- UPDATE notifications SET read = true WHERE id = 'notification-uuid';

-- Mark all as read for a user:
-- UPDATE notifications SET read = true WHERE user_id = 'user-uuid' AND read = false;

-- Get notification count:
-- SELECT COUNT(*) FROM notifications WHERE user_id = 'user-uuid' AND read = false;
