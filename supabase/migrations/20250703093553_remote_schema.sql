

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "moddatetime" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."decrement_news_comments"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Set the role to allow the update
    PERFORM set_config('my.role', 'like_count_func_role', true);
    
    UPDATE news
    SET comments_count = comments_count - 1
    WHERE id = OLD.news_id;
    
    RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."decrement_news_comments"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrement_news_likes"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    -- Set the role to allow the update
    PERFORM set_config('my.role', 'like_count_func_role', true);
    
    UPDATE news
    SET likes_count = likes_count - 1
    WHERE id = OLD.news_id;
    
    RETURN OLD;
END;$$;


ALTER FUNCTION "public"."decrement_news_likes"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."smart_signals" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" bigint NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "topics" "text"[] NOT NULL,
    "condition" "text" NOT NULL,
    "fired_at" timestamp with time zone,
    "actions" "jsonb"[],
    "name" "text" DEFAULT ''::"text",
    "description" "text"
);


ALTER TABLE "public"."smart_signals" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fire_and_get_smart_signal"("p_id" integer) RETURNS "public"."smart_signals"
    LANGUAGE "plpgsql"
    AS $$DECLARE
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
END;$$;


ALTER FUNCTION "public"."fire_and_get_smart_signal"("p_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_news_comments"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
    -- Set the role to allow the update
    PERFORM set_config('my.role', 'like_count_func_role', true);
    
    UPDATE news
    SET comments_count = comments_count + 1
    WHERE id = NEW.news_id;
    
    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."increment_news_comments"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_news_likes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Set the role to allow the update
    PERFORM set_config('my.role', 'like_count_func_role', true);
    
    UPDATE news
    SET likes_count = likes_count + 1
    WHERE id = NEW.news_id;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."increment_news_likes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_public_user_data"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.public_user_data (user_id, avatar_url, display_name)
    VALUES (NEW.id, NULL, NULL);
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."insert_public_user_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_notification_as_read"("notification_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    UPDATE notifications
    SET read = true
    WHERE id = notification_id AND user_id = (select auth.uid());
END;$$;


ALTER FUNCTION "public"."mark_notification_as_read"("notification_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."api_health" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "source" "text" DEFAULT ''::"text" NOT NULL,
    "response_time" integer,
    "status_code" integer,
    "error_message" "text" DEFAULT ''::"text" NOT NULL,
    "health" "text" DEFAULT 'healthy'::"text" NOT NULL,
    "type" "text" DEFAULT 'rest'::"text" NOT NULL
);


ALTER TABLE "public"."api_health" OWNER TO "postgres";


COMMENT ON TABLE "public"."api_health" IS 'This table stores the health for all the third party apis used on fomoed';



ALTER TABLE "public"."api_health" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."api_health_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."campaign_kols" (
    "campaign_id" integer NOT NULL,
    "kol_id" integer NOT NULL,
    "role" character varying(100),
    "assigned_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."campaign_kols" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."campaigns" (
    "id" integer NOT NULL,
    "project_id" integer NOT NULL,
    "title" character varying(255) NOT NULL,
    "description" "text",
    "banner_url" character varying(512),
    "status" character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    "start_date" "date",
    "end_date" "date",
    "budget" numeric(12,2),
    "target_audience" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "campaigns_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'paused'::character varying, 'completed'::character varying, 'cancelled'::character varying])::"text"[])))
);


ALTER TABLE "public"."campaigns" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."campaigns_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."campaigns_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."campaigns_id_seq" OWNED BY "public"."campaigns"."id";



CREATE TABLE IF NOT EXISTS "public"."cfgi_data" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "token" "text",
    "today" "jsonb",
    "yesterday" "jsonb"
);


ALTER TABLE "public"."cfgi_data" OWNER TO "postgres";


COMMENT ON TABLE "public"."cfgi_data" IS 'Scraped date from cfgi api for all tokens';



CREATE TABLE IF NOT EXISTS "public"."comment_likes" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "comment_id" bigint NOT NULL
);


ALTER TABLE "public"."comment_likes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" bigint NOT NULL,
    "news_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "parent_id" bigint,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."comments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."comments_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."comments_id_seq" OWNED BY "public"."comments"."id";



ALTER TABLE "public"."comments" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."comments_id_seq1"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."custom_news" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"(),
    "author" "text",
    "title" "text",
    "summary" "text",
    "content" "text",
    "tokens" "text"[]
);


ALTER TABLE "public"."custom_news" OWNER TO "postgres";


COMMENT ON TABLE "public"."custom_news" IS 'Table for specific news for marketing push';



CREATE TABLE IF NOT EXISTS "public"."dashboard_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"(),
    "auto_save" boolean,
    "active_tab_id" "uuid",
    "favorite_widgets" "text"[] DEFAULT '{}'::"text"[] NOT NULL
);


ALTER TABLE "public"."dashboard_settings" OWNER TO "postgres";


COMMENT ON TABLE "public"."dashboard_settings" IS 'Table for the dashboard settings';



CREATE TABLE IF NOT EXISTS "public"."exchangeLiqMapCache" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "data" "json" NOT NULL,
    "asset" character varying NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."exchangeLiqMapCache" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."firable_smart_signals" AS
 SELECT "smart_signals"."id",
    "smart_signals"."created_at",
    "smart_signals"."user_id",
    "smart_signals"."updated_at",
    "smart_signals"."topics",
    "smart_signals"."condition",
    "smart_signals"."fired_at",
    "smart_signals"."actions",
    "smart_signals"."name",
    "smart_signals"."description"
   FROM "public"."smart_signals"
  WHERE ("smart_signals"."fired_at" IS NULL);


ALTER TABLE "public"."firable_smart_signals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."intake_forms" (
    "id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "contact_email" "text" NOT NULL,
    "contacted_by_managment" boolean DEFAULT false,
    "who_are_you" "text",
    "full_name" "text",
    "email_address" "text",
    "twitter_handle" "text",
    "project_name" "text",
    "website_url" "text",
    "project_description" "text",
    "project_type" "text",
    "token_live" boolean,
    "token_address" "text",
    "listed_on_exchanges" "text",
    "token_url" "text",
    "chains_deployed" "text",
    "connected_wallets" integer,
    "twitter_followers" integer,
    "community_members" integer,
    "marketing_budget_spent" "text",
    "conversion_rate" numeric,
    "kols_activated" integer,
    "biggest_campaign_success" "text",
    "campaign_objectives" "text",
    "focus_kpis" "text",
    "success_criteria" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."intake_forms" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."intake_forms_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."intake_forms_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."intake_forms_id_seq" OWNED BY "public"."intake_forms"."id";



CREATE TABLE IF NOT EXISTS "public"."kol_platforms" (
    "id" integer NOT NULL,
    "kol_id" integer NOT NULL,
    "platform" "text" NOT NULL,
    "access_token" "text" NOT NULL,
    "refresh_token" "text" NOT NULL,
    "expires_at" timestamp with time zone,
    "scope" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."kol_platforms" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."kol_platforms_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."kol_platforms_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."kol_platforms_id_seq" OWNED BY "public"."kol_platforms"."id";



CREATE TABLE IF NOT EXISTS "public"."kol_requests" (
    "id" integer NOT NULL,
    "kol_id" integer NOT NULL,
    "campaign_id" integer NOT NULL,
    "payment_amount" numeric(12,2) NOT NULL,
    "message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."kol_requests" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."kol_requests_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."kol_requests_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."kol_requests_id_seq" OWNED BY "public"."kol_requests"."id";



CREATE TABLE IF NOT EXISTS "public"."kols" (
    "id" integer NOT NULL,
    "full_name" character varying(255) NOT NULL,
    "email" character varying(255) NOT NULL,
    "user_id" "uuid",
    "profile_url" character varying(512),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."kols" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."kols_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."kols_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."kols_id_seq" OWNED BY "public"."kols"."id";



CREATE TABLE IF NOT EXISTS "public"."layouts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "draft" boolean
);


ALTER TABLE "public"."layouts" OWNER TO "postgres";


COMMENT ON TABLE "public"."layouts" IS 'Table for the dashboard layouts';



CREATE TABLE IF NOT EXISTS "public"."news" (
    "id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "original_url" "text",
    "likes_count" bigint DEFAULT '0'::bigint NOT NULL,
    "source" "text",
    "comments_count" bigint DEFAULT '0'::bigint NOT NULL,
    "image_url" "text",
    "sentiment" "text",
    "summary" "text",
    "symbols" "text"[],
    "title" "text",
    "published_at" timestamp with time zone,
    "metadata" "jsonb",
    CONSTRAINT "news_comments_count_check" CHECK (("comments_count" >= 0)),
    CONSTRAINT "news_likes_check" CHECK (("likes_count" >= 0))
);


ALTER TABLE "public"."news" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."news_bookmarks" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "news_id" "text" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    CONSTRAINT "news_bookmarks_user_id_check" CHECK (("user_id" = "auth"."uid"()))
);


ALTER TABLE "public"."news_bookmarks" OWNER TO "postgres";


ALTER TABLE "public"."news_bookmarks" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."news_bookmarks_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."news_likes" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "news_id" "text" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    CONSTRAINT "news_likes_user_id_check" CHECK (("user_id" = "auth"."uid"()))
);


ALTER TABLE "public"."news_likes" OWNER TO "postgres";


ALTER TABLE "public"."news_likes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."news_likes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "smart_signal_id" bigint NOT NULL,
    "read" boolean DEFAULT false
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


COMMENT ON COLUMN "public"."notifications"."read" IS 'If the user opened it or not';



CREATE TABLE IF NOT EXISTS "public"."project_members" (
    "project_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" character varying(20) NOT NULL,
    CONSTRAINT "project_members_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['owner'::character varying, 'manager'::character varying])::"text"[])))
);


ALTER TABLE "public"."project_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" integer NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "banner_url" character varying(512),
    "status" character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    "start_date" "date",
    "end_date" "date",
    "budget" numeric(12,2),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "projects_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'completed'::character varying, 'archived'::character varying])::"text"[])))
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."projects_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."projects_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."projects_id_seq" OWNED BY "public"."projects"."id";



CREATE TABLE IF NOT EXISTS "public"."public_user_data" (
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "display_name" "text",
    "avatar_url" "text"
);


ALTER TABLE "public"."public_user_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sentiment" (
    "id" bigint NOT NULL,
    "sentiment" smallint NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    "device_id" "text" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."sentiment" OWNER TO "postgres";


ALTER TABLE "public"."sentiment" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."sentiment_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "username" "text",
    "email" "text",
    "updated_at" timestamp with time zone,
    "user_id" "uuid" NOT NULL,
    "has_had_free_trial" boolean DEFAULT false NOT NULL,
    "intake_program" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'Users Table';



COMMENT ON COLUMN "public"."users"."intake_program" IS 'the intake program is for all users who are applying for campaign managment';



CREATE OR REPLACE VIEW "public"."signals_users" AS
 SELECT "users"."user_id",
    "users"."username",
    "smart_signals"."id",
    "smart_signals"."fired_at",
    "smart_signals"."topics",
    "smart_signals"."condition"
   FROM ("public"."smart_signals"
     JOIN "public"."users" ON (("smart_signals"."user_id" = "users"."id")));


ALTER TABLE "public"."signals_users" OWNER TO "postgres";


ALTER TABLE "public"."smart_signals" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."smart_signals_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "price_id" "text",
    "subscription_id" "text" NOT NULL,
    "user_id" "uuid",
    "updated_at" timestamp with time zone,
    "start_timestamp" timestamp with time zone,
    "end_timestamp" timestamp with time zone,
    "has_cancelled" boolean DEFAULT false NOT NULL,
    "plan_name" "text"
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


COMMENT ON TABLE "public"."subscriptions" IS 'User subscriptions record';



ALTER TABLE "public"."subscriptions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."subscriptions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."tabs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text",
    "user_id" "uuid" DEFAULT "gen_random_uuid"(),
    "layout_id" "uuid" DEFAULT "gen_random_uuid"()
);


ALTER TABLE "public"."tabs" OWNER TO "postgres";


COMMENT ON TABLE "public"."tabs" IS 'Table for dashboard tabs';



CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "user_id" "uuid" NOT NULL,
    "role" character varying(20) NOT NULL,
    CONSTRAINT "user_roles_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['admin'::character varying, 'manager'::character varying])::"text"[])))
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


ALTER TABLE "public"."users" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."widgets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"(),
    "layout_id" "uuid" DEFAULT "gen_random_uuid"(),
    "token" "text",
    "meta" "jsonb",
    "props" "jsonb"
);


ALTER TABLE "public"."widgets" OWNER TO "postgres";


COMMENT ON TABLE "public"."widgets" IS 'Table for dashboard widgets';



CREATE OR REPLACE VIEW "public"."youtube_streaming_topics" AS
 SELECT "topic"."topic"
   FROM "public"."smart_signals",
    LATERAL "unnest"("smart_signals"."topics") "topic"("topic")
  WHERE ("topic"."topic" ~~ 'youtube_streaming_%'::"text");


ALTER TABLE "public"."youtube_streaming_topics" OWNER TO "postgres";


ALTER TABLE ONLY "public"."campaigns" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."campaigns_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."intake_forms" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."intake_forms_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."kol_platforms" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."kol_platforms_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."kol_requests" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."kol_requests_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."kols" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."kols_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."projects" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."projects_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."api_health"
    ADD CONSTRAINT "api_health_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."news"
    ADD CONSTRAINT "articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."campaign_kols"
    ADD CONSTRAINT "campaign_kols_pkey" PRIMARY KEY ("campaign_id", "kol_id");



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cfgi_data"
    ADD CONSTRAINT "cfgi_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cfgi_data"
    ADD CONSTRAINT "cfgi_data_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."comment_likes"
    ADD CONSTRAINT "comment_likes_pkey" PRIMARY KEY ("user_id", "comment_id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."custom_news"
    ADD CONSTRAINT "custom_news_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dashboard_settings"
    ADD CONSTRAINT "dashboard_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exchangeLiqMapCache"
    ADD CONSTRAINT "exchangeLiqMapCache_pkey" PRIMARY KEY ("asset");



ALTER TABLE ONLY "public"."intake_forms"
    ADD CONSTRAINT "intake_forms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."intake_forms"
    ADD CONSTRAINT "intake_forms_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."kol_platforms"
    ADD CONSTRAINT "kol_platforms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kol_requests"
    ADD CONSTRAINT "kol_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kols"
    ADD CONSTRAINT "kols_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."kols"
    ADD CONSTRAINT "kols_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."kols"
    ADD CONSTRAINT "kols_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."layouts"
    ADD CONSTRAINT "layouts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."news_bookmarks"
    ADD CONSTRAINT "news_bookmarks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."news"
    ADD CONSTRAINT "news_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."news_likes"
    ADD CONSTRAINT "news_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."news"
    ADD CONSTRAINT "news_original_url_key" UNIQUE ("original_url");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_members"
    ADD CONSTRAINT "project_members_pkey" PRIMARY KEY ("project_id", "user_id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."public_user_data"
    ADD CONSTRAINT "public_user_data_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."sentiment"
    ADD CONSTRAINT "sentiment_device_id_key" UNIQUE ("device_id");



ALTER TABLE ONLY "public"."sentiment"
    ADD CONSTRAINT "sentiment_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."smart_signals"
    ADD CONSTRAINT "smart_signals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_subscription_id_key" UNIQUE ("subscription_id");



ALTER TABLE ONLY "public"."tabs"
    ADD CONSTRAINT "tabs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."news_bookmarks"
    ADD CONSTRAINT "unique_bookmarks" UNIQUE ("news_id", "user_id");



ALTER TABLE ONLY "public"."news_likes"
    ADD CONSTRAINT "unique_news_user" UNIQUE ("news_id", "user_id");



ALTER TABLE ONLY "public"."kol_platforms"
    ADD CONSTRAINT "uq_platform_kol_id" UNIQUE ("platform", "kol_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."widgets"
    ADD CONSTRAINT "widgets_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "unique_lower_email" ON "public"."users" USING "btree" ("lower"("email"));



CREATE UNIQUE INDEX "unq_kol_campaign" ON "public"."kol_requests" USING "btree" ("kol_id", "campaign_id");



CREATE OR REPLACE TRIGGER "campaigns_set_updated_at" BEFORE UPDATE ON "public"."campaigns" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."exchangeLiqMapCache" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "kols_set_updated_at" BEFORE UPDATE ON "public"."kols" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "on_news_comments_delete" BEFORE DELETE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."decrement_news_comments"();



CREATE OR REPLACE TRIGGER "on_news_comments_insert" BEFORE INSERT ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."increment_news_comments"();



CREATE OR REPLACE TRIGGER "on_news_likes_delete" BEFORE DELETE ON "public"."news_likes" FOR EACH ROW EXECUTE FUNCTION "public"."decrement_news_likes"();



CREATE OR REPLACE TRIGGER "on_news_likes_insert" BEFORE INSERT ON "public"."news_likes" FOR EACH ROW EXECUTE FUNCTION "public"."increment_news_likes"();



CREATE OR REPLACE TRIGGER "projects_set_updated_at" BEFORE UPDATE ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."campaign_kols"
    ADD CONSTRAINT "campaign_kols_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaign_kols"
    ADD CONSTRAINT "campaign_kols_kol_id_fkey" FOREIGN KEY ("kol_id") REFERENCES "public"."kols"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."campaigns"
    ADD CONSTRAINT "campaigns_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comment_likes"
    ADD CONSTRAINT "comment_likes_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id");



ALTER TABLE ONLY "public"."comment_likes"
    ADD CONSTRAINT "comment_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey2" FOREIGN KEY ("user_id") REFERENCES "public"."public_user_data"("user_id");



ALTER TABLE ONLY "public"."custom_news"
    ADD CONSTRAINT "custom_news_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id");



ALTER TABLE ONLY "public"."dashboard_settings"
    ADD CONSTRAINT "dashboard_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id");



ALTER TABLE ONLY "public"."kol_platforms"
    ADD CONSTRAINT "fk_kol_id" FOREIGN KEY ("kol_id") REFERENCES "public"."kols"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."intake_forms"
    ADD CONSTRAINT "intake_forms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."kol_platforms"
    ADD CONSTRAINT "kol_platforms_kol_id_fkey" FOREIGN KEY ("kol_id") REFERENCES "public"."kols"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."kol_requests"
    ADD CONSTRAINT "kol_requests_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."kol_requests"
    ADD CONSTRAINT "kol_requests_kol_id_fkey" FOREIGN KEY ("kol_id") REFERENCES "public"."kols"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."kols"
    ADD CONSTRAINT "kols_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."layouts"
    ADD CONSTRAINT "layouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id");



ALTER TABLE ONLY "public"."news_bookmarks"
    ADD CONSTRAINT "news_bookmarks_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."news_bookmarks"
    ADD CONSTRAINT "news_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."news_bookmarks"
    ADD CONSTRAINT "news_bookmarks_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."news_likes"
    ADD CONSTRAINT "news_likes_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."news_likes"
    ADD CONSTRAINT "news_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."news_likes"
    ADD CONSTRAINT "news_likes_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_smart_signal_id_fkey" FOREIGN KEY ("smart_signal_id") REFERENCES "public"."smart_signals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_members"
    ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_members"
    ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."public_user_data"
    ADD CONSTRAINT "public_user_data_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."smart_signals"
    ADD CONSTRAINT "smart_signals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tabs"
    ADD CONSTRAINT "tabs_layout_id_fkey" FOREIGN KEY ("layout_id") REFERENCES "public"."layouts"("id");



ALTER TABLE ONLY "public"."tabs"
    ADD CONSTRAINT "tabs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."widgets"
    ADD CONSTRAINT "widgets_layout_id_fkey" FOREIGN KEY ("layout_id") REFERENCES "public"."layouts"("id");



ALTER TABLE ONLY "public"."widgets"
    ADD CONSTRAINT "widgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id");



CREATE POLICY "Access to exchange table " ON "public"."exchangeLiqMapCache" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow users to update their own notifications" ON "public"."notifications" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Dashboard settings access policy" ON "public"."dashboard_settings" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Enable delete for users based on user_id" ON "public"."comment_likes" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."news_bookmarks" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."news_likes" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."notifications" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."smart_signals" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE ("users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."comment_likes" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."news_bookmarks" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."news_likes" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for users based on user_id" ON "public"."public_user_data" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable read access for all users" ON "public"."news" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."public_user_data" FOR SELECT USING (true);



CREATE POLICY "Enable update for users based on user_id" ON "public"."public_user_data" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."smart_signals" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE ("users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Enable users to view their own data only" ON "public"."comment_likes" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."news_bookmarks" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."news_likes" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."notifications" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."smart_signals" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE ("users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Enable users to view their own data only" ON "public"."users" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "General news policy" ON "public"."news" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Layout access policy" ON "public"."layouts" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Only Auth User" ON "public"."subscriptions" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Only Auth User" ON "public"."users" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Only Service Role" ON "public"."sentiment" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Tabs Policy" ON "public"."tabs" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Users can delete their own comments" ON "public"."comments" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert smart signals only with their user_id" ON "public"."smart_signals" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE ("users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert their own comments" ON "public"."comments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read all comments" ON "public"."comments" FOR SELECT USING (true);



CREATE POLICY "Users can update their own comments" ON "public"."comments" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Widgets policy" ON "public"."widgets" TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."api_health" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cfgi_data" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comment_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."custom_news" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dashboard_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exchangeLiqMapCache" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "general policy" ON "public"."custom_news" USING (true) WITH CHECK (true);



ALTER TABLE "public"."layouts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "like_count_func_role can update news" ON "public"."news" FOR UPDATE TO "authenticated" USING (("current_setting"('my.role'::"text") = 'like_count_func_role'::"text")) WITH CHECK (("current_setting"('my.role'::"text") = 'like_count_func_role'::"text"));



ALTER TABLE "public"."news" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."news_bookmarks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."news_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."public_user_data" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sentiment" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."smart_signals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tabs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."widgets" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notifications";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



































































































































































































GRANT ALL ON FUNCTION "public"."decrement_news_comments"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_news_comments"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_news_comments"() TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_news_likes"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_news_likes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_news_likes"() TO "service_role";



GRANT ALL ON TABLE "public"."smart_signals" TO "anon";
GRANT ALL ON TABLE "public"."smart_signals" TO "authenticated";
GRANT ALL ON TABLE "public"."smart_signals" TO "service_role";



GRANT ALL ON FUNCTION "public"."fire_and_get_smart_signal"("p_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."fire_and_get_smart_signal"("p_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."fire_and_get_smart_signal"("p_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_news_comments"() TO "anon";
GRANT ALL ON FUNCTION "public"."increment_news_comments"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_news_comments"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_news_likes"() TO "anon";
GRANT ALL ON FUNCTION "public"."increment_news_likes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_news_likes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_public_user_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."insert_public_user_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_public_user_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_notification_as_read"("notification_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_notification_as_read"("notification_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_notification_as_read"("notification_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";





















GRANT ALL ON TABLE "public"."api_health" TO "anon";
GRANT ALL ON TABLE "public"."api_health" TO "authenticated";
GRANT ALL ON TABLE "public"."api_health" TO "service_role";



GRANT ALL ON SEQUENCE "public"."api_health_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."api_health_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."api_health_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."campaign_kols" TO "anon";
GRANT ALL ON TABLE "public"."campaign_kols" TO "authenticated";
GRANT ALL ON TABLE "public"."campaign_kols" TO "service_role";



GRANT ALL ON TABLE "public"."campaigns" TO "anon";
GRANT ALL ON TABLE "public"."campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."campaigns" TO "service_role";



GRANT ALL ON SEQUENCE "public"."campaigns_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."campaigns_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."campaigns_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cfgi_data" TO "anon";
GRANT ALL ON TABLE "public"."cfgi_data" TO "authenticated";
GRANT ALL ON TABLE "public"."cfgi_data" TO "service_role";



GRANT ALL ON TABLE "public"."comment_likes" TO "anon";
GRANT ALL ON TABLE "public"."comment_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."comment_likes" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."comments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."comments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."comments_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."comments_id_seq1" TO "anon";
GRANT ALL ON SEQUENCE "public"."comments_id_seq1" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."comments_id_seq1" TO "service_role";



GRANT ALL ON TABLE "public"."custom_news" TO "anon";
GRANT ALL ON TABLE "public"."custom_news" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_news" TO "service_role";



GRANT ALL ON TABLE "public"."dashboard_settings" TO "anon";
GRANT ALL ON TABLE "public"."dashboard_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."dashboard_settings" TO "service_role";



GRANT ALL ON TABLE "public"."exchangeLiqMapCache" TO "anon";
GRANT ALL ON TABLE "public"."exchangeLiqMapCache" TO "authenticated";
GRANT ALL ON TABLE "public"."exchangeLiqMapCache" TO "service_role";



GRANT ALL ON TABLE "public"."firable_smart_signals" TO "anon";
GRANT ALL ON TABLE "public"."firable_smart_signals" TO "authenticated";
GRANT ALL ON TABLE "public"."firable_smart_signals" TO "service_role";



GRANT ALL ON TABLE "public"."intake_forms" TO "anon";
GRANT ALL ON TABLE "public"."intake_forms" TO "authenticated";
GRANT ALL ON TABLE "public"."intake_forms" TO "service_role";



GRANT ALL ON SEQUENCE "public"."intake_forms_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."intake_forms_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."intake_forms_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."kol_platforms" TO "anon";
GRANT ALL ON TABLE "public"."kol_platforms" TO "authenticated";
GRANT ALL ON TABLE "public"."kol_platforms" TO "service_role";



GRANT ALL ON SEQUENCE "public"."kol_platforms_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."kol_platforms_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."kol_platforms_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."kol_requests" TO "anon";
GRANT ALL ON TABLE "public"."kol_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."kol_requests" TO "service_role";



GRANT ALL ON SEQUENCE "public"."kol_requests_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."kol_requests_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."kol_requests_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."kols" TO "anon";
GRANT ALL ON TABLE "public"."kols" TO "authenticated";
GRANT ALL ON TABLE "public"."kols" TO "service_role";



GRANT ALL ON SEQUENCE "public"."kols_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."kols_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."kols_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."layouts" TO "anon";
GRANT ALL ON TABLE "public"."layouts" TO "authenticated";
GRANT ALL ON TABLE "public"."layouts" TO "service_role";



GRANT ALL ON TABLE "public"."news" TO "anon";
GRANT ALL ON TABLE "public"."news" TO "authenticated";
GRANT ALL ON TABLE "public"."news" TO "service_role";



GRANT ALL ON TABLE "public"."news_bookmarks" TO "anon";
GRANT ALL ON TABLE "public"."news_bookmarks" TO "authenticated";
GRANT ALL ON TABLE "public"."news_bookmarks" TO "service_role";



GRANT ALL ON SEQUENCE "public"."news_bookmarks_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."news_bookmarks_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."news_bookmarks_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."news_likes" TO "anon";
GRANT ALL ON TABLE "public"."news_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."news_likes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."news_likes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."news_likes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."news_likes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."project_members" TO "anon";
GRANT ALL ON TABLE "public"."project_members" TO "authenticated";
GRANT ALL ON TABLE "public"."project_members" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."projects_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."public_user_data" TO "anon";
GRANT ALL ON TABLE "public"."public_user_data" TO "authenticated";
GRANT ALL ON TABLE "public"."public_user_data" TO "service_role";



GRANT ALL ON TABLE "public"."sentiment" TO "anon";
GRANT ALL ON TABLE "public"."sentiment" TO "authenticated";
GRANT ALL ON TABLE "public"."sentiment" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sentiment_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sentiment_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sentiment_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."signals_users" TO "anon";
GRANT ALL ON TABLE "public"."signals_users" TO "authenticated";
GRANT ALL ON TABLE "public"."signals_users" TO "service_role";



GRANT ALL ON SEQUENCE "public"."smart_signals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."smart_signals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."smart_signals_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."subscriptions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."subscriptions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."subscriptions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tabs" TO "anon";
GRANT ALL ON TABLE "public"."tabs" TO "authenticated";
GRANT ALL ON TABLE "public"."tabs" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."widgets" TO "anon";
GRANT ALL ON TABLE "public"."widgets" TO "authenticated";
GRANT ALL ON TABLE "public"."widgets" TO "service_role";



GRANT ALL ON TABLE "public"."youtube_streaming_topics" TO "anon";
GRANT ALL ON TABLE "public"."youtube_streaming_topics" TO "authenticated";
GRANT ALL ON TABLE "public"."youtube_streaming_topics" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
