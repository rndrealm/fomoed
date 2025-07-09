create extension if not exists "pg_trgm" with schema "public" version '1.6';

create sequence "public"."tags_id_seq";

alter table "public"."campaigns" drop constraint "campaigns_status_check";

alter table "public"."project_members" drop constraint "project_members_role_check";

alter table "public"."projects" drop constraint "projects_status_check";

alter table "public"."user_roles" drop constraint "user_roles_role_check";

drop view if exists "public"."signals_users";

create table "public"."campaign_platforms" (
    "campaign_id" integer not null,
    "platform" character varying(50) not null
);


create table "public"."campaign_tags" (
    "campaign_id" integer not null,
    "tag_id" integer not null
);


create table "public"."tags" (
    "id" integer not null default nextval('tags_id_seq'::regclass),
    "name" character varying(50) not null
);


alter table "public"."dashboard_settings" add column "favorite_tokens" text[] not null default '{}'::text[];

alter table "public"."kols" add column "avatar_url" text;

alter table "public"."kols" add column "banner_url" text;

alter table "public"."kols" add column "bio" text;

alter table "public"."kols" add column "content_types" text;

alter table "public"."kols" add column "expertise" text;

alter table "public"."kols" add column "location" text;

alter table "public"."kols" add column "onboarding" boolean not null default true;

alter table "public"."kols" add column "wallet_address" character varying(512);

alter table "public"."kols" alter column "email" set data type text using "email"::text;

alter table "public"."kols" alter column "full_name" set data type text using "full_name"::text;

alter table "public"."news" add column "ai_summary" text[];

alter table "public"."news" add column "related_widgets" jsonb[];

alter table "public"."users" drop column "intake_program";

alter table "public"."users" add column "is_kol" boolean not null default false;

alter table "public"."users" add column "is_project_manager" boolean not null default false;

alter sequence "public"."tags_id_seq" owned by "public"."tags"."id";

CREATE INDEX campaign_platforms_campaign_id_idx ON public.campaign_platforms USING btree (campaign_id);

CREATE UNIQUE INDEX campaign_platforms_pkey ON public.campaign_platforms USING btree (campaign_id, platform);

CREATE INDEX campaign_tags_campaign_id_idx ON public.campaign_tags USING btree (campaign_id);

CREATE UNIQUE INDEX campaign_tags_pkey ON public.campaign_tags USING btree (campaign_id, tag_id);

CREATE INDEX campaigns_end_date_idx ON public.campaigns USING btree (end_date);

CREATE INDEX campaigns_project_id_status_idx ON public.campaigns USING btree (project_id, status);

CREATE INDEX campaigns_start_date_idx ON public.campaigns USING btree (start_date);

CREATE INDEX campaigns_title_idx ON public.campaigns USING gin (title gin_trgm_ops);

CREATE INDEX kol_requests_campaign_id_idx ON public.kol_requests USING btree (campaign_id);

CREATE UNIQUE INDEX tags_name_key ON public.tags USING btree (name);

CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

alter table "public"."campaign_platforms" add constraint "campaign_platforms_pkey" PRIMARY KEY using index "campaign_platforms_pkey";

alter table "public"."campaign_tags" add constraint "campaign_tags_pkey" PRIMARY KEY using index "campaign_tags_pkey";

alter table "public"."tags" add constraint "tags_pkey" PRIMARY KEY using index "tags_pkey";

alter table "public"."campaign_platforms" add constraint "campaign_platforms_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE not valid;

alter table "public"."campaign_platforms" validate constraint "campaign_platforms_campaign_id_fkey";

alter table "public"."campaign_tags" add constraint "campaign_tags_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE not valid;

alter table "public"."campaign_tags" validate constraint "campaign_tags_campaign_id_fkey";

alter table "public"."campaign_tags" add constraint "campaign_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE not valid;

alter table "public"."campaign_tags" validate constraint "campaign_tags_tag_id_fkey";

alter table "public"."tags" add constraint "tags_name_key" UNIQUE using index "tags_name_key";

alter table "public"."campaigns" add constraint "campaigns_status_check" CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'paused'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[]))) not valid;

alter table "public"."campaigns" validate constraint "campaigns_status_check";

alter table "public"."project_members" add constraint "project_members_role_check" CHECK (((role)::text = ANY ((ARRAY['owner'::character varying, 'manager'::character varying])::text[]))) not valid;

alter table "public"."project_members" validate constraint "project_members_role_check";

alter table "public"."projects" add constraint "projects_status_check" CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'completed'::character varying, 'archived'::character varying])::text[]))) not valid;

alter table "public"."projects" validate constraint "projects_status_check";

alter table "public"."user_roles" add constraint "user_roles_role_check" CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'manager'::character varying])::text[]))) not valid;

alter table "public"."user_roles" validate constraint "user_roles_role_check";

set check_function_bodies = off;

create or replace view "public"."campaign_with_meta" as  SELECT c.id,
    c.project_id,
    c.title,
    c.description,
    c.banner_url,
    c.status,
    c.start_date,
    c.end_date,
    c.budget,
    c.target_audience,
    c.created_at,
    c.updated_at,
    COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE (t.name IS NOT NULL)), '{}'::character varying[]) AS tags,
    COALESCE(array_agg(DISTINCT cp.platform) FILTER (WHERE (cp.platform IS NOT NULL)), '{}'::character varying[]) AS platforms,
    max(kr.payment_amount) AS max_payout,
    count(kr.*) AS request_count
   FROM ((((campaigns c
     LEFT JOIN campaign_tags ct ON ((ct.campaign_id = c.id)))
     LEFT JOIN tags t ON ((t.id = ct.tag_id)))
     LEFT JOIN campaign_platforms cp ON ((cp.campaign_id = c.id)))
     LEFT JOIN kol_requests kr ON ((kr.campaign_id = c.id)))
  GROUP BY c.id;


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


grant delete on table "public"."campaign_platforms" to "anon";

grant insert on table "public"."campaign_platforms" to "anon";

grant references on table "public"."campaign_platforms" to "anon";

grant select on table "public"."campaign_platforms" to "anon";

grant trigger on table "public"."campaign_platforms" to "anon";

grant truncate on table "public"."campaign_platforms" to "anon";

grant update on table "public"."campaign_platforms" to "anon";

grant delete on table "public"."campaign_platforms" to "authenticated";

grant insert on table "public"."campaign_platforms" to "authenticated";

grant references on table "public"."campaign_platforms" to "authenticated";

grant select on table "public"."campaign_platforms" to "authenticated";

grant trigger on table "public"."campaign_platforms" to "authenticated";

grant truncate on table "public"."campaign_platforms" to "authenticated";

grant update on table "public"."campaign_platforms" to "authenticated";

grant delete on table "public"."campaign_platforms" to "service_role";

grant insert on table "public"."campaign_platforms" to "service_role";

grant references on table "public"."campaign_platforms" to "service_role";

grant select on table "public"."campaign_platforms" to "service_role";

grant trigger on table "public"."campaign_platforms" to "service_role";

grant truncate on table "public"."campaign_platforms" to "service_role";

grant update on table "public"."campaign_platforms" to "service_role";

grant delete on table "public"."campaign_tags" to "anon";

grant insert on table "public"."campaign_tags" to "anon";

grant references on table "public"."campaign_tags" to "anon";

grant select on table "public"."campaign_tags" to "anon";

grant trigger on table "public"."campaign_tags" to "anon";

grant truncate on table "public"."campaign_tags" to "anon";

grant update on table "public"."campaign_tags" to "anon";

grant delete on table "public"."campaign_tags" to "authenticated";

grant insert on table "public"."campaign_tags" to "authenticated";

grant references on table "public"."campaign_tags" to "authenticated";

grant select on table "public"."campaign_tags" to "authenticated";

grant trigger on table "public"."campaign_tags" to "authenticated";

grant truncate on table "public"."campaign_tags" to "authenticated";

grant update on table "public"."campaign_tags" to "authenticated";

grant delete on table "public"."campaign_tags" to "service_role";

grant insert on table "public"."campaign_tags" to "service_role";

grant references on table "public"."campaign_tags" to "service_role";

grant select on table "public"."campaign_tags" to "service_role";

grant trigger on table "public"."campaign_tags" to "service_role";

grant truncate on table "public"."campaign_tags" to "service_role";

grant update on table "public"."campaign_tags" to "service_role";

grant delete on table "public"."tags" to "anon";

grant insert on table "public"."tags" to "anon";

grant references on table "public"."tags" to "anon";

grant select on table "public"."tags" to "anon";

grant trigger on table "public"."tags" to "anon";

grant truncate on table "public"."tags" to "anon";

grant update on table "public"."tags" to "anon";

grant delete on table "public"."tags" to "authenticated";

grant insert on table "public"."tags" to "authenticated";

grant references on table "public"."tags" to "authenticated";

grant select on table "public"."tags" to "authenticated";

grant trigger on table "public"."tags" to "authenticated";

grant truncate on table "public"."tags" to "authenticated";

grant update on table "public"."tags" to "authenticated";

grant delete on table "public"."tags" to "service_role";

grant insert on table "public"."tags" to "service_role";

grant references on table "public"."tags" to "service_role";

grant select on table "public"."tags" to "service_role";

grant trigger on table "public"."tags" to "service_role";

grant truncate on table "public"."tags" to "service_role";

grant update on table "public"."tags" to "service_role";


