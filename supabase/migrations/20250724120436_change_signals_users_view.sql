drop view if exists "public"."signals_users";

create or replace view "public"."signals_users" as  SELECT users.user_id,
    users.username,
    smart_signals.id,
    smart_signals.fired_at,
    smart_signals.topics,
    smart_signals.condition
   FROM (smart_signals
     JOIN users ON ((smart_signals.user_id = users.id)));