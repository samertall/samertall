# Ripple

Pass it before it cools. Ripple is a live board for short lines. People pass a line, reply with a twist, or drop one of their own. Heat rises when passes are recent and cools as attention moves on.

## Board

- **Ember** — just dropped
- **Kindling** — people are passing it
- **Wave** — it is moving
- **Storm** — it is the board

Heat = passes in the last hour × 10 + passes in the last six hours × 3 + every pass + replies × 4.

The opening board is seeded so the heat model is visible on a fresh database. Accounts you create, and the passes and drops you make, are stored in Postgres.

## Local setup

```bash
cd ripple
cp .env.example .env.local
# fill DATABASE_URL and BETTER_AUTH_SECRET
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open http://localhost:3000.

`BETTER_AUTH_URL` should be `http://localhost:3000` locally and the production origin in production. Leave it unset on Vercel Preview so each preview URL can sign people in.

## Deploy

The Next.js app lives in this `ripple` directory. Point the Vercel project root at `ripple`, provision Neon Postgres, and set:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `BETTER_AUTH_URL` for production

Then run `npm run db:push` against that database. The first visit seeds the opening board.
