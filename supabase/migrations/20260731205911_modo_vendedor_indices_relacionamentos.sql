create index sales_documents_proposal_id_idx
  on public.sales_documents(proposal_id)
  where proposal_id is not null;

create index sales_proposals_inventory_item_id_idx
  on public.sales_proposals(inventory_item_id)
  where inventory_item_id is not null;
