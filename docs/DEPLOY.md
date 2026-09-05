# Database separation

| Environment | Database | Where `DATABASE_URL` lives |
|-------------|----------|------------------------------|
| **Local** | SQLite `prisma/dev.db` (or `file:./dev.db`) | `.env` / `.env.local` only |
| **QA / Preview** | Neon branch or DB named `fixsure-qa` | Vercel **Preview** env vars |
| **Production** | Neon branch or DB named `fixsure-prod` | Vercel **Production** env vars only |

**Never** put the production Neon URL in `.env` on your laptop.  
**Never** point local `npm run dev` at Neon.

## Local (SQLite)

```env
DATABASE_URL="file:./dev.db"
```

```bash
npm run db:generate   # uses prisma/schema.prisma (sqlite)
npm run db:push
npm run dev
```

## Production / QA (Neon Postgres)

Schemas: `prisma/schema.postgres.prisma`  
Vercel build uses this automatically via `vercel.json`.

Create **two** Neon databases/branches (do not share):

1. `fixsure-prod` → Vercel Production `DATABASE_URL`  
2. `fixsure-qa` → Vercel Preview `DATABASE_URL`  

Push schema once per database:

```bash
DATABASE_URL="postgresql://…qa…" npm run db:push:prod
DATABASE_URL="postgresql://…prod…" npm run db:push:prod
```

## GoDaddy / Vercel

See earlier sections in this file for domain DNS. After Vercel import:

1. Production env → prod Neon URL  
2. Preview env → qa Neon URL  
3. Production branch = `prod`
