alter table "public"."dashboard_settings" drop constraint "dashboard_settings_user_id_fkey";

alter table "public"."layouts" drop constraint "layouts_user_id_fkey";

alter table "public"."tabs" drop constraint "tabs_user_id_fkey";

alter table "public"."widgets" drop constraint "widgets_user_id_fkey";

alter table "public"."dashboard_settings" add constraint "dashboard_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE not valid;

alter table "public"."dashboard_settings" validate constraint "dashboard_settings_user_id_fkey";

alter table "public"."layouts" add constraint "layouts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE not valid;

alter table "public"."layouts" validate constraint "layouts_user_id_fkey";

alter table "public"."tabs" add constraint "tabs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE not valid;

alter table "public"."tabs" validate constraint "tabs_user_id_fkey";

alter table "public"."widgets" add constraint "widgets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE not valid;

alter table "public"."widgets" validate constraint "widgets_user_id_fkey";


