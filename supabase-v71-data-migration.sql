-- V7.1 data migration — idempotente e preserva app_settings como fallback.
insert into public.budgets (id,payload,created_at,updated_at)
select (x->>'id')::uuid, x,
       coalesce((x->>'createdAt')::timestamptz, now()),
       coalesce((x->>'updatedAt')::timestamptz, now())
from public.app_settings s
cross join lateral jsonb_array_elements(s.value) x
where s.key='saved_budgets_v1' and x ? 'id'
on conflict (id) do update set
 payload=excluded.payload,
 updated_at=greatest(public.budgets.updated_at,excluded.updated_at);

insert into public.ecosystem_catalog
(id,name,category,capacities,colors,final_prices,price_history,offers,source,active,updated_at)
select x->>'id',x->>'name',coalesce(x->>'category','WEARABLE'),
       coalesce(x->'capacities','[]'::jsonb),coalesce(x->'colors','[]'::jsonb),
       coalesce(x->'finalPrices','{}'::jsonb),coalesce(x->'priceHistory','{}'::jsonb),
       '{}'::jsonb,'app_settings-v7.0.2',true,now()
from public.app_settings s
cross join lateral jsonb_array_elements(s.value) x
where s.key='catalog' and coalesce(x->>'category','')='WEARABLE' and x ? 'id'
on conflict (id) do update set
 name=excluded.name,category=excluded.category,capacities=excluded.capacities,
 colors=excluded.colors,final_prices=excluded.final_prices,price_history=excluded.price_history,
 source=excluded.source,active=true,updated_at=excluded.updated_at;

-- O catálogo de Orçamento é semeado pelo cliente V7.1 usando o catálogo BRAND vigente,
-- ou substituído pela importação XLS/XLSX/CSV feita dentro do Orçamento.
