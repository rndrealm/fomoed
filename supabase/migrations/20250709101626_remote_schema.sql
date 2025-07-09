alter table "public"."campaigns" drop constraint "campaigns_status_check";

alter table "public"."project_members" drop constraint "project_members_role_check";

alter table "public"."projects" drop constraint "projects_status_check";

alter table "public"."user_roles" drop constraint "user_roles_role_check";

alter table "public"."campaigns" add constraint "campaigns_status_check" CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'paused'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[]))) not valid;

alter table "public"."campaigns" validate constraint "campaigns_status_check";

alter table "public"."project_members" add constraint "project_members_role_check" CHECK (((role)::text = ANY ((ARRAY['owner'::character varying, 'manager'::character varying])::text[]))) not valid;

alter table "public"."project_members" validate constraint "project_members_role_check";

alter table "public"."projects" add constraint "projects_status_check" CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'completed'::character varying, 'archived'::character varying])::text[]))) not valid;

alter table "public"."projects" validate constraint "projects_status_check";

alter table "public"."user_roles" add constraint "user_roles_role_check" CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'manager'::character varying])::text[]))) not valid;

alter table "public"."user_roles" validate constraint "user_roles_role_check";


