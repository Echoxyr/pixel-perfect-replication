-- Add sidebar module preferences to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS sidebar_modules JSONB DEFAULT '{}';

-- Add favorites/bookmarks table
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titolo TEXT NOT NULL,
  url TEXT NOT NULL,
  icona TEXT DEFAULT 'star',
  ordine INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own favorites"
ON public.user_favorites
FOR ALL
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Add activity log / audit trail table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_name TEXT,
  azione TEXT NOT NULL,
  entita_tipo TEXT NOT NULL,
  entita_id TEXT,
  entita_nome TEXT,
  dettagli JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view full audit log, users can see their own actions
CREATE POLICY "Users can view their own audit entries"
ON public.audit_log
FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Add keyboard shortcuts preferences
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS keyboard_shortcuts JSONB DEFAULT '{"search": "ctrl+k", "save": "ctrl+s", "new": "ctrl+n"}';

-- Add onboarding status
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- Create index for faster audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entita ON public.audit_log(entita_tipo, entita_id);