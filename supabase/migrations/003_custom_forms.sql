-- Create custom forms table
CREATE TABLE IF NOT EXISTS public.forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create form submissions table
CREATE TABLE IF NOT EXISTS public.form_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID REFERENCES public.forms(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for forms
CREATE POLICY "Allow public read access on forms" ON public.forms
    FOR SELECT USING (true);

CREATE POLICY "Allow admin full access on forms" ON public.forms
    FOR ALL USING (auth.role() = 'authenticated');

-- Policies for submissions
CREATE POLICY "Allow public insert on submissions" ON public.form_submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin select on submissions" ON public.form_submissions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin delete on submissions" ON public.form_submissions
    FOR DELETE USING (auth.role() = 'authenticated');
