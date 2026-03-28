-- Add country preference to users table
alter table public.users
  add column country text not null default 'US'
  check (country in ('US', 'IN'));

-- Update the handle_new_user trigger to include country default
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name, avatar_url, country)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', null),
    'US'
  );
  return new;
end;
$$ language plpgsql security definer;
