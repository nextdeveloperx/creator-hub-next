-- Editable content blocks for the /ai page ("Get the Android App", "Myra PC Controller"):
-- headline, description, banner image and download button, all managed from the admin panel.
CREATE TABLE public.page_sections (
  key text PRIMARY KEY,
  eyebrow text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  highlight text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  banner_url text,
  button_text text NOT NULL DEFAULT 'Download',
  button_url text,
  is_visible boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view page sections" ON public.page_sections
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage page sections" ON public.page_sections
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.page_sections (key, eyebrow, title, highlight, description, button_text) VALUES
  ('android_app', 'DOWNLOADS', 'Get the', 'Android App',
   'Your voice assistant lives in your pocket. Grab the latest build, straight from the source.', 'Download'),
  ('pc_controller', 'PC CONTROLLER', 'Control Your PC from Your Phone', 'PC',
   'Free desktop companion for Windows — connect it to the Myra Android app and control your PC''s screen, files and apps right from your phone.',
   'Download Myra PC Controller (.exe)');

-- The admin dashboard lists customers next to their purchases, so admins need to read every profile.
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
