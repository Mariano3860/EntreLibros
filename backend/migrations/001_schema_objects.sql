-- EntreLibros final schema baseline.
-- Generated from an isolated historical clean build; contains schema only.

--
--



--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: community_corner_scope; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.community_corner_scope AS ENUM (
    'public',
    'semiprivate'
);


--
-- Name: community_corner_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.community_corner_status AS ENUM (
    'active',
    'paused'
);


--
-- Name: community_corner_visibility; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.community_corner_visibility AS ENUM (
    'exact',
    'approximate'
);


--
-- Name: publication_availability; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.publication_availability AS ENUM (
    'public',
    'private'
);


--
-- Name: publication_condition; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.publication_condition AS ENUM (
    'new',
    'very_good',
    'good',
    'acceptable'
);


--
-- Name: publication_editorial_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.publication_editorial_status AS ENUM (
    'pending',
    'needs_correction',
    'approved',
    'rejected'
);


--
-- Name: publication_shipping_payer; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.publication_shipping_payer AS ENUM (
    'owner',
    'requester',
    'split'
);


--
-- Name: publication_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.publication_status AS ENUM (
    'draft',
    'available',
    'reserved',
    'inactive',
    'completed',
    'sold',
    'exchanged'
);


--
-- Name: publication_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.publication_type AS ENUM (
    'offer',
    'want'
);




--
-- Name: agreement_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agreement_events (
    id bigint NOT NULL,
    agreement_id bigint NOT NULL,
    version integer NOT NULL,
    actor_id integer NOT NULL,
    event_type text NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT agreement_events_event_type_check CHECK ((length(TRIM(BOTH FROM event_type)) > 0))
);


--
-- Name: agreement_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.agreement_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: agreement_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.agreement_events_id_seq OWNED BY public.agreement_events.id;


--
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics_events (
    id bigint NOT NULL,
    event_type text NOT NULL,
    actor_id integer,
    entity_type text NOT NULL,
    entity_id text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    idempotency_key text NOT NULL,
    CONSTRAINT analytics_events_event_type_check CHECK ((event_type = ANY (ARRAY['listing_published'::text, 'contact_started'::text, 'agreement_created'::text, 'agreement_confirmed'::text, 'agreement_reminder'::text, 'outcome_recorded'::text])))
);


--
-- Name: analytics_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.analytics_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: analytics_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.analytics_events_id_seq OWNED BY public.analytics_events.id;


--
-- Name: book_listing_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book_listing_images (
    id integer NOT NULL,
    book_listing_id integer NOT NULL,
    url text NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    source text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: book_listing_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.book_listing_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: book_listing_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.book_listing_images_id_seq OWNED BY public.book_listing_images.id;


--
-- Name: book_listings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book_listings (
    id integer NOT NULL,
    user_id integer NOT NULL,
    book_id integer NOT NULL,
    status public.publication_status DEFAULT 'available'::public.publication_status NOT NULL,
    type public.publication_type NOT NULL,
    description text,
    condition public.publication_condition,
    sale boolean DEFAULT false NOT NULL,
    donation boolean DEFAULT false NOT NULL,
    trade boolean DEFAULT false NOT NULL,
    price_amount numeric(10,2),
    price_currency text,
    trade_preferences text[] DEFAULT ARRAY[]::text[] NOT NULL,
    availability public.publication_availability DEFAULT 'public'::public.publication_availability NOT NULL,
    delivery_near_book_corner boolean DEFAULT false NOT NULL,
    delivery_in_person boolean DEFAULT false NOT NULL,
    delivery_shipping boolean DEFAULT false NOT NULL,
    delivery_shipping_payer public.publication_shipping_payer,
    is_draft boolean DEFAULT false NOT NULL,
    corner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    exchange_agreement_id bigint,
    expires_at timestamp with time zone DEFAULT (now() + '30 days'::interval),
    content_consent boolean DEFAULT true NOT NULL,
    image_consent boolean DEFAULT true NOT NULL,
    rules_consent boolean DEFAULT true NOT NULL,
    editorial_status public.publication_editorial_status DEFAULT 'approved'::public.publication_editorial_status NOT NULL,
    editorial_reason text
);


--
-- Name: book_listings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.book_listings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: book_listings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.book_listings_id_seq OWNED BY public.book_listings.id;


--
-- Name: books; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.books (
    id integer NOT NULL,
    title text NOT NULL,
    author text,
    isbn text,
    publisher text,
    published_year integer,
    verified boolean DEFAULT false NOT NULL,
    cover_url text,
    language text,
    format text
);


--
-- Name: books_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.books_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: books_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.books_id_seq OWNED BY public.books.id;


--
-- Name: community_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_comments (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    listing_id integer,
    story_id bigint,
    body text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT community_comments_body_check CHECK (((length(TRIM(BOTH FROM body)) > 0) AND (length(TRIM(BOTH FROM body)) <= 1000))),
    CONSTRAINT community_comments_check CHECK (((((listing_id IS NOT NULL))::integer + ((story_id IS NOT NULL))::integer) = 1))
);


--
-- Name: community_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.community_comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: community_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.community_comments_id_seq OWNED BY public.community_comments.id;


--
-- Name: community_corner_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_corner_metrics (
    corner_id uuid NOT NULL,
    total_exchanges integer DEFAULT 0 NOT NULL,
    weekly_exchanges integer DEFAULT 0 NOT NULL,
    last_activity_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: community_corner_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_corner_photos (
    id uuid NOT NULL,
    corner_id uuid NOT NULL,
    external_id text NOT NULL,
    url text NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: community_corners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_corners (
    id uuid NOT NULL,
    name text NOT NULL,
    scope public.community_corner_scope NOT NULL,
    host_alias text NOT NULL,
    internal_contact text NOT NULL,
    rules text,
    schedule text,
    visibility_preference public.community_corner_visibility NOT NULL,
    address_street text NOT NULL,
    address_number text NOT NULL,
    address_unit text,
    address_postal_code text,
    status public.community_corner_status DEFAULT 'active'::public.community_corner_status NOT NULL,
    draft boolean DEFAULT false NOT NULL,
    consent boolean DEFAULT false NOT NULL,
    location public.geography(Point,4326) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    owner_id integer,
    editorial_status public.publication_editorial_status DEFAULT 'approved'::public.publication_editorial_status NOT NULL,
    editorial_reason text
);


--
-- Name: community_listing_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_listing_likes (
    listing_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: community_stories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_stories (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    body text NOT NULL,
    image_url text,
    book_listing_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT community_stories_check CHECK (((length(TRIM(BOTH FROM body)) > 0) OR (image_url IS NOT NULL) OR (book_listing_id IS NOT NULL)))
);


--
-- Name: community_stories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.community_stories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: community_stories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.community_stories_id_seq OWNED BY public.community_stories.id;


--
-- Name: community_story_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_story_likes (
    story_id bigint NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_messages (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contact_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contact_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contact_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contact_messages_id_seq OWNED BY public.contact_messages.id;


--
-- Name: conversation_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation_participants (
    conversation_id bigint NOT NULL,
    user_id integer NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    last_read_sequence bigint DEFAULT 0 NOT NULL,
    last_delivered_sequence bigint DEFAULT 0 NOT NULL,
    hidden_at timestamp with time zone,
    CONSTRAINT conversation_participants_last_delivered_sequence_check CHECK ((last_delivered_sequence >= 0)),
    CONSTRAINT conversation_participants_last_read_sequence_check CHECK ((last_read_sequence >= 0))
);


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_message_sequence bigint DEFAULT 0 NOT NULL,
    CONSTRAINT conversations_last_message_sequence_check CHECK ((last_message_sequence >= 0))
);


--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: exchange_agreement_acceptances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exchange_agreement_acceptances (
    agreement_id bigint NOT NULL,
    version integer NOT NULL,
    user_id integer NOT NULL,
    accepted_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: exchange_agreement_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exchange_agreement_items (
    agreement_id bigint NOT NULL,
    version integer NOT NULL,
    listing_id integer NOT NULL,
    owner_id integer NOT NULL
);


--
-- Name: exchange_agreement_outcomes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exchange_agreement_outcomes (
    agreement_id bigint NOT NULL,
    user_id integer NOT NULL,
    outcome text NOT NULL,
    reason text,
    recorded_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT exchange_agreement_outcomes_outcome_check CHECK ((outcome = ANY (ARRAY['completed'::text, 'not_completed'::text])))
);


--
-- Name: exchange_agreement_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exchange_agreement_versions (
    agreement_id bigint NOT NULL,
    version integer NOT NULL,
    actor_id integer NOT NULL,
    state text DEFAULT 'proposed'::text NOT NULL,
    details jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT exchange_agreement_versions_details_check CHECK ((jsonb_typeof(details) = 'object'::text)),
    CONSTRAINT exchange_agreement_versions_state_check CHECK ((state = ANY (ARRAY['proposed'::text, 'partially_confirmed'::text, 'confirmed'::text, 'cancelled'::text, 'rejected'::text, 'completed'::text]))),
    CONSTRAINT exchange_agreement_versions_version_check CHECK ((version > 0))
);


--
-- Name: exchange_agreements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exchange_agreements (
    id bigint NOT NULL,
    conversation_id bigint NOT NULL,
    proposer_id integer NOT NULL,
    participant_id integer NOT NULL,
    state text DEFAULT 'proposed'::text NOT NULL,
    current_version integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT exchange_agreements_check CHECK ((proposer_id <> participant_id)),
    CONSTRAINT exchange_agreements_current_version_check CHECK ((current_version > 0)),
    CONSTRAINT exchange_agreements_state_check CHECK ((state = ANY (ARRAY['proposed'::text, 'partially_confirmed'::text, 'confirmed'::text, 'cancelled'::text, 'rejected'::text, 'completed'::text])))
);


--
-- Name: exchange_agreements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.exchange_agreements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: exchange_agreements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.exchange_agreements_id_seq OWNED BY public.exchange_agreements.id;


--
-- Name: message_drafts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_drafts (
    id bigint NOT NULL,
    conversation_id bigint NOT NULL,
    author_id integer NOT NULL,
    body text DEFAULT ''::text NOT NULL,
    attachment_metadata jsonb,
    revision integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT message_drafts_attachment_metadata_check CHECK (((attachment_metadata IS NULL) OR (jsonb_typeof(attachment_metadata) = 'object'::text))),
    CONSTRAINT message_drafts_body_check CHECK ((length(body) <= 4000)),
    CONSTRAINT message_drafts_check CHECK (((length(TRIM(BOTH FROM body)) > 0) OR (attachment_metadata IS NOT NULL))),
    CONSTRAINT message_drafts_revision_check CHECK ((revision > 0))
);


--
-- Name: message_drafts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.message_drafts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: message_drafts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_drafts_id_seq OWNED BY public.message_drafts.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id bigint NOT NULL,
    conversation_id bigint NOT NULL,
    sender_id integer NOT NULL,
    sequence bigint NOT NULL,
    client_key text NOT NULL,
    body text NOT NULL,
    attachment_metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT messages_attachment_metadata_check CHECK (((attachment_metadata IS NULL) OR (jsonb_typeof(attachment_metadata) = 'object'::text))),
    CONSTRAINT messages_check CHECK (((length(TRIM(BOTH FROM body)) > 0) OR (attachment_metadata IS NOT NULL)))
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_preferences (
    user_id integer NOT NULL,
    in_app_enabled boolean DEFAULT true NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    recipient_id integer NOT NULL,
    kind text NOT NULL,
    entity_id text NOT NULL,
    title_key text NOT NULL,
    body_key text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    idempotency_key text NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notifications_kind_check CHECK ((kind = ANY (ARRAY['message'::text, 'agreement'::text])))
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    id bigint NOT NULL,
    reporter_id integer NOT NULL,
    target_type text NOT NULL,
    target_id text NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'received'::text NOT NULL,
    channel text DEFAULT 'support'::text NOT NULL,
    due_at timestamp with time zone DEFAULT (now() + '3 days'::interval) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    category text DEFAULT 'content'::text NOT NULL,
    CONSTRAINT reports_status_check CHECK ((status = ANY (ARRAY['received'::text, 'in_review'::text, 'resolved'::text, 'dismissed'::text]))),
    CONSTRAINT reports_target_type_check CHECK ((target_type = ANY (ARRAY['content'::text, 'conduct'::text, 'corner_missing'::text])))
);


--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- Name: user_blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_blocks (
    blocker_id integer NOT NULL,
    blocked_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_blocks_check CHECK ((blocker_id <> blocked_id))
);


--
-- Name: user_book_listing_interests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_book_listing_interests (
    user_id integer NOT NULL,
    book_listing_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_follows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_follows (
    follower_id integer NOT NULL,
    followed_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_follows_check CHECK ((follower_id <> followed_id))
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    language text DEFAULT 'es'::text NOT NULL,
    location public.geography(Point,4326),
    search_radius integer,
    alias text DEFAULT ''::text NOT NULL,
    profile_description text,
    profile_visibility text DEFAULT 'public'::text NOT NULL,
    location_visibility text DEFAULT 'city'::text NOT NULL,
    interests text[] DEFAULT '{}'::text[] NOT NULL,
    city text,
    neighborhood text,
    profile_photo_url text,
    country text DEFAULT 'Argentina'::text NOT NULL,
    street text,
    CONSTRAINT users_interests_max_count CHECK ((cardinality(interests) <= 8)),
    CONSTRAINT users_interests_not_null CHECK ((interests IS NOT NULL)),
    CONSTRAINT users_location_visibility_check CHECK ((location_visibility = ANY (ARRAY['none'::text, 'country'::text, 'city'::text, 'neighborhood'::text]))),
    CONSTRAINT users_profile_visibility_check CHECK ((profile_visibility = ANY (ARRAY['public'::text, 'private'::text])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
