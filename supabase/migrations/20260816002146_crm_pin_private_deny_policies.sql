create policy crm_pin_config_deny_direct_access
  on private.crm_pin_config
  for all
  to public
  using (false)
  with check (false);

create policy crm_pin_attempts_deny_direct_access
  on private.crm_pin_attempts
  for all
  to public
  using (false)
  with check (false);
