-- EntreLibros final schema baseline (part 2 of 4).
-- This file must run after the preceding baseline files.

-- Name: agreement_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreement_events ALTER COLUMN id SET DEFAULT nextval('public.agreement_events_id_seq'::regclass);


--
-- Name: analytics_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events ALTER COLUMN id SET DEFAULT nextval('public.analytics_events_id_seq'::regclass);


--
-- Name: book_listing_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_listing_images ALTER COLUMN id SET DEFAULT nextval('public.book_listing_images_id_seq'::regclass);


--
-- Name: book_listings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_listings ALTER COLUMN id SET DEFAULT nextval('public.book_listings_id_seq'::regclass);


--
-- Name: books id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books ALTER COLUMN id SET DEFAULT nextval('public.books_id_seq'::regclass);


--
-- Name: community_comments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_comments ALTER COLUMN id SET DEFAULT nextval('public.community_comments_id_seq'::regclass);


--
-- Name: community_stories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_stories ALTER COLUMN id SET DEFAULT nextval('public.community_stories_id_seq'::regclass);


--
-- Name: contact_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages ALTER COLUMN id SET DEFAULT nextval('public.contact_messages_id_seq'::regclass);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: exchange_agreements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_agreements ALTER COLUMN id SET DEFAULT nextval('public.exchange_agreements_id_seq'::regclass);


--
-- Name: message_drafts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_drafts ALTER COLUMN id SET DEFAULT nextval('public.message_drafts_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: agreement_events agreement_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreement_events
    ADD CONSTRAINT agreement_events_pkey PRIMARY KEY (id);


--
-- Name: analytics_events analytics_events_idempotency_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: book_listing_images book_listing_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_listing_images
    ADD CONSTRAINT book_listing_images_pkey PRIMARY KEY (id);


--
-- Name: book_listings book_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_listings
    ADD CONSTRAINT book_listings_pkey PRIMARY KEY (id);


--
-- Name: books books_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.books
    ADD CONSTRAINT books_pkey PRIMARY KEY (id);


--
-- Name: community_comments community_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_comments
    ADD CONSTRAINT community_comments_pkey PRIMARY KEY (id);


--
-- Name: community_corner_metrics community_corner_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_corner_metrics
    ADD CONSTRAINT community_corner_metrics_pkey PRIMARY KEY (corner_id);


--
-- Name: community_corner_photos community_corner_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_corner_photos
    ADD CONSTRAINT community_corner_photos_pkey PRIMARY KEY (id);


--
-- Name: community_corners community_corners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_corners
    ADD CONSTRAINT community_corners_pkey PRIMARY KEY (id);


--
-- Name: community_listing_likes community_listing_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_listing_likes
    ADD CONSTRAINT community_listing_likes_pkey PRIMARY KEY (listing_id, user_id);


--
-- Name: community_stories community_stories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_stories
    ADD CONSTRAINT community_stories_pkey PRIMARY KEY (id);


--
-- Name: community_story_likes community_story_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_story_likes
    ADD CONSTRAINT community_story_likes_pkey PRIMARY KEY (story_id, user_id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: conversation_participants conversation_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_pkey PRIMARY KEY (conversation_id, user_id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: exchange_agreement_acceptances exchange_agreement_acceptances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_agreement_acceptances
    ADD CONSTRAINT exchange_agreement_acceptances_pkey PRIMARY KEY (agreement_id, version, user_id);


--
-- Name: exchange_agreement_items exchange_agreement_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_agreement_items
    ADD CONSTRAINT exchange_agreement_items_pkey PRIMARY KEY (agreement_id, version, listing_id);


--
-- Name: exchange_agreement_outcomes exchange_agreement_outcomes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_agreement_outcomes
    ADD CONSTRAINT exchange_agreement_outcomes_pkey PRIMARY KEY (agreement_id, user_id);


--
-- Name: exchange_agreement_versions exchange_agreement_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_agreement_versions
    ADD CONSTRAINT exchange_agreement_versions_pkey PRIMARY KEY (agreement_id, version);


--
-- Name: exchange_agreements exchange_agreements_conversation_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_agreements
    ADD CONSTRAINT exchange_agreements_conversation_id_key UNIQUE (conversation_id);


--
-- Name: exchange_agreements exchange_agreements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_agreements
    ADD CONSTRAINT exchange_agreements_pkey PRIMARY KEY (id);


--
-- Name: message_drafts message_drafts_conversation_id_author_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_drafts
    ADD CONSTRAINT message_drafts_conversation_id_author_id_key UNIQUE (conversation_id, author_id);


--
-- Name: message_drafts message_drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_drafts
    ADD CONSTRAINT message_drafts_pkey PRIMARY KEY (id);


--
-- Name: messages messages_conversation_id_sender_id_client_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_sender_id_client_key_key UNIQUE (conversation_id, sender_id, client_key);


--
-- Name: messages messages_conversation_id_sequence_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_sequence_key UNIQUE (conversation_id, sequence);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (user_id);


--
-- Name: notifications notifications_idempotency_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: reports reports_reporter_id_target_type_target_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_target_type_target_id_key UNIQUE (reporter_id, target_type, target_id);


--
-- Name: user_blocks user_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT user_blocks_pkey PRIMARY KEY (blocker_id, blocked_id);


--
-- Name: user_book_listing_interests user_book_listing_interests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_book_listing_interests
    ADD CONSTRAINT user_book_listing_interests_pkey PRIMARY KEY (user_id, book_listing_id);


--
-- Name: user_follows user_follows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_pkey PRIMARY KEY (follower_id, followed_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
