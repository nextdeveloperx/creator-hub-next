-- Aggregate counts only (no personal data), so the public site can show live numbers on top of its base figures.
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'users',   (SELECT count(*) FROM public.profiles),
    'members', (SELECT count(*) FROM public.memberships WHERE status = 'active'),
    'sales',   (SELECT count(*) FROM public.purchases WHERE lower(payment_status) IN ('paid','completed','success','captured')),
    'by_product', (
      SELECT coalesce(json_object_agg(product_name, c), '{}'::json)
      FROM (
        SELECT product_name, count(*) AS c
        FROM public.purchases
        WHERE lower(payment_status) IN ('paid','completed','success','captured')
        GROUP BY product_name
      ) x
    )
  );
$$;

REVOKE ALL ON FUNCTION public.get_public_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_stats() TO anon, authenticated;
