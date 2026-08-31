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
