create extension if not exists "pg_trgm" with schema "public" version '1.6';

drop view if exists "public"."signals_users";

alter table "public"."dashboard_settings" add column "favorite_tokens" text[] not null default '{}'::text[];

alter table "public"."news" add column "ai_summary" text[];

alter table "public"."news" add column "related_widgets" jsonb[];

alter table "public"."users" drop column "intake_program";

alter table "public"."users" add column "is_kol" boolean not null default false;

alter table "public"."users" add column "is_project_manager" boolean not null default false;

alter sequence "public"."tags_id_seq" owned by "public"."tags"."id";

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

create or replace view "public"."signals_users" as  SELECT users.user_id,
    users.username,
    smart_signals.id,
    smart_signals.fired_at,
    smart_signals.topics,
    smart_signals.condition
   FROM (smart_signals
     JOIN users ON ((smart_signals.user_id = users.id)));

