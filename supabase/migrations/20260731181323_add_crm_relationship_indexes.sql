create index contact_interactions_customer_id_idx
  on public.contact_interactions(customer_id)
  where customer_id is not null;

create index contact_interactions_lead_id_idx
  on public.contact_interactions(lead_id)
  where lead_id is not null;

create index follow_up_tasks_customer_id_idx
  on public.follow_up_tasks(customer_id)
  where customer_id is not null;

create index follow_up_tasks_lead_id_idx
  on public.follow_up_tasks(lead_id)
  where lead_id is not null;
