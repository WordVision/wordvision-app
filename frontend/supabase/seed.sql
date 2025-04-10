SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

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

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '8b844c76-3db4-49b8-9e50-7acc960d04f6', '{"action":"user_confirmation_requested","actor_id":"eb71e378-e5f1-419f-b7f3-5ea37bf7586b","actor_username":"johnpierremendoza@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-04-03 14:05:43.402675+00', ''),
	('00000000-0000-0000-0000-000000000000', '9cdd598a-db7d-4df6-9437-2dbe03efca3b', '{"action":"user_signedup","actor_id":"eb71e378-e5f1-419f-b7f3-5ea37bf7586b","actor_username":"johnpierremendoza@gmail.com","actor_via_sso":false,"log_type":"team"}', '2025-04-03 14:07:53.785832+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dfc3f821-7626-4f61-8183-1201f32062bc', '{"action":"login","actor_id":"eb71e378-e5f1-419f-b7f3-5ea37bf7586b","actor_username":"johnpierremendoza@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-03 14:08:00.019694+00', ''),
	('00000000-0000-0000-0000-000000000000', '93050a8c-c104-4f6c-b8e0-a67aa9b4e2ed', '{"action":"logout","actor_id":"eb71e378-e5f1-419f-b7f3-5ea37bf7586b","actor_username":"johnpierremendoza@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-04-03 14:24:20.366046+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e86c3a82-5ab8-4c26-bdfe-10fcad757c68', '{"action":"login","actor_id":"eb71e378-e5f1-419f-b7f3-5ea37bf7586b","actor_username":"johnpierremendoza@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-04-03 14:25:59.400666+00', ''),
	('00000000-0000-0000-0000-000000000000', '6c0dfa7a-667a-402d-a83d-65c3fbba5df9', '{"action":"token_refreshed","actor_id":"eb71e378-e5f1-419f-b7f3-5ea37bf7586b","actor_username":"johnpierremendoza@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-03 15:24:12.161939+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a65b865e-0b99-4eae-bd31-f7ccba2588b7', '{"action":"token_revoked","actor_id":"eb71e378-e5f1-419f-b7f3-5ea37bf7586b","actor_username":"johnpierremendoza@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-03 15:24:12.163737+00', ''),
	('00000000-0000-0000-0000-000000000000', '3651ffc8-6549-465d-9bac-77f8821a9c2c', '{"action":"token_refreshed","actor_id":"eb71e378-e5f1-419f-b7f3-5ea37bf7586b","actor_username":"johnpierremendoza@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-03 16:22:42.23522+00', ''),
	('00000000-0000-0000-0000-000000000000', '879eefcc-2bd1-4010-962d-1dd15e3278f4', '{"action":"token_revoked","actor_id":"eb71e378-e5f1-419f-b7f3-5ea37bf7586b","actor_username":"johnpierremendoza@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-04-03 16:22:42.236031+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'eb71e378-e5f1-419f-b7f3-5ea37bf7586b', 'authenticated', 'authenticated', 'johnpierremendoza@gmail.com', '$2a$10$DKBlnCBZ3whL0r.zCWWl8.qD0pJ5PalzfWxN8uYVOrZ12qRQzJEC.', '2025-04-03 14:07:53.786685+00', NULL, '', '2025-04-03 14:05:43.4116+00', '', NULL, '', '', NULL, '2025-04-03 14:25:59.40397+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "eb71e378-e5f1-419f-b7f3-5ea37bf7586b", "email": "johnpierremendoza@gmail.com", "birthdate": "2002-09-06T14:04:00.000Z", "last_name": "Mendoza", "first_name": "John Pierre", "email_verified": true, "phone_verified": false}', NULL, '2025-04-03 14:05:43.362986+00', '2025-04-03 16:22:42.238806+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('eb71e378-e5f1-419f-b7f3-5ea37bf7586b', 'eb71e378-e5f1-419f-b7f3-5ea37bf7586b', '{"sub": "eb71e378-e5f1-419f-b7f3-5ea37bf7586b", "email": "johnpierremendoza@gmail.com", "birthdate": "2002-09-06T14:04:00.000Z", "last_name": "Mendoza", "first_name": "John Pierre", "email_verified": true, "phone_verified": false}', 'email', '2025-04-03 14:05:43.393457+00', '2025-04-03 14:05:43.393505+00', '2025-04-03 14:05:43.393505+00', '5d7ceaef-c6c8-404a-a885-c42d7c88b307');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('b9daf237-3d1b-4a4a-bb41-dae08a517b23', 'eb71e378-e5f1-419f-b7f3-5ea37bf7586b', '2025-04-03 14:25:59.404043+00', '2025-04-03 16:22:42.240934+00', NULL, 'aal1', NULL, '2025-04-03 16:22:42.240864', 'okhttp/4.9.2', '99.240.76.69', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('b9daf237-3d1b-4a4a-bb41-dae08a517b23', '2025-04-03 14:25:59.407435+00', '2025-04-03 14:25:59.407435+00', 'password', '2e534b21-500a-493b-b65b-00bb37185246');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 3, 'c88XofFFZ33-xEKFNY9C6Q', 'eb71e378-e5f1-419f-b7f3-5ea37bf7586b', true, '2025-04-03 14:25:59.405058+00', '2025-04-03 15:24:12.164774+00', NULL, 'b9daf237-3d1b-4a4a-bb41-dae08a517b23'),
	('00000000-0000-0000-0000-000000000000', 4, '_Juk9Tz1F3iiXii4ppXBbw', 'eb71e378-e5f1-419f-b7f3-5ea37bf7586b', true, '2025-04-03 15:24:12.168556+00', '2025-04-03 16:22:42.236529+00', 'c88XofFFZ33-xEKFNY9C6Q', 'b9daf237-3d1b-4a4a-bb41-dae08a517b23'),
	('00000000-0000-0000-0000-000000000000', 5, 'a6hi_bUjDw5pc-GvjK0eJw', 'eb71e378-e5f1-419f-b7f3-5ea37bf7586b', false, '2025-04-03 16:22:42.237799+00', '2025-04-03 16:22:42.237799+00', '_Juk9Tz1F3iiXii4ppXBbw', 'b9daf237-3d1b-4a4a-bb41-dae08a517b23');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: key; Type: TABLE DATA; Schema: pgsodium; Owner: supabase_admin
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id") VALUES
	('books', 'books', NULL, '2025-04-03 13:58:29.547438+00', '2025-04-03 13:58:29.547438+00', false, false, NULL, NULL, NULL),
	('images', 'images', NULL, '2025-04-03 13:58:37.518698+00', '2025-04-03 13:58:37.518698+00', true, false, NULL, NULL, NULL);


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") VALUES
	('0f086a1a-9264-419a-9613-7cec47357df2', 'books', 'metamorphosis.epub', NULL, '2025-04-03 14:01:20.286307+00', '2025-04-03 14:01:20.286307+00', '2025-04-03 14:01:20.286307+00', '{"eTag": "\"49cced88577bb6a9649c30a4e949df09-1\"", "size": 122048, "mimetype": "application/epub+zip", "cacheControl": "max-age=3600", "lastModified": "2025-04-03T14:01:20.000Z", "contentLength": 122048, "httpStatusCode": 200}', '377915df-fa08-47f4-8d7d-96de15f68051', NULL, NULL),
	('9923ae7f-97b8-4735-93ae-3904c5be2985', 'images', 'book_covers/a_tale_of_two_cities.jpg', NULL, '2025-04-03 14:23:37.137814+00', '2025-04-03 14:23:56.863255+00', '2025-04-03 14:23:37.137814+00', '{"eTag": "\"34d754e58e24817cc92e7745f7dafda6\"", "size": 164119, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-03T14:23:57.000Z", "contentLength": 164119, "httpStatusCode": 200}', '073c22fa-0ed7-459f-b330-7fce311d6e19', NULL, NULL),
	('a2f1dcb8-d7c9-4c24-8fd2-adeb749cba8c', 'images', 'book_covers/metamorphosis.png', NULL, '2025-04-03 14:25:06.255972+00', '2025-04-03 14:25:22.009293+00', '2025-04-03 14:25:06.255972+00', '{"eTag": "\"843f9ec181b56090e0e57ccbccffe342\"", "size": 60920, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-04-03T14:25:22.000Z", "contentLength": 60920, "httpStatusCode": 200}', '0079c4c7-d388-4cf5-846a-84ae63c3a87d', NULL, NULL),
	('1e8c29dc-1b83-45cf-ab4c-ecd16e572831', 'books', 'a_tale_of_two_cities.epub', NULL, '2025-04-03 14:01:23.079229+00', '2025-04-03 14:29:01.732144+00', '2025-04-03 14:01:23.079229+00', '{"eTag": "\"7a43f07f6d0ebf3843889304ac07a305\"", "size": 7725229, "mimetype": "application/epub+zip", "cacheControl": "max-age=3600", "lastModified": "2025-04-03T14:29:01.000Z", "contentLength": 7725229, "httpStatusCode": 200}', '9276395c-5c71-49b2-af98-5c44c3b24d07', NULL, NULL),
	('c5823555-593c-4379-b921-f2bf0e7b2007', 'images', '840f188c-2296-4aec-827e-9a6444536a48.jpg', 'eb71e378-e5f1-419f-b7f3-5ea37bf7586b', '2025-04-03 14:30:04.928115+00', '2025-04-03 14:30:04.928115+00', '2025-04-03 14:30:04.928115+00', '{"eTag": "\"8c8cac75b87ebf4ecda95fd018fdbbce\"", "size": 153442, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-04-03T14:30:05.000Z", "contentLength": 153442, "httpStatusCode": 200}', '04a3d3e3-bd45-47e7-a7b1-ec9cc06596f6', 'eb71e378-e5f1-419f-b7f3-5ea37bf7586b', '{}');


--
-- Data for Name: books; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."books" ("id", "title", "author", "filename", "img_url") VALUES
	('1e8c29dc-1b83-45cf-ab4c-ecd16e572831', 'A Tale of Two Cities', 'Charles Dickens', 'a_tale_of_two_cities.epub', 'https://szlxwnautzzqyrsnlenr.supabase.co/storage/v1/object/public/images/book_covers/a_tale_of_two_cities.jpg'),
	('0f086a1a-9264-419a-9613-7cec47357df2', 'Metamorphosis', 'Franz Kafka', 'metamorphosis.epub', 'https://szlxwnautzzqyrsnlenr.supabase.co/storage/v1/object/public/images/book_covers/metamorphosis.png');


--
-- Data for Name: highlights; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."highlights" ("id", "user_id", "book_id", "text", "location", "img_url", "img_prompt") VALUES
	(1, 'eb71e378-e5f1-419f-b7f3-5ea37bf7586b', '1e8c29dc-1b83-45cf-ab4c-ecd16e572831', 'A large cask of wine had been dropped and broken, in the street. The
      accident had happened in getting it out of a cart; the cask had tumbled
      out with a run, the hoops had burst, and it lay on the stones just outside
      the door of the wine-shop, shattered like a walnut-shell.', 'epubcfi(/6/14!/4/2[pgepubid00008]/4,/2/1:0,/1:290)', 'https://szlxwnautzzqyrsnlenr.supabase.co/storage/v1/object/public/images/840f188c-2296-4aec-827e-9a6444536a48.jpg', 'A large cask of wine had been dropped and broken, in the street. The
      accident had happened in getting it out of a cart; the cask had tumbled
      out with a run, the hoops had burst, and it lay on the stones just outside
      the door of the wine-shop, shattered like a walnut-shell.');


--
-- Data for Name: user_books; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_books" ("user_id", "book_id", "created_at") VALUES
	('eb71e378-e5f1-419f-b7f3-5ea37bf7586b', '1e8c29dc-1b83-45cf-ab4c-ecd16e572831', '2025-04-03 14:27:41.245005+00');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 5, true);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: supabase_admin
--

SELECT pg_catalog.setval('"pgsodium"."key_key_id_seq"', 1, false);


--
-- Name: highlights_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."highlights_id_seq"', 1, true);


--
-- PostgreSQL database dump complete
--

RESET ALL;
