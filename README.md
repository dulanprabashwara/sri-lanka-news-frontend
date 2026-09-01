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
   ```

4. Start the Spring Boot backend.

5. Start the frontend:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000`.

Environment-specific API URLs belong in local or deployment environment
configuration. Do not commit real deployment configuration or secrets.

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
