-- EntreLibros final schema baseline (part 3 of 4).
-- This file must run after the preceding baseline files.

-- Name: agreement_events_agreement_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX agreement_events_agreement_idx ON public.agreement_events USING btree (agreement_id, created_at, id);


--
-- Name: analytics_events_type_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX analytics_events_type_time_idx ON public.analytics_events USING btree (event_type, occurred_at DESC);


--
-- Name: book_listings_active_want_user_book_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX book_listings_active_want_user_book_idx ON public.book_listings USING btree (user_id, book_id) WHERE ((type = 'want'::public.publication_type) AND (is_draft = false) AND (status = 'available'::public.publication_status));


--
-- Name: book_listings_editorial_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX book_listings_editorial_status_idx ON public.book_listings USING btree (editorial_status);


--
-- Name: book_listings_exchange_agreement_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX book_listings_exchange_agreement_idx ON public.book_listings USING btree (exchange_agreement_id) WHERE (exchange_agreement_id IS NOT NULL);


--
-- Name: book_listings_expiry_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX book_listings_expiry_idx ON public.book_listings USING btree (status, availability, expires_at);


--
-- Name: community_comments_listing_feed_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_comments_listing_feed_idx ON public.community_comments USING btree (listing_id, created_at, id) WHERE (listing_id IS NOT NULL);


--
-- Name: community_comments_story_feed_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_comments_story_feed_idx ON public.community_comments USING btree (story_id, created_at, id) WHERE (story_id IS NOT NULL);


--
-- Name: community_corner_photos_primary_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX community_corner_photos_primary_unique ON public.community_corner_photos USING btree (corner_id) WHERE (is_primary = true);


--
-- Name: community_corners_editorial_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_corners_editorial_status_idx ON public.community_corners USING btree (editorial_status);


--
-- Name: community_corners_location_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_corners_location_idx ON public.community_corners USING gist (location);


--
-- Name: community_corners_owner_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_corners_owner_idx ON public.community_corners USING btree (owner_id);


--
-- Name: community_listing_likes_listing_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_listing_likes_listing_idx ON public.community_listing_likes USING btree (listing_id, created_at DESC);


--
-- Name: community_stories_feed_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_stories_feed_idx ON public.community_stories USING btree (created_at DESC, id DESC);


--
-- Name: community_story_likes_story_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX community_story_likes_story_idx ON public.community_story_likes USING btree (story_id, created_at DESC);


--
-- Name: contact_messages_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX contact_messages_email_idx ON public.contact_messages USING btree (email);


--
-- Name: conversation_participants_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversation_participants_user_idx ON public.conversation_participants USING btree (user_id, conversation_id);


--
-- Name: conversation_participants_visible_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX conversation_participants_visible_user_idx ON public.conversation_participants USING btree (user_id, conversation_id) WHERE (hidden_at IS NULL);


--
-- Name: exchange_agreement_items_listing_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exchange_agreement_items_listing_idx ON public.exchange_agreement_items USING btree (listing_id);


--
-- Name: exchange_agreement_outcomes_agreement_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exchange_agreement_outcomes_agreement_idx ON public.exchange_agreement_outcomes USING btree (agreement_id, recorded_at);


--
-- Name: exchange_agreements_participants_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exchange_agreements_participants_idx ON public.exchange_agreements USING btree (proposer_id, participant_id);


--
-- Name: message_drafts_author_updated_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX message_drafts_author_updated_idx ON public.message_drafts USING btree (author_id, updated_at DESC);


--
-- Name: messages_conversation_sequence_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX messages_conversation_sequence_idx ON public.messages USING btree (conversation_id, sequence DESC);


--
-- Name: messages_sender_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX messages_sender_idx ON public.messages USING btree (sender_id);


--
-- Name: notifications_recipient_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_recipient_created_idx ON public.notifications USING btree (recipient_id, created_at DESC);


--
-- Name: publication_images_publication_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX publication_images_publication_id_idx ON public.book_listing_images USING btree (book_listing_id);


--
-- Name: publications_availability_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX publications_availability_idx ON public.book_listings USING btree (availability);


--
-- Name: publications_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX publications_status_idx ON public.book_listings USING btree (status);


--
-- Name: publications_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX publications_user_id_idx ON public.book_listings USING btree (user_id);


--
-- Name: reports_status_due_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reports_status_due_idx ON public.reports USING btree (status, due_at);


--
-- Name: user_blocks_blocked_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_blocks_blocked_idx ON public.user_blocks USING btree (blocked_id, blocker_id);


--
-- Name: user_book_listing_interests_listing_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_book_listing_interests_listing_idx ON public.user_book_listing_interests USING btree (book_listing_id, created_at DESC);


--
-- Name: user_follows_followed_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_follows_followed_idx ON public.user_follows USING btree (followed_id, created_at DESC);


--
-- Name: user_follows_follower_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_follows_follower_idx ON public.user_follows USING btree (follower_id, created_at DESC);


--
-- Name: users_location_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_location_idx ON public.users USING gist (location);


--
-- Name: users_profile_visibility_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_profile_visibility_idx ON public.users USING btree (profile_visibility);


--
