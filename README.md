# rrobinson.me

Portfolio and blog of Rapheal Robinson, site reliability engineer and game developer.
Live at **https://rrobinson.me**.

Built with [Astro](https://astro.build) (static output), served by unprivileged nginx, and
deployed with GitOps to a self-managed k3s cluster:

```
push to main ─► GitHub Actions builds ghcr.io/jojobobby/portfolio:<sha>
             └► commits the new tag to deploy/values.yaml ─► Argo CD rolls it out
```

## Writing content

| What | Where |
|---|---|
| A project (case study) | `src/content/projects/<id>.md` — frontmatter: title, org, role, dates, section (`professional` / `studio` / `earlier`), order, summary, tech, cover, stats |
| A post | `src/content/writing/<id>.md` — frontmatter: title, date, kind (`postmortem` / `engineering` / `design` / `devlog`), summary, project |
| Images | `public/media/...`, referenced as `/media/...` |
| Name, links, nav | `src/site.ts` |

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

## Deployment

- `Dockerfile`: builds the site, then serves `dist/` with `nginxinc/nginx-unprivileged`
  (uid 101, port 8080, read-only root filesystem in the cluster).
- `nginx.conf` + `security-headers.inc`: routing, caching, CSP and other headers.
- `deploy/`: the Helm chart (2 replicas, zero-downtime rolling updates, ingress + Let's Encrypt
  certificate via cert-manager). `image.tag` is written by CI only.

## Comments and videos API

`api/` is a small Node service at `/api` (deployment `portfolio-api`):

- **Comments:** name, optional email, comment. Stored in the shared Postgres (database
  `portfolio`). Emails are never returned by the API; they are only used for reply
  notifications after a one-time confirm link, and every reply email has an unsubscribe link.
  The server also stores the visitor IP and a random browser ID for spam limits.
- **Videos:** every 6 hours it reads the @RalphOfc channel and stores each video's id, title,
  upload date and thumbnail (never the video). The Videos page reads `/api/videos`.
- **Moderation:** `curl -X DELETE -H "Authorization: Bearer $ADMIN_TOKEN" https://rrobinson.me/api/comments/<id>`

Secret `portfolio-api` (namespace `portfolio`, out of band): `DATABASE_URL`, `ADMIN_TOKEN`,
`SMTP_USER` (noreply@tidangames.com) and `SMTP_PASS` (that mailbox's password).
