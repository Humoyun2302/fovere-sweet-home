-- Run in Supabase SQL Editor if your project already exists (idempotent).
alter table public.leads
  add column if not exists service_type text
    check (service_type is null or service_type in ('design', 'realization')),
  add column if not exists project_type text
    check (project_type is null or project_type in ('residential', 'commercial', 'architectural')),
  add column if not exists area_sqm numeric
    check (area_sqm is null or area_sqm > 0),
  add column if not exists property_address text;

create index if not exists leads_service_type_idx on public.leads(service_type);
create index if not exists leads_project_type_idx on public.leads(project_type);
