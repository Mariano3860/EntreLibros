# Local dataset and defense walkthrough

This is a development-only dataset for studying EntreLibros with the real
frontend, API, PostgreSQL and PostGIS. It is not a migration and it is not
production content.

## Lifecycle

```bash
npm run migrate
npm run seed:local
npm run seed:local:verify
npm run seed:local:cleanup
```

The seed is idempotent and uses the reserved `seed.*@entrelibros.local`
namespace. It never truncates the database. The cleanup removes seeded users,
their owned listings, social records, conversations, drafts, agreements,
notifications, analytics events and fixed seed corners. Shared bibliographic
rows are retained when their provenance cannot be distinguished safely.

The scripts refuse test, E2E and production-like database names before opening
a write connection. The twelve seeded accounts share the local-only password
`Demo123!`; change or delete them before sharing a development database.

## What is persisted

- 12 human profiles with aliases, interests, Spanish language, neighborhood
  visibility and public profile-photo references.
- 30 ISBN-keyed bibliographic books with Open Library cover references.
- 40 public offer, sale and want listings, each with a primary image and, when
  applicable, a book-corner relationship.
- 8 consented, editorially approved corners with approximate PostGIS points,
  rules, schedules, photos and metrics.
- Follows, one block, stories, likes and comments used by discovery and privacy
  queries.
- 8 conversations and 24 messages with deterministic client keys, book
  attachments, read positions and 8 private drafts.
- Proposed, confirmed, completed and cancelled agreement journeys, including
  versions, items, acceptances, events, outcomes and notifications.
- Six analytics events covering publication, contact, agreement and outcome
  states.

## Five real-mode walkthroughs

1. **Architecture**: open `frontend/src/App.tsx`, follow the route to a page,
   inspect its API client, then follow the matching route, service/repository
   and SQL in `backend/src`.
2. **Publish a book**: log in as a seeded user, open the publish modal, select a
   book, and follow `POST /api/books` to the books route and listing repository.
3. **Find a corner**: open Map, move the viewport, and inspect `GET /api/map`.
   The response uses PostGIS and returns approximate public locations; it never
   exposes the stored exact point as a public profile field.
4. **Exchange**: open a seeded conversation, inspect a persisted draft, send a
   message, create an agreement and accept a version. Reload the page to see
   history and notification state survive; Socket.IO only distributes rows that
   were already committed through HTTP.
5. **Security**: compare a public profile projection with the owner profile,
   then inspect a blocked relationship. Authorization, ownership, blocks and
   public projections are enforced by backend queries, not by fixture data.

## Image policy

Seeded URLs are public HTTPS references only. They contain no tokens, personal
addresses or private coordinates. If an external provider is unavailable, the
existing `/logo.svg` or cover fallback is expected; a missing image must not
turn into a fake persisted object.
