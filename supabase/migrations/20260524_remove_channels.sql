-- Remove marketing channel tracking (idempotent).
do $$
begin
  alter publication supabase_realtime drop table public.channels;
exception
  when undefined_table then null;
  when others then null;
end $$;

drop index if exists public.leads_channel_label_idx;

alter table public.leads
  drop column if exists channel,
  drop column if exists channel_label;

drop table if exists public.channels cascade;
