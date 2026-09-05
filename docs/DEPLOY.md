# Go-live: Vercel + Neon + GoDaddy

## 1. Neon Postgres (database)

1. Sign up: https://console.neon.tech  
2. Create project **FixSure**  
3. Copy the connection string (use the **pooled** URL if shown):  
   `postgresql://USER:PASSWORD@HOST/neondb?sslmode=require`  
4. In Neon SQL Editor (optional), nothing else needed — Prisma will create tables.

Local/dev can keep using a Neon DB too, or a free Neon “dev” branch.

## 2. Vercel (hosting)

1. Sign up with GitHub: https://vercel.com  
2. **Add New Project** → import `neha1830/FixSure`  
3. Set **Production Branch** to `prod`  
4. Add **Preview** deployments for `qa` and `develop` (Vercel does this by default for all branches)  
5. Environment variables (Production + Preview):

| Name | Value |
|------|--------|
| `DATABASE_URL` | Neon Postgres URL |
| `ADMIN_PASSWORD` | strong password |
| `WHATSAPP_MODE` | `mock` |
| `STORE_NAME` | your shop name |
| `STORE_ADDRESS` | address |
| `STORE_PHONE` | phone |
| `STORE_HOURS` | hours |

6. Deploy. Note the URL: `https://fixsure-….vercel.app`

After first deploy, run once (Vercel CLI or local with prod `DATABASE_URL`):

```bash
DATABASE_URL="postgresql://..." npx prisma db push
```

Or add a one-time “Build Command” that includes `prisma db push` only for first boot (prefer running `db push` manually once).

## 3. GoDaddy domain

1. Vercel → Project → **Settings → Domains** → add `yourdomain.com` and `www.yourdomain.com`  
2. GoDaddy → **DNS** for the domain:

| Type | Name | Value |
|------|------|--------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

(Use exact values Vercel shows if different.)

3. Wait for DNS (5–60 min). HTTPS is automatic on Vercel.

## 4. Branch → environment mapping

| Git branch | Vercel |
|------------|--------|
| `develop` | Preview |
| `qa` | Preview (treat as staging URL / alias) |
| `prod` (via Release) | Production + custom domain |

Optional: in Vercel Domains, assign `qa.yourdomain.com` to the `qa` branch.
