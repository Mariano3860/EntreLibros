-- EntreLibros final schema baseline (part 4 of 4).
-- This file must run after the preceding baseline files.

-- Name: agreement_events agreement_events_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreement_events
    ADD CONSTRAINT agreement_events_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: agreement_events agreement_events_agreement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreement_events
    ADD CONSTRAINT agreement_events_agreement_id_fkey FOREIGN KEY (agreement_id) REFERENCES public.exchange_agreements(id) ON DELETE CASCADE;


--
-- Name: analytics_events analytics_events_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: book_listing_images book_listing_images_book_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_listing_images
    ADD CONSTRAINT book_listing_images_book_listing_id_fkey FOREIGN KEY (book_listing_id) REFERENCES public.book_listings(id) ON DELETE CASCADE;


--
-- Name: book_listings book_listings_book_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_listings
    ADD CONSTRAINT book_listings_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;


--
-- Name: book_listings book_listings_exchange_agreement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_listings
    ADD CONSTRAINT book_listings_exchange_agreement_id_fkey FOREIGN KEY (exchange_agreement_id) REFERENCES public.exchange_agreements(id) ON DELETE SET NULL;


--
-- Name: book_listings book_listings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_listings
    ADD CONSTRAINT book_listings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: community_comments community_comments_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_comments
    ADD CONSTRAINT community_comments_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.book_listings(id) ON DELETE CASCADE;


--
-- Name: community_comments community_comments_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_comments
    ADD CONSTRAINT community_comments_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.community_stories(id) ON DELETE CASCADE;


--
-- Name: community_comments community_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_comments
    ADD CONSTRAINT community_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: community_corner_metrics community_corner_metrics_corner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_corner_metrics
    ADD CONSTRAINT community_corner_metrics_corner_id_fkey FOREIGN KEY (corner_id) REFERENCES public.community_corners(id) ON DELETE CASCADE;


--
-- Name: community_corner_photos community_corner_photos_corner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_corner_photos
    ADD CONSTRAINT community_corner_photos_corner_id_fkey FOREIGN KEY (corner_id) REFERENCES public.community_corners(id) ON DELETE CASCADE;


--
-- Name: community_corners community_corners_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_corners
    ADD CONSTRAINT community_corners_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: community_listing_likes community_listing_likes_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_listing_likes
    ADD CONSTRAINT community_listing_likes_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.book_listings(id) ON DELETE CASCADE;


--
-- Name: community_listing_likes community_listing_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_listing_likes
    ADD CONSTRAINT community_listing_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: community_stories community_stories_book_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_stories
    ADD CONSTRAINT community_stories_book_listing_id_fkey FOREIGN KEY (book_listing_id) REFERENCES public.book_listings(id) ON DELETE SET NULL;


--
-- Name: community_stories community_stories_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_stories
    ADD CONSTRAINT community_stories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: community_story_likes community_story_likes_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_story_likes
    ADD CONSTRAINT community_story_likes_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.community_stories(id) ON DELETE CASCADE;


--
-- Name: community_story_likes community_story_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_story_likes
    ADD CONSTRAINT community_story_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: conversation_participants conversation_participants_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: conversation_participants conversation_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_participants
    ADD CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: exchange_agreement_acceptances exchange_agreement_acceptances_agreement_id_version_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_agreement_acceptances
    ADD CONSTRAINT exchange_agreement_acceptances_agreement_id_version_fkey FOREIGN KEY (agreement_id, version) REFERENCES public.exchange_agreement_versions(agreement_id, version) ON DELETE CASCADE;


--
-- Name: exchange_agreement_acceptances exchange_agreement_acceptances_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_agreement_acceptances
    ADD CONSTRAINT exchange_agreement_acceptances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: exchange_agreement_items exchange_agreement_items_agreement_id_version_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_agreement_items
    ADD CONSTRAINT exchange_agreement_items_agreement_id_version_fkey FOREIGN KEY (agreement_id, version) REFERENCES public.exchange_agreement_versions(agreement_id, version) ON DELETE CASCADE;


--
-- Name: exchange_agreement_items exchange_agreement_items_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_agreement_items
    ADD CONSTRAINT exchange_agreement_items_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.book_listings(id) ON DELETE RESTRICT;


--
-- Name: exchange_agreement_items exchange_agreement_items_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_agreement_items
    ADD CONSTRAINT exchange_agreement_items_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: exchange_agreement_outcomes exchange_agreement_outcomes_agreement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_agreement_outcomes
    ADD CONSTRAINT exchange_agreement_outcomes_agreement_id_fkey FOREIGN KEY (agreement_id) REFERENCES public.exchange_agreements(id) ON DELETE CASCADE;


--
-- Name: exchange_agreement_outcomes exchange_agreement_outcomes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_agreement_outcomes
    ADD CONSTRAINT exchange_agreement_outcomes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: exchange_agreement_versions exchange_agreement_versions_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_agreement_versions
    ADD CONSTRAINT exchange_agreement_versions_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: exchange_agreement_versions exchange_agreement_versions_agreement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_agreement_versions
    ADD CONSTRAINT exchange_agreement_versions_agreement_id_fkey FOREIGN KEY (agreement_id) REFERENCES public.exchange_agreements(id) ON DELETE CASCADE;


--
-- Name: exchange_agreements exchange_agreements_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_agreements
    ADD CONSTRAINT exchange_agreements_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: exchange_agreements exchange_agreements_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_agreements
    ADD CONSTRAINT exchange_agreements_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: exchange_agreements exchange_agreements_proposer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exchange_agreements
    ADD CONSTRAINT exchange_agreements_proposer_id_fkey FOREIGN KEY (proposer_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: message_drafts message_drafts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_drafts
    ADD CONSTRAINT message_drafts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: message_drafts message_drafts_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_drafts
    ADD CONSTRAINT message_drafts_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: notification_preferences notification_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reports reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_blocks user_blocks_blocked_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT user_blocks_blocked_id_fkey FOREIGN KEY (blocked_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_blocks user_blocks_blocker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_blocks
    ADD CONSTRAINT user_blocks_blocker_id_fkey FOREIGN KEY (blocker_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_book_listing_interests user_book_listing_interests_book_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_book_listing_interests
    ADD CONSTRAINT user_book_listing_interests_book_listing_id_fkey FOREIGN KEY (book_listing_id) REFERENCES public.book_listings(id) ON DELETE CASCADE;


--
-- Name: user_book_listing_interests user_book_listing_interests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_book_listing_interests
    ADD CONSTRAINT user_book_listing_interests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_follows user_follows_followed_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_followed_id_fkey FOREIGN KEY (followed_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_follows user_follows_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_follows
    ADD CONSTRAINT user_follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE;
--
