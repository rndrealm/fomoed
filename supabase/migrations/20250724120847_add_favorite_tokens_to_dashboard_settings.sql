
alter table "public"."dashboard_settings" add column "favorite_tokens" text[] not null default '{}'::text[];