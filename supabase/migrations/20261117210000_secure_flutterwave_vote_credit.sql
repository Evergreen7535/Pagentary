create or replace function public.finalize_flutterwave_payment(
  p_tx_ref text,
  p_transaction_id text,
  p_gateway_payload jsonb
)
returns table (payment_id uuid, votes_credited integer, already_processed boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.payments%rowtype;
begin
  select * into v_payment
  from public.payments
  where tx_ref = p_tx_ref
  for update;

  if not found then
    raise exception 'Payment reference not found';
  end if;

  if v_payment.status = 'successful' then
    return query select v_payment.id, v_payment.votes_to_credit, true;
    return;
  end if;

  if v_payment.status <> 'pending' then
    raise exception 'Payment is not pending';
  end if;

  update public.payments
  set status = 'successful',
      gateway_transaction_id = p_transaction_id,
      gateway_payload = p_gateway_payload,
      verified_at = now()
  where id = v_payment.id;

  insert into public.votes (payment_id, contestant_id, vote_count)
  values (v_payment.id, v_payment.contestant_id, v_payment.votes_to_credit)
  on conflict (payment_id) do nothing;

  return query select v_payment.id, v_payment.votes_to_credit, false;
end;
$$;

revoke all on function public.finalize_flutterwave_payment(text, text, jsonb) from public, anon, authenticated;
grant execute on function public.finalize_flutterwave_payment(text, text, jsonb) to service_role;
