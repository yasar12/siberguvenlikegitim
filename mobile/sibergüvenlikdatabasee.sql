PGDMP                         }            postgres    14.17    14.17 y    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    13754    postgres    DATABASE     W   CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'en-US';
    DROP DATABASE postgres;
                postgres    false            �           0    0    DATABASE postgres    COMMENT     N   COMMENT ON DATABASE postgres IS 'default administrative connection database';
                   postgres    false    3489                        2615    19468    public    SCHEMA        CREATE SCHEMA public;
    DROP SCHEMA public;
                postgres    false            �           0    0    SCHEMA public    ACL     &   GRANT ALL ON SCHEMA public TO PUBLIC;
                   postgres    false    4            N           1247    21592    enum_activities_type    TYPE     �   CREATE TYPE public.enum_activities_type AS ENUM (
    'login',
    'course_start',
    'course_complete',
    'lesson_start',
    'lesson_complete',
    'quiz_take',
    'quiz_complete'
);
 '   DROP TYPE public.enum_activities_type;
       public          postgres    false    4            �            1255    21963    update_contents_updated_at()    FUNCTION     �   CREATE FUNCTION public.update_contents_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;
 3   DROP FUNCTION public.update_contents_updated_at();
       public          postgres    false    4            �            1255    21919    update_updated_at_column()    FUNCTION     �   CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;
 1   DROP FUNCTION public.update_updated_at_column();
       public          postgres    false    4            �            1259    21885    badges    TABLE     �   CREATE TABLE public.badges (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text NOT NULL,
    image_url character varying(255) NOT NULL,
    criteria text NOT NULL
);
    DROP TABLE public.badges;
       public         heap    postgres    false    4            �            1259    21884    badges_id_seq    SEQUENCE     �   CREATE SEQUENCE public.badges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.badges_id_seq;
       public          postgres    false    4    227            �           0    0    badges_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.badges_id_seq OWNED BY public.badges.id;
          public          postgres    false    226            �            1259    21839    certificates    TABLE       CREATE TABLE public.certificates (
    id integer NOT NULL,
    user_id integer,
    pathway_id integer,
    issue_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    certificate_url character varying(255),
    certificate_number character varying(50) NOT NULL
);
     DROP TABLE public.certificates;
       public         heap    postgres    false    4            �            1259    21838    certificates_id_seq    SEQUENCE     �   CREATE SEQUENCE public.certificates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.certificates_id_seq;
       public          postgres    false    223    4            �           0    0    certificates_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.certificates_id_seq OWNED BY public.certificates.id;
          public          postgres    false    222            �            1259    21944    contents    TABLE     Q  CREATE TABLE public.contents (
    id integer NOT NULL,
    lesson_id integer NOT NULL,
    content_text text NOT NULL,
    order_number integer DEFAULT 1 NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.contents;
       public         heap    postgres    false    4            �            1259    21943    contents_id_seq    SEQUENCE     �   CREATE SEQUENCE public.contents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.contents_id_seq;
       public          postgres    false    231    4            �           0    0    contents_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.contents_id_seq OWNED BY public.contents.id;
          public          postgres    false    230            �            1259    21778    lessons    TABLE     �  CREATE TABLE public.lessons (
    id integer NOT NULL,
    module_id integer,
    title character varying(100) NOT NULL,
    content text NOT NULL,
    video_url character varying(255),
    duration_minutes integer NOT NULL,
    order_number integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.lessons;
       public         heap    postgres    false    4            �            1259    21777    lessons_id_seq    SEQUENCE     �   CREATE SEQUENCE public.lessons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.lessons_id_seq;
       public          postgres    false    4    217            �           0    0    lessons_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.lessons_id_seq OWNED BY public.lessons.id;
          public          postgres    false    216            �            1259    21762    modules    TABLE     i  CREATE TABLE public.modules (
    id integer NOT NULL,
    pathway_id integer,
    title character varying(100) NOT NULL,
    description text NOT NULL,
    order_number integer NOT NULL,
    duration_hours integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.modules;
       public         heap    postgres    false    4            �            1259    21761    modules_id_seq    SEQUENCE     �   CREATE SEQUENCE public.modules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.modules_id_seq;
       public          postgres    false    4    215            �           0    0    modules_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.modules_id_seq OWNED BY public.modules.id;
          public          postgres    false    214            �            1259    21749    pathways    TABLE     P  CREATE TABLE public.pathways (
    id integer NOT NULL,
    title character varying(100) NOT NULL,
    description text NOT NULL,
    level character varying(20),
    duration_weeks integer NOT NULL,
    image_url character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true,
    CONSTRAINT pathways_level_check CHECK (((level)::text = ANY ((ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying])::text[])))
);
    DROP TABLE public.pathways;
       public         heap    postgres    false    4            �            1259    21748    pathways_id_seq    SEQUENCE     �   CREATE SEQUENCE public.pathways_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.pathways_id_seq;
       public          postgres    false    4    213            �           0    0    pathways_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.pathways_id_seq OWNED BY public.pathways.id;
          public          postgres    false    212            �            1259    21861    reviews    TABLE     a  CREATE TABLE public.reviews (
    id integer NOT NULL,
    user_id integer,
    pathway_id integer,
    rating integer,
    comment text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);
    DROP TABLE public.reviews;
       public         heap    postgres    false    4            �            1259    21860    reviews_id_seq    SEQUENCE     �   CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.reviews_id_seq;
       public          postgres    false    225    4            �           0    0    reviews_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;
          public          postgres    false    224            �            1259    21894    user_badges    TABLE     �   CREATE TABLE public.user_badges (
    id integer NOT NULL,
    user_id integer,
    badge_id integer,
    earned_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.user_badges;
       public         heap    postgres    false    4            �            1259    21893    user_badges_id_seq    SEQUENCE     �   CREATE SEQUENCE public.user_badges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.user_badges_id_seq;
       public          postgres    false    229    4            �           0    0    user_badges_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.user_badges_id_seq OWNED BY public.user_badges.id;
          public          postgres    false    228            �            1259    21817    user_lessons    TABLE     �  CREATE TABLE public.user_lessons (
    id integer NOT NULL,
    user_id integer,
    lesson_id integer,
    completion_date timestamp with time zone,
    status character varying(20) DEFAULT 'not_started'::character varying,
    last_watched_position integer DEFAULT 0,
    CONSTRAINT user_lessons_status_check CHECK (((status)::text = ANY ((ARRAY['not_started'::character varying, 'in_progress'::character varying, 'completed'::character varying])::text[])))
);
     DROP TABLE public.user_lessons;
       public         heap    postgres    false    4            �            1259    21816    user_lessons_id_seq    SEQUENCE     �   CREATE SEQUENCE public.user_lessons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.user_lessons_id_seq;
       public          postgres    false    221    4            �           0    0    user_lessons_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.user_lessons_id_seq OWNED BY public.user_lessons.id;
          public          postgres    false    220            �            1259    21794    user_pathways    TABLE     9  CREATE TABLE public.user_pathways (
    id integer NOT NULL,
    user_id integer,
    pathway_id integer,
    start_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    completion_date timestamp with time zone,
    progress_percentage numeric(5,2) DEFAULT 0.00,
    status character varying(20) DEFAULT 'in_progress'::character varying,
    CONSTRAINT user_pathways_status_check CHECK (((status)::text = ANY ((ARRAY['not_started'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'dropped'::character varying])::text[])))
);
 !   DROP TABLE public.user_pathways;
       public         heap    postgres    false    4            �            1259    21793    user_pathways_id_seq    SEQUENCE     �   CREATE SEQUENCE public.user_pathways_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.user_pathways_id_seq;
       public          postgres    false    219    4            �           0    0    user_pathways_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.user_pathways_id_seq OWNED BY public.user_pathways.id;
          public          postgres    false    218            �            1259    21733    users    TABLE     �  CREATE TABLE public.users (
    id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    profile_image character varying(255),
    bio text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp with time zone,
    is_active boolean DEFAULT true,
    role character varying(20) DEFAULT 'user'::character varying,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'instructor'::character varying, 'admin'::character varying])::text[])))
);
    DROP TABLE public.users;
       public         heap    postgres    false    4            �            1259    21732    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          postgres    false    4    211            �           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public          postgres    false    210            �           2604    21888 	   badges id    DEFAULT     f   ALTER TABLE ONLY public.badges ALTER COLUMN id SET DEFAULT nextval('public.badges_id_seq'::regclass);
 8   ALTER TABLE public.badges ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    227    226    227            �           2604    21842    certificates id    DEFAULT     r   ALTER TABLE ONLY public.certificates ALTER COLUMN id SET DEFAULT nextval('public.certificates_id_seq'::regclass);
 >   ALTER TABLE public.certificates ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    222    223    223            �           2604    21947    contents id    DEFAULT     j   ALTER TABLE ONLY public.contents ALTER COLUMN id SET DEFAULT nextval('public.contents_id_seq'::regclass);
 :   ALTER TABLE public.contents ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    230    231    231            �           2604    21781 
   lessons id    DEFAULT     h   ALTER TABLE ONLY public.lessons ALTER COLUMN id SET DEFAULT nextval('public.lessons_id_seq'::regclass);
 9   ALTER TABLE public.lessons ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    216    217    217            �           2604    21765 
   modules id    DEFAULT     h   ALTER TABLE ONLY public.modules ALTER COLUMN id SET DEFAULT nextval('public.modules_id_seq'::regclass);
 9   ALTER TABLE public.modules ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    214    215    215            �           2604    21752    pathways id    DEFAULT     j   ALTER TABLE ONLY public.pathways ALTER COLUMN id SET DEFAULT nextval('public.pathways_id_seq'::regclass);
 :   ALTER TABLE public.pathways ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    213    212    213            �           2604    21864 
   reviews id    DEFAULT     h   ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);
 9   ALTER TABLE public.reviews ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    225    224    225            �           2604    21897    user_badges id    DEFAULT     p   ALTER TABLE ONLY public.user_badges ALTER COLUMN id SET DEFAULT nextval('public.user_badges_id_seq'::regclass);
 =   ALTER TABLE public.user_badges ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    229    228    229            �           2604    21820    user_lessons id    DEFAULT     r   ALTER TABLE ONLY public.user_lessons ALTER COLUMN id SET DEFAULT nextval('public.user_lessons_id_seq'::regclass);
 >   ALTER TABLE public.user_lessons ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    220    221    221            �           2604    21797    user_pathways id    DEFAULT     t   ALTER TABLE ONLY public.user_pathways ALTER COLUMN id SET DEFAULT nextval('public.user_pathways_id_seq'::regclass);
 ?   ALTER TABLE public.user_pathways ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    219    218    219            �           2604    21736    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    210    211    211            �          0    21885    badges 
   TABLE DATA           L   COPY public.badges (id, name, description, image_url, criteria) FROM stdin;
    public          postgres    false    227   ؙ       �          0    21839    certificates 
   TABLE DATA           p   COPY public.certificates (id, user_id, pathway_id, issue_date, certificate_url, certificate_number) FROM stdin;
    public          postgres    false    223   �       �          0    21944    contents 
   TABLE DATA           p   COPY public.contents (id, lesson_id, content_text, order_number, is_active, created_at, updated_at) FROM stdin;
    public          postgres    false    231   4�       �          0    21778    lessons 
   TABLE DATA           �   COPY public.lessons (id, module_id, title, content, video_url, duration_minutes, order_number, created_at, updated_at) FROM stdin;
    public          postgres    false    217   �       �          0    21762    modules 
   TABLE DATA           {   COPY public.modules (id, pathway_id, title, description, order_number, duration_hours, created_at, updated_at) FROM stdin;
    public          postgres    false    215   ٢       �          0    21749    pathways 
   TABLE DATA              COPY public.pathways (id, title, description, level, duration_weeks, image_url, created_at, updated_at, is_active) FROM stdin;
    public          postgres    false    213   �       �          0    21861    reviews 
   TABLE DATA           c   COPY public.reviews (id, user_id, pathway_id, rating, comment, created_at, updated_at) FROM stdin;
    public          postgres    false    225   ަ       �          0    21894    user_badges 
   TABLE DATA           I   COPY public.user_badges (id, user_id, badge_id, earned_date) FROM stdin;
    public          postgres    false    229   ��       �          0    21817    user_lessons 
   TABLE DATA           n   COPY public.user_lessons (id, user_id, lesson_id, completion_date, status, last_watched_position) FROM stdin;
    public          postgres    false    221   n�       �          0    21794    user_pathways 
   TABLE DATA           z   COPY public.user_pathways (id, user_id, pathway_id, start_date, completion_date, progress_percentage, status) FROM stdin;
    public          postgres    false    219   �       �          0    21733    users 
   TABLE DATA           �   COPY public.users (id, full_name, email, password_hash, profile_image, bio, created_at, updated_at, last_login, is_active, role) FROM stdin;
    public          postgres    false    211   V�       �           0    0    badges_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.badges_id_seq', 5, true);
          public          postgres    false    226            �           0    0    certificates_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.certificates_id_seq', 3, true);
          public          postgres    false    222            �           0    0    contents_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.contents_id_seq', 19, true);
          public          postgres    false    230            �           0    0    lessons_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.lessons_id_seq', 28, true);
          public          postgres    false    216            �           0    0    modules_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.modules_id_seq', 85, true);
          public          postgres    false    214            �           0    0    pathways_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.pathways_id_seq', 61, true);
          public          postgres    false    212            �           0    0    reviews_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.reviews_id_seq', 5, true);
          public          postgres    false    224            �           0    0    user_badges_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.user_badges_id_seq', 16, true);
          public          postgres    false    228            �           0    0    user_lessons_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.user_lessons_id_seq', 43, true);
          public          postgres    false    220            �           0    0    user_pathways_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.user_pathways_id_seq', 27, true);
          public          postgres    false    218            �           0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 5, true);
          public          postgres    false    210            �           2606    21892    badges badges_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.badges DROP CONSTRAINT badges_pkey;
       public            postgres    false    227            �           2606    21847 0   certificates certificates_certificate_number_key 
   CONSTRAINT     y   ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_certificate_number_key UNIQUE (certificate_number);
 Z   ALTER TABLE ONLY public.certificates DROP CONSTRAINT certificates_certificate_number_key;
       public            postgres    false    223            �           2606    21845    certificates certificates_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.certificates DROP CONSTRAINT certificates_pkey;
       public            postgres    false    223            �           2606    21849 0   certificates certificates_user_id_pathway_id_key 
   CONSTRAINT     z   ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_user_id_pathway_id_key UNIQUE (user_id, pathway_id);
 Z   ALTER TABLE ONLY public.certificates DROP CONSTRAINT certificates_user_id_pathway_id_key;
       public            postgres    false    223    223            �           2606    21955    contents contents_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.contents
    ADD CONSTRAINT contents_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.contents DROP CONSTRAINT contents_pkey;
       public            postgres    false    231            �           2606    21787    lessons lessons_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.lessons DROP CONSTRAINT lessons_pkey;
       public            postgres    false    217            �           2606    21771    modules modules_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.modules DROP CONSTRAINT modules_pkey;
       public            postgres    false    215            �           2606    21760    pathways pathways_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.pathways
    ADD CONSTRAINT pathways_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.pathways DROP CONSTRAINT pathways_pkey;
       public            postgres    false    213            �           2606    21871    reviews reviews_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_pkey;
       public            postgres    false    225            �           2606    21873 &   reviews reviews_user_id_pathway_id_key 
   CONSTRAINT     p   ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_pathway_id_key UNIQUE (user_id, pathway_id);
 P   ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_user_id_pathway_id_key;
       public            postgres    false    225    225            �           2606    21900    user_badges user_badges_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.user_badges DROP CONSTRAINT user_badges_pkey;
       public            postgres    false    229            �           2606    21902 ,   user_badges user_badges_user_id_badge_id_key 
   CONSTRAINT     t   ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_badge_id_key UNIQUE (user_id, badge_id);
 V   ALTER TABLE ONLY public.user_badges DROP CONSTRAINT user_badges_user_id_badge_id_key;
       public            postgres    false    229    229            �           2606    21825    user_lessons user_lessons_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.user_lessons
    ADD CONSTRAINT user_lessons_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.user_lessons DROP CONSTRAINT user_lessons_pkey;
       public            postgres    false    221            �           2606    21827 /   user_lessons user_lessons_user_id_lesson_id_key 
   CONSTRAINT     x   ALTER TABLE ONLY public.user_lessons
    ADD CONSTRAINT user_lessons_user_id_lesson_id_key UNIQUE (user_id, lesson_id);
 Y   ALTER TABLE ONLY public.user_lessons DROP CONSTRAINT user_lessons_user_id_lesson_id_key;
       public            postgres    false    221    221            �           2606    21803     user_pathways user_pathways_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.user_pathways
    ADD CONSTRAINT user_pathways_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.user_pathways DROP CONSTRAINT user_pathways_pkey;
       public            postgres    false    219            �           2606    21805 2   user_pathways user_pathways_user_id_pathway_id_key 
   CONSTRAINT     |   ALTER TABLE ONLY public.user_pathways
    ADD CONSTRAINT user_pathways_user_id_pathway_id_key UNIQUE (user_id, pathway_id);
 \   ALTER TABLE ONLY public.user_pathways DROP CONSTRAINT user_pathways_user_id_pathway_id_key;
       public            postgres    false    219    219            �           2606    21747    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public            postgres    false    211            �           2606    21745    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    211            �           1259    21961    idx_contents_lesson_id    INDEX     P   CREATE INDEX idx_contents_lesson_id ON public.contents USING btree (lesson_id);
 *   DROP INDEX public.idx_contents_lesson_id;
       public            postgres    false    231            �           1259    21962    idx_contents_order_number    INDEX     V   CREATE INDEX idx_contents_order_number ON public.contents USING btree (order_number);
 -   DROP INDEX public.idx_contents_order_number;
       public            postgres    false    231            �           1259    21916    idx_lesson_module    INDEX     J   CREATE INDEX idx_lesson_module ON public.lessons USING btree (module_id);
 %   DROP INDEX public.idx_lesson_module;
       public            postgres    false    217            �           1259    21915    idx_module_pathway    INDEX     L   CREATE INDEX idx_module_pathway ON public.modules USING btree (pathway_id);
 &   DROP INDEX public.idx_module_pathway;
       public            postgres    false    215            �           1259    21914    idx_pathway_level    INDEX     G   CREATE INDEX idx_pathway_level ON public.pathways USING btree (level);
 %   DROP INDEX public.idx_pathway_level;
       public            postgres    false    213            �           1259    21913    idx_user_email    INDEX     A   CREATE INDEX idx_user_email ON public.users USING btree (email);
 "   DROP INDEX public.idx_user_email;
       public            postgres    false    211            �           1259    21918    idx_user_lesson_status    INDEX     e   CREATE INDEX idx_user_lesson_status ON public.user_lessons USING btree (user_id, lesson_id, status);
 *   DROP INDEX public.idx_user_lesson_status;
       public            postgres    false    221    221    221            �           1259    21917    idx_user_pathway_status    INDEX     h   CREATE INDEX idx_user_pathway_status ON public.user_pathways USING btree (user_id, pathway_id, status);
 +   DROP INDEX public.idx_user_pathway_status;
       public            postgres    false    219    219    219            �           2620    21964 #   contents update_contents_updated_at    TRIGGER     �   CREATE TRIGGER update_contents_updated_at BEFORE UPDATE ON public.contents FOR EACH ROW EXECUTE FUNCTION public.update_contents_updated_at();
 <   DROP TRIGGER update_contents_updated_at ON public.contents;
       public          postgres    false    233    231            �           2620    21923 !   lessons update_lessons_updated_at    TRIGGER     �   CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 :   DROP TRIGGER update_lessons_updated_at ON public.lessons;
       public          postgres    false    232    217            �           2620    21922 !   modules update_modules_updated_at    TRIGGER     �   CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 :   DROP TRIGGER update_modules_updated_at ON public.modules;
       public          postgres    false    215    232            �           2620    21921 #   pathways update_pathways_updated_at    TRIGGER     �   CREATE TRIGGER update_pathways_updated_at BEFORE UPDATE ON public.pathways FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 <   DROP TRIGGER update_pathways_updated_at ON public.pathways;
       public          postgres    false    232    213            �           2620    21924 !   reviews update_reviews_updated_at    TRIGGER     �   CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 :   DROP TRIGGER update_reviews_updated_at ON public.reviews;
       public          postgres    false    225    232            �           2620    21920    users update_users_updated_at    TRIGGER     �   CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
 6   DROP TRIGGER update_users_updated_at ON public.users;
       public          postgres    false    232    211            �           2606    21855 )   certificates certificates_pathway_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pathway_id_fkey FOREIGN KEY (pathway_id) REFERENCES public.pathways(id) ON DELETE CASCADE;
 S   ALTER TABLE ONLY public.certificates DROP CONSTRAINT certificates_pathway_id_fkey;
       public          postgres    false    213    223    3267            �           2606    21850 &   certificates certificates_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 P   ALTER TABLE ONLY public.certificates DROP CONSTRAINT certificates_user_id_fkey;
       public          postgres    false    211    223    3264            �           2606    21956     contents contents_lesson_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.contents
    ADD CONSTRAINT contents_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;
 J   ALTER TABLE ONLY public.contents DROP CONSTRAINT contents_lesson_id_fkey;
       public          postgres    false    3273    217    231            �           2606    21788    lessons lessons_module_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;
 H   ALTER TABLE ONLY public.lessons DROP CONSTRAINT lessons_module_id_fkey;
       public          postgres    false    3270    215    217            �           2606    21772    modules modules_pathway_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pathway_id_fkey FOREIGN KEY (pathway_id) REFERENCES public.pathways(id) ON DELETE CASCADE;
 I   ALTER TABLE ONLY public.modules DROP CONSTRAINT modules_pathway_id_fkey;
       public          postgres    false    215    3267    213            �           2606    21879    reviews reviews_pathway_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pathway_id_fkey FOREIGN KEY (pathway_id) REFERENCES public.pathways(id) ON DELETE CASCADE;
 I   ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_pathway_id_fkey;
       public          postgres    false    213    3267    225            �           2606    21874    reviews reviews_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 F   ALTER TABLE ONLY public.reviews DROP CONSTRAINT reviews_user_id_fkey;
       public          postgres    false    225    211    3264            �           2606    21908 %   user_badges user_badges_badge_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.badges(id) ON DELETE CASCADE;
 O   ALTER TABLE ONLY public.user_badges DROP CONSTRAINT user_badges_badge_id_fkey;
       public          postgres    false    229    3295    227            �           2606    21903 $   user_badges user_badges_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_badges
    ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 N   ALTER TABLE ONLY public.user_badges DROP CONSTRAINT user_badges_user_id_fkey;
       public          postgres    false    3264    211    229            �           2606    21833 (   user_lessons user_lessons_lesson_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_lessons
    ADD CONSTRAINT user_lessons_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;
 R   ALTER TABLE ONLY public.user_lessons DROP CONSTRAINT user_lessons_lesson_id_fkey;
       public          postgres    false    221    3273    217            �           2606    21828 &   user_lessons user_lessons_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_lessons
    ADD CONSTRAINT user_lessons_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 P   ALTER TABLE ONLY public.user_lessons DROP CONSTRAINT user_lessons_user_id_fkey;
       public          postgres    false    211    3264    221            �           2606    21811 +   user_pathways user_pathways_pathway_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_pathways
    ADD CONSTRAINT user_pathways_pathway_id_fkey FOREIGN KEY (pathway_id) REFERENCES public.pathways(id) ON DELETE CASCADE;
 U   ALTER TABLE ONLY public.user_pathways DROP CONSTRAINT user_pathways_pathway_id_fkey;
       public          postgres    false    3267    213    219            �           2606    21806 (   user_pathways user_pathways_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.user_pathways
    ADD CONSTRAINT user_pathways_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 R   ALTER TABLE ONLY public.user_pathways DROP CONSTRAINT user_pathways_user_id_fkey;
       public          postgres    false    219    211    3264            �   /  x����N�0�g�)��Ж.lL0V*l,��X�/��郰���-潰\Z��*�f�����n"�2#w��X�H�Rd$<n4���T��J'5t�Z�j�
߇oQ9�ڛ4�Wԭ�q��4â$��]@�2�2��K�@W�`�Dc2brm�p�Z����˿���.~Ę�Ę	��j�(�?d,A��?	V�X7Rdm��r�|1��}���Z���=o~kB�,�PB&T�rX���0��0���!{p2�ag�V�D:��r�1dM���
��Ā��%ƿ`�[i]u�qXg��i�$�'zA��      �      x������ � �      �   �  x��WKOI>���6a��1�ė����IV�|�xڦ�==VOۑ��_��\�KN�f�_[��6N.���W}U��WE�������'�χS#��'�0+"�	ז�Wp�a��>Kf\+!�c�<�pɍ��O\��ځ��@d�L��۟j\Rc��n�)6W̤+����� b�����<�<�/L3%��8��������ǂ+gE�����oh���Y����F�nk���Ƀ�R	H��Րoow`�`���a#B���17�=��`!�
�N�X����}ҹũ��-AE��D�C���.@�?dSIG&d
��b&,'W0�\	ӄ�f�-�~�Q��E�`��z\��=$tq����M���!�Lv�nT�69�����S��Wb�'�|��$?t��IJ Y6�T���g6IWq���]��/q+��.ԡu)���2_�ΆBL�� Y�P.�qAI�=��Y���w�ۻ~ZG����������~��}���ݭց�{9-���R���kXr��*V��^���\�(,T�H� N�-�Ț1�����v���l4QHQ*��Wn�%QF�7��&��%�N{���T�H���|XھE�� ������&�3�J���&��mD~Ȓ9����ۺ���m&>;Нf�~
�yѡ�c���%�J�z\3r��S�q�[stQ��ʐ3�Z��ZM%��L�yS7��:y
�|�&[is5ŵ,U	bL�L����8���J�,��m��1I��I�3�N����*���x�%� 3�Q�m�,��UU�J1����9��#�K�RVv�>U+\�z����N��͜Fʲ�`mLC&A$��/�V�6y!�4}wj��E6�\2�H6�Y�~��S�ZG�Tm��ɽ��0�S�by�!!VmM���"Lr#�,�wŋ�]�H4�z���N $�!9Ը�S��}~ӯis	��T���{��.�S�f����k�O�Q��\�@�jI6G��O�{��mR�ʹ�p~���q=W����y�ɦ6�:�u�'	I��3���|�X��RyV=UŖ�I�����
�{�p��m��U��29ee�_91��|W�܀M5�(��!c��%�7�&��߬!�g�`�&[w�5 �ŋ(���:�X$wV��?_:�=� ���g�WG���遮o�P�4T�4\�l,!e�(�4�9q���IYp,�c��s�Q��D����/��(]�2�Ŝ0�м��5���]$a����.�df (�$�̭D�t@�.��F
tjL�'�>�N� 6G�CF
���JdzB�0!`�#��+���zk�Gw��wa*����j�/
���cS���������Bf�q��KrkD93�kJ��ʡ�<,2��g,�a#w_P�q��.�)RW�=Ք&�d�+}�S1�b`��,O�;��)�`/t����9���qE��W�[�㍃���'�x�9�;�����V�`���ͭ�����:";      �   �  x������0�k�)ԇ�E��7aK��@ hm�G�.F�=q^f��nR��{E�'�l6d�)���9B�~|?К��v �4�i�=���O�ý ��T�r��zVSe"���I�U(�d$ �_��Ja�K��(�'��E��_P�q^~�Tr��kn���d�I!G�1N���)�FcuW�Nә� ]Ɨy�OD�l ��᧤�	6��ǩM��YJ��t�m�-S�,�����0(Rp���=|KzM'�'��K�OǓ�:Ή�F�$r�v"cTD��m��/�3�`�Ts��?Y�r"欈$�}���$�=.��p�,,����e��,�h����\ �4���y����~ak���fS7�����5e���pP���hX)��r�ѷ��U�o�7��q1��2��"+�U��5�A�R�%�      �     x��TMo�@=/�b�U�?06�HSU=�H������`�����3{-��r��_�Y��Qrp��}xߛ7o'�D���{X�T*%sO�;�%�me�E�iHe��=A���X�G�I(�Hp�c�0�Y��W����S���a��$z�����зZ>}�Â
s�Uc�1�����l�Qў�ǫ�I�rS	�]}�<�y6%&����O*�/�8�-ڀioV0?=ƸA%���i�􂳄��K˒R#�z)� ���O�4�(���,�8Sٽ��&��������S�~���\��j����8P�g��"FX��F���;˘Շ.�u��@��Q��Ҵ�|/Z�1a�lE�ɎVD��q�e+�f"rD0�X\���J;�X>���I�4D.s��=���F*S��|�/�1��6@�m�ϳ����c�\q���͙c��6T��л��Ϥv|�QS��wR���y@���.�b�������P�Ƈg_M�#���M���g������"��      �   �  x����r�@�k�[&����αS�Hf�Q�H�u:1w�g��P��IE'�rؓ�̤q)������&Yp���J6��jnIÏFn�;�e���,�5ۏ�Hl��%�P<,��#)�4k�h�FI���tE[�w��=�)@r�c��,ISE
lw��%K�*I���-�~�������@��+�qI��4E��Zc��e "��Q�F�L�Y��(M�ɇ(�O��I���S�𝌅�m�����g�WXT��^�!�^�9�Y#�N�J^Yn�p,�~�w��T)g7�������N�b�ʒ��d����E�����ץd�Ē���7�-?�E���J���-�o��M�*HR}���gC��=��/���ޥ>~?�����~^�b�B�h�kÅy�t�.���8"E���,��i��+l%��-��6�</G�L�Y���E8�&"�l"¬���2���U��LLg��0I�ŗ���A>�!�0R      �      x������ � �      �   c   x�mϱ� D�ڞ"}��`�d�9J�E���<��AP� �/Ű>P����[�UR��M�#Mh!Z�sqiu6���2��9��R9��S=P��73�X�5^      �   m   x���1�0��������gl?"/�:PR��+	�H�Q����������XA`u捛s��g�� �W*ݴ�"���7x�Gy2���d�G���-wCda�mL1�px�=1      �   [   x�u�1� й�������!<��1.j������i"�M���%x�DD�f�<J�����z�ko[�N�w&|�\L���"��Y�9� ���      �   �  x���1O�0����q��SҒ��\iu=$@,��5�ݜ�B��H?C��ؚ~�kS	8�$�J^�,��Gn`� M��-1'��x�)X�d,�g8�����[���З�������W�8��#N�.�3�M�������c|���d��r��ˎ]��1��^3t���^�?p�Ov��-��5F��DKo�BH�	l�LA&��ԉ��	�6=q��Qe9ɘ�=j:^�>�|J%j���0e�&�,���S��~;dM�gA+h�C���;�'Q�Z =C�5��ྼ먊��7l��t�KPe�#_�t���d@$۰���)(�X�#���LaBW/0��U�'�6���o�z�mYh	����H�SPt���嫞�!�=)�Iۡ��{wN�V��
��     