
alter table "public"."users" drop column "intake_program";

alter table "public"."users" add column "is_kol" boolean not null default false;

alter table "public"."users" add column "is_project_manager" boolean not null default false;