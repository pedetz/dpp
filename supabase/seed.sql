insert into category_templates (id, category, version, fields) values (
  '00000000-0000-0000-0000-000000000001',
  'tessile',
  1,
  '[
    {"key":"composizione","label_it":"Composizione fibre","label_en":"Fiber composition","type":"composition","required":true,"help":"Percentuali per fibra, somma 100%"},
    {"key":"paese_tessitura","label_it":"Paese di tessitura","label_en":"Country of weaving","type":"country","required":true},
    {"key":"paese_confezione","label_it":"Paese di confezione","label_en":"Country of manufacture","type":"country","required":true},
    {"key":"contenuto_riciclato","label_it":"Contenuto riciclato (%)","label_en":"Recycled content (%)","type":"percent","required":false},
    {"key":"istruzioni_cura","label_it":"Istruzioni di cura","label_en":"Care instructions","type":"care_symbols","required":true},
    {"key":"smaltimento","label_it":"Istruzioni fine vita","label_en":"End of life instructions","type":"textarea","required":true},
    {"key":"svhc","label_it":"Sostanze SVHC dichiarate","label_en":"Declared SVHC substances","type":"textarea","required":false},
    {"key":"durabilita","label_it":"Note su durabilità e riparabilità","label_en":"Durability and repairability notes","type":"textarea","required":false}
  ]'::jsonb
);

insert into organizations (id, name, vat_number, plan) values (
  '00000000-0000-0000-0000-000000000010',
  'Demo Brand Srl',
  'IT12345678901',
  'pro'
);

insert into products (id, org_id, sku, gtin, name, category, slug, status, data, images, current_version) values (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000010',
  'MAG-001',
  '8012345678901',
  'Maglione Merino Naturale',
  'tessile',
  'maglione-merino-naturale',
  'published',
  '{
    "composizione": {"lana_merino": 80, "cashmere": 20},
    "paese_tessitura": "IT",
    "paese_confezione": "IT",
    "contenuto_riciclato": 0,
    "istruzioni_cura": ["lavaggio_a_mano", "non_asciugare_in_asciugatrice"],
    "smaltimento": "Consegnare al punto di raccolta tessili. Componenti naturali compostabili.",
    "svhc": "Nessuna sostanza SVHC dichiarata.",
    "durabilita": "Durata stimata 5 anni con manutenzione appropriata. Riparabile da sarto specializzato."
  }'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800'],
  1
),
(
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000010',
  'JNS-001',
  '8012345678902',
  'Jeans Denim Sostenibile',
  'tessile',
  'jeans-denim-sostenibile',
  'published',
  '{
    "composizione": {"cotone_organico": 98, "elastan": 2},
    "paese_tessitura": "PT",
    "paese_confezione": "PT",
    "contenuto_riciclato": 30,
    "istruzioni_cura": ["lavare_a_30", "non_candeggiare", "stirare_media_temperatura"],
    "smaltimento": "Restituire in negozio per riciclo. Il denim può essere rigenerato in nuovi filati.",
    "svhc": "Nessuna sostanza SVHC dichiarata.",
    "durabilita": "Rinforzato alle cuciture. Durata stimata 3 anni di uso intensivo."
  }'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'],
  1
),
(
  '00000000-0000-0000-0000-000000000103',
  '00000000-0000-0000-0000-000000000010',
  'SCA-001',
  '8012345678903',
  'Scarpa Derby Cuoio',
  'tessile',
  'scarpa-derby-cuoio',
  'published',
  '{
    "composizione": {"cuoio_bovino": 90, "gomma_naturale": 10},
    "paese_tessitura": "IT",
    "paese_confezione": "IT",
    "contenuto_riciclato": 10,
    "istruzioni_cura": ["pulire_con_panno_umido", "lucidare_periodicamente"],
    "smaltimento": "Consegnare al calzolaio per rigenerazione suola. Tomaia in pelle biodegradabile.",
    "svhc": "Coloranti azoici assenti. Cromo VI non rilevato.",
    "durabilita": "Suola sostituibile. Prodotto progettato per durare oltre 10 anni con manutenzione."
  }'::jsonb,
  ARRAY['https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800'],
  1
);

insert into passport_versions (product_id, version, data, published_at) values (
  '00000000-0000-0000-0000-000000000101',
  1,
  '{
    "composizione": {"lana_merino": 80, "cashmere": 20},
    "paese_tessitura": "IT",
    "paese_confezione": "IT",
    "contenuto_riciclato": 0,
    "istruzioni_cura": ["lavaggio_a_mano", "non_asciugare_in_asciugatrice"],
    "smaltimento": "Consegnare al punto di raccolta tessili. Componenti naturali compostabili.",
    "svhc": "Nessuna sostanza SVHC dichiarata.",
    "durabilita": "Durata stimata 5 anni con manutenzione appropriata. Riparabile da sarto specializzato."
  }'::jsonb,
  now()
),
(
  '00000000-0000-0000-0000-000000000102',
  1,
  '{
    "composizione": {"cotone_organico": 98, "elastan": 2},
    "paese_tessitura": "PT",
    "paese_confezione": "PT",
    "contenuto_riciclato": 30,
    "istruzioni_cura": ["lavare_a_30", "non_candeggiare", "stirare_media_temperatura"],
    "smaltimento": "Restituire in negozio per riciclo. Il denim può essere rigenerato in nuovi filati.",
    "svhc": "Nessuna sostanza SVHC dichiarata.",
    "durabilita": "Rinforzato alle cuciture. Durata stimata 3 anni di uso intensivo."
  }'::jsonb,
  now()
),
(
  '00000000-0000-0000-0000-000000000103',
  1,
  '{
    "composizione": {"cuoio_bovino": 90, "gomma_naturale": 10},
    "paese_tessitura": "IT",
    "paese_confezione": "IT",
    "contenuto_riciclato": 10,
    "istruzioni_cura": ["pulire_con_panno_umido", "lucidare_periodicamente"],
    "smaltimento": "Consegnare al calzolaio per rigenerazione suola. Tomaia in pelle biodegradabile.",
    "svhc": "Coloranti azoici assenti. Cromo VI non rilevato.",
    "durabilita": "Suola sostituibile. Prodotto progettato per durare oltre 10 anni con manutenzione."
  }'::jsonb,
  now()
);
