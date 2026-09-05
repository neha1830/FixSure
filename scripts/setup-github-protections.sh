#!/usr/bin/env bash
# Apply GitHub branch protection for FixSure.
# Usage: ./scripts/setup-github-protections.sh OWNER/REPO
set -euo pipefail

REPO="${1:-}"
if [[ -z "$REPO" ]]; then
  echo "Usage: $0 OWNER/REPO"
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "Install GitHub CLI first: https://cli.github.com/"
  exit 1
fi

echo "Configuring protections on $REPO ..."

# develop: PR required, CI required, no direct push
gh api -X PUT "repos/$REPO/branches/develop/protection" \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Lint · Typecheck · Build"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true
}
EOF

# qa: PR required (from develop in practice), CI required
gh api -X PUT "repos/$REPO/branches/qa/protection" \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Lint · Typecheck · Build"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
EOF

# prod: no PR merges from people — release workflow updates this branch
gh api -X PUT "repos/$REPO/branches/prod/protection" \
  --input - <<'EOF'
{
  "required_status_checks": null,
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "lock_branch": false
}
EOF

echo ""
echo "Also create GitHub Environments: Settings → Environments"
echo "  - qa"
echo "  - production (enable required reviewers if you want a human prod gate)"
echo ""
echo "Done. Default branch tip: set repository default branch to develop."
echo "  gh repo edit $REPO --default-branch develop"
