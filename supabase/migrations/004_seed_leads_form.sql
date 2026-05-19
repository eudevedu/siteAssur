-- Seed the default leads form
INSERT INTO public.forms (id, title, slug, description, fields, settings)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Junte-se ao Nosso Time',
    'participar',
    'Preencha as informações abaixo para darmos continuidade ao contato via WhatsApp.',
    '[
        {"id": "name", "type": "text", "label": "Nome Completo", "required": true, "placeholder": "Seu nome"},
        {"id": "city", "type": "text", "label": "Município", "required": true, "placeholder": "Sua cidade"},
        {"id": "neighborhood", "type": "text", "label": "Bairro", "required": true, "placeholder": "Seu bairro"},
        {"id": "phone", "type": "tel", "label": "Telefone / WhatsApp", "required": true, "placeholder": "(00) 00000-0000"},
        {"id": "profession", "type": "text", "label": "Profissão", "required": false, "placeholder": "Sua profissão"},
        {"id": "referrer", "type": "text", "label": "Pessoa que Indicou", "required": false, "placeholder": "Quem te indicou?"},
        {"id": "instagram", "type": "text", "label": "Instagram", "required": false, "placeholder": "@seuusuario"}
    ]'::jsonb,
    '{
        "submitButtonText": "QUERO ME JUNTAR",
        "successMessage": "Obrigado pelo seu interesse! Estamos te redirecionando agora...",
        "redirectUrl": ""
    }'::jsonb
)
ON CONFLICT (slug) DO UPDATE 
SET fields = EXCLUDED.fields, 
    settings = EXCLUDED.settings,
    title = EXCLUDED.title,
    description = EXCLUDED.description;
