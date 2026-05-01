ALTER TABLE public.business_settings
  ADD COLUMN IF NOT EXISTS ticket_title text DEFAULT 'TIKET ANTRIAN',
  ADD COLUMN IF NOT EXISTS ticket_logo_url text,
  ADD COLUMN IF NOT EXISTS ticket_footer text DEFAULT 'Mohon menunggu giliran Anda',
  ADD COLUMN IF NOT EXISTS ticket_font_size text DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS ticket_show_address boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS ticket_show_phone boolean DEFAULT false;
