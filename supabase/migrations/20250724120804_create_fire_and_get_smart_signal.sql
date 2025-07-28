CREATE OR REPLACE FUNCTION public.fire_and_get_smart_signal(p_id integer)
 RETURNS smart_signals
 LANGUAGE plpgsql
AS $function$DECLARE
  rec smart_signals%ROWTYPE;
BEGIN
  -- Try to atomically update & return the row in one shot
  UPDATE smart_signals AS s
     SET fired_at = NOW(),
         updated_at = NOW()
  FROM firable_smart_signals AS f
  WHERE s.id = f.id
    AND s.id = p_id
  RETURNING s.*  -- return all columns of smart_signals
  INTO rec;

  -- rec is populated only if exactly one row was updated;
  -- otherwise it remains NULL
  RETURN rec;
END;$function$
;
