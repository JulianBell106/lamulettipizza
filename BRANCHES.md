# Stalliq — Branch & Environment Guide

## Branches

| Branch | Purpose | Netlify site | Firebase project |
|---|---|---|---|
| `main` | Production — La Muletti live system | `lamuletti-stalliq.netlify.app` | `stalliq-production` |
| `develop` | Active development & testing | `stalliq-demo.netlify.app` | `stalliq` (dev sandbox) |

## Rules

- **Never commit directly to `main`.** All work starts on `develop`.
- **Never merge `firebase.js` across branches.** Each branch holds its own credentials. This is enforced by `.gitattributes` (`merge=ours`), but double-check after every merge.
- **Deploy workflow:** finish feature on `develop` → test on stalliq-demo → merge to `main` → La Muletti site auto-deploys.

## Merging develop → main

```
GitHub Desktop:
  1. Switch to main
  2. Branch → Merge into current branch → develop
  3. VERIFY firebase.js still has PRODUCTION credentials (check projectId = "stalliq-production")
  4. Push main → Netlify auto-deploys
```

## firebase.js

- `develop` branch: points to `stalliq` Firebase project (sandbox — safe to wipe)
- `main` branch: points to `stalliq-production` Firebase project (La Muletti live data)
- These files are **intentionally different** and must never be merged into each other.

## Future customers

Each new customer gets:
- Their own Firebase project
- Their own Netlify site tracking `main`
- Their own `config.js` (brand, menu, settings)
- Their own `firebase.js` with their project credentials
