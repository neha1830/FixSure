## Branch strategy

```text
feature/*  ──PR──►  develop  ──PR──►  qa  ──Release──►  prod
```

| Branch | Purpose | How it gets updates |
|--------|---------|---------------------|
| `feature/*` | Your work | Push freely |
| `develop` | Integration | **PR only** (no direct push) |
| `qa` | QA / staging | **PR from `develop` only** |
| `prod` | Production | **GitHub Release only** (workflow moves `prod` to the release tag) |

### Daily workflow

1. Create a branch from `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/short-name
   ```
2. Commit and push, open a **PR → develop**
3. CI must pass (lint, TypeScript, build). Merge via GitHub (squash or merge commit).
4. When ready for QA, open **PR: develop → qa**. CI must pass again.
5. When ready for production:
   - Ensure `qa` is good
   - On GitHub: **Releases → Draft a new release**
   - Tag like `v1.0.0` targeting the `qa` branch (or the commit you tested)
   - Publish release → `Production release` workflow runs CI and updates `prod`

### Never do

- Push straight to `develop`, `qa`, or `prod`
- Merge to `prod` with a normal PR (blocked by protection + release process)
- Skip CI failures

### Enable branch protection (one-time)

After the GitHub repo exists and you are logged in with `gh`:

```bash
chmod +x scripts/setup-github-protections.sh
./scripts/setup-github-protections.sh OWNER/REPO
```

### Optional SonarCloud

1. Create a project at [sonarcloud.io](https://sonarcloud.io)
2. Set `sonar.organization` in `sonar-project.properties`
3. Add repo secret `SONAR_TOKEN`
