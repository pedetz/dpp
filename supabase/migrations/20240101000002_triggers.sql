create or replace function fn_check_plan_limits()
returns trigger language plpgsql as $$
declare
  v_plan text;
  v_count int;
  v_limit int;
begin
  if NEW.status != 'published' then
    return NEW;
  end if;

  if TG_OP = 'UPDATE' and OLD.status = 'published' then
    return NEW;
  end if;

  select plan into v_plan from organizations where id = NEW.org_id;

  select count(*) into v_count
  from products
  where org_id = NEW.org_id
    and status = 'published'
    and id != NEW.id;

  v_limit := case v_plan
    when 'trial'   then 3
    when 'starter' then 100
    when 'pro'     then 1000
    when 'filiera' then 2147483647
    else 0
  end;

  if v_count >= v_limit then
    raise exception 'Piano % ha raggiunto il limite di % prodotti pubblicati', v_plan, v_limit;
  end if;

  return NEW;
end;
$$;

create trigger trg_check_plan_limits
  before insert or update on products
  for each row execute function fn_check_plan_limits();

create or replace function fn_publish_passport()
returns trigger language plpgsql as $$
begin
  if NEW.status = 'published' and (TG_OP = 'INSERT' or OLD.status != 'published') then
    NEW.current_version := OLD.current_version + 1;
    NEW.updated_at := now();

    insert into passport_versions (product_id, version, data, published_by, published_at)
    values (NEW.id, NEW.current_version, NEW.data, auth.uid(), now());
  end if;

  if TG_OP = 'UPDATE' and NEW.status != OLD.status then
    NEW.updated_at := now();
  end if;

  return NEW;
end;
$$;

create trigger trg_publish_passport
  before update on products
  for each row execute function fn_publish_passport();

create or replace function fn_updated_at()
returns trigger language plpgsql as $$
begin
  NEW.updated_at := now();
  return NEW;
end;
$$;

create trigger trg_products_updated_at
  before update on products
  for each row execute function fn_updated_at();
