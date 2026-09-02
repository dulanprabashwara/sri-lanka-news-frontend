# Sri Lanka News Frontend

Next.js frontend for browsing the public Source, Article, and Story APIs provided by the
Sri Lanka News Spring Boot backend.

## Requirements

- Node.js 20.9 or newer
- npm
- The backend API running and configured with its own MongoDB Atlas connection

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local`.

3. Set the backend origin in `.env.local`:

   ```dotenv
   API_BASE_URL=http://localhost:8080
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
   ```

4. Start the Spring Boot backend.

5. Start the frontend:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000`.

Environment-specific API URLs belong in local or deployment environment
configuration. Do not commit real deployment configuration or secrets.

## Supabase authentication

Authentication is optional for browsing. Public news, Stories, comparison, timeline, and
multilingual routes remain available to guests. Supabase owns email/password sessions; the
frontend stores them through `@supabase/ssr` cookies and validates server identity with
`getClaims()` before forwarding an access token only to Spring's protected `/api/v1/me` routes.
The account page lets authenticated users explicitly save a preferred display language and
categories. Article and Story pages offer owner-scoped bookmarks, and `/bookmarks` provides a
protected, filterable saved-content list. These operations use Server Actions so access tokens and
the server-only backend URL are not exposed to client components. An explicit `?lang=en|si|ta`
always overrides a saved language preference; guests and `ORIGINAL` preferences retain original
publisher-language behavior. Preferred categories do not reorder the public Latest News feed.

In the Supabase Dashboard, enable the Email provider, set the local Site URL to
`http://localhost:3000`, and allow `http://localhost:3000/auth/confirm` plus
`http://localhost:3000/auth/reset-password` as redirect destinations. Choose whether email
confirmation is required and configure SMTP for reliable production confirmation/recovery mail.
Verify the project uses asymmetric JWT signing keys and exposes Auth JWKS. Never add a service-role
key, secret key, database password, signing private key, or legacy JWT secret to this frontend.

Authenticated users can follow publishers from Source pages and AI-generated topics from Article
detail pages. `/following` lists and filters those Source and Topic interests and supports
unfollowing. Calls continue through server-only authenticated data access and Server Actions;
follow data and access tokens are not placed in public DTOs or shared caches. Topic labels retain
their stored language and are not translated or semantically merged. Following records interests
only and never reorders the public Latest News feed. Existing `?lang=en|si|ta`
state is preserved through login and internal Source links.

## For You

Authenticated users can open `/for-you` from the header. The page uses only followed Sources,
followed Topics, and preferred Categories explicitly saved by that user. Matching Articles show
compact, deterministic reasons; recent unmatched Articles follow as unlabeled fallback content.
Users without signals see a short onboarding notice and the latest fallback feed rather than an
empty page. Topic identity remains exact and language-specific.

The page preserves `?lang=en|si|ta`, or uses the saved display preference when no explicit language
is present. Translation availability changes presentation only, never ranking. Access tokens stay
server-side, and no click history, impressions, reading time, behavioral profiling, Gemini,
embeddings, or shared Redis personalization cache is used. `/` remains the unchanged public Latest
News experience.

## Search

`/search` is a public Server Component page with independent Keyword and Semantic modes. Keyword
mode remains the default and continues to use `GET /api/v1/search/articles`; Semantic mode uses
`GET /api/v1/search/semantic` to find conceptually similar reports. Mode switches preserve the
query, Source state, category, original-language filter, and current `?lang=en|si|ta` display
choice. Both modes reuse public-safe localized Article cards and provide initial, empty, loading,
pagination, and error states without displaying raw similarity scores.

Search requires no login and sends no access token. Semantic mode creates one temporary query
embedding but stores neither the query nor vector and never re-embeds Articles, translates queries,
invokes generative AI, personalizes ranking, or uses Redis. If semantic search is unavailable, the
page retains the user's state and offers Keyword search. Semantic quality across English, Sinhala,
and Tamil depends on the configured embedding model.

## Ask This Story

Story detail pages include a guest-accessible, one-question/one-answer Ask This Story panel. It
submits through a Server Action so `API_BASE_URL` remains server-only and passes the current
`?lang=en|si|ta` selection for an English, Sinhala, or Tamil answer. The backend grounds every
answer only in reports assigned to that Story, reuses existing Article embeddings, and returns
backend-validated citations linking to original publishers. Inline citation markers connect to an
accessible Sources used list; similarity, model, token, prompt, vector, and extracted-content data
are not displayed.

The panel has idle, submitting, answered, insufficient-evidence, and unavailable states. A failed
request retains the question. Changing language does not regenerate an old answer, and reloading
clears both question and answer because there is no conversation, browser storage, account history,
tracking, or Redis answer cache. Normal requests use one temporary embedding call and one grounded
generation call; provider quota and production rate limiting remain later hardening work.

## Trending Stories

`/trending` is a guest-accessible Server Component experience for Stories receiving recent and
broad publisher coverage. Trending is not a popularity claim: the platform collects no clicks,
views, social signals, searches, or other behavior for this ranking. The backend deterministically
combines report recency, report count, and distinct publisher count inside a configured recent
window, then returns understandable reason labels without raw scores.

Category filters and `?lang=en|si|ta` are shareable and preserved in Story links. Display language
changes only localized presentation, never ranking. The page uses no client state, AI request,
Redis dependency, personalization, or authentication and includes independent loading, empty, and
safe failure states.

## Scripts

- `npm run dev` starts the development server.
- `npm run lint` checks the source with ESLint.
- `npm run typecheck` runs strict TypeScript checking.
- `npm test` runs the data-access and response-contract tests.
- `npm run build` creates the production build.
- `npm start` serves a completed production build.

## Structure

- `src/app` contains App Router pages, layouts, and route states.
- `src/components` contains shared presentation components.
- `src/config` validates environment configuration.
- `src/lib/api` owns backend requests, errors, and runtime response parsing.
- `src/types` contains types for the backend's public API DTOs.

## Backend integration

Pages fetch data in Server Components. Requests therefore run from the Next.js
server to the Spring Boot API instead of directly from the browser, so Phase 4
does not require a browser CORS policy or a proxy/BFF. The backend must still be
reachable from the machine or deployment running Next.js.

Story detail pages request deterministic publisher coverage metadata on the server.
The comparison uses existing topics and entities and does not call an AI provider.
Source-specific metadata means only that it is absent from other currently available
reports; it does not imply intentional omission. Cross-language equality is limited to
literal normalized strings, so translated equivalents are not merged. Single-source
Stories display a neutral waiting state, and comparison failures never prevent the
main Story page from rendering. Full publisher content and private processing,
embedding, model, prompt, and clustering metadata are never expected by frontend types.

Story timelines use assigned Article publication timestamps and stable Article IDs to
display currently available publisher reports chronologically. Relative labels are measured
from the earliest available report and do not represent event occurrence, discovery,
causation, copying, or publisher intent. The timeline makes no AI/provider call, remains
visible for single-report Stories, and fails independently from the main Story page.
Timeline types include only public summaries and attribution; private content, hashes,
embeddings, processing, model/prompt, clustering, and MongoDB metadata are excluded.

## Multilingual display

The header offers Original, English, Sinhala, and Tamil display modes. The selection uses the
shareable `lang=en|si|ta` query parameter so Server Components can request the matching backend
`displayLanguage`; no `lang` parameter means Original. Internal Article, Source, Story, coverage,
and timeline links preserve the selection. External publisher URLs are never modified.

Localized pages display only translated titles and existing AI-generated summaries and label them
as platform translations. Original publisher language attribution remains visible, missing
translations fall back safely, and full scraped publisher content is never translated or publicly
republished. Coverage topic/entity chips can remain in their source language because Phase 17 does
not perform semantic multilingual metadata merging.
