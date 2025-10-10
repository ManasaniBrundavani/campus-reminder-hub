-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  organizer TEXT NOT NULL,
  organizer_email TEXT NOT NULL,
  reminder_minutes INTEGER DEFAULT 60,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Anyone can view events (public college events)
CREATE POLICY "Anyone can view events"
ON public.events
FOR SELECT
TO authenticated, anon
USING (true);

-- Only authenticated users can create events
CREATE POLICY "Authenticated users can create events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Users can update their own events
CREATE POLICY "Users can update own events"
ON public.events
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

-- Users can delete their own events
CREATE POLICY "Users can delete own events"
ON public.events
FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Create event reminders table
CREATE TABLE IF NOT EXISTS public.event_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  recipient_email TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on reminders
ALTER TABLE public.event_reminders ENABLE ROW LEVEL SECURITY;

-- Anyone can view reminders (for transparency)
CREATE POLICY "Anyone can view reminders"
ON public.event_reminders
FOR SELECT
TO authenticated, anon
USING (true);

-- System can insert reminders
CREATE POLICY "System can insert reminders"
ON public.event_reminders
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Enable realtime for events
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for events
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();