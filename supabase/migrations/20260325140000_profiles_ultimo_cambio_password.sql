alter table public.profiles
  add column if not exists ultimo_cambio_password timestamptz;

comment on column public.profiles.ultimo_cambio_password is
  'Momento del último cambio de contraseña por el usuario; null obliga cambio al ingresar.';
