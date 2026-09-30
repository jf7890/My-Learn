# Self Learn UI — review build

This independent project starts from jf7890/Self-learn and retains its backend source and license. It is a work-in-progress review branch, NOT a production deployment or a completed end-to-end validation.

## Implemented
- Forest/sage workspace design tokens, desktop navigation rail and responsive navigation.
- Library welcome panel with real API-derived course counts, search label, library hierarchy and updated cards.
- Split login layout, explicit input labels and autocomplete.
- Shared profile/form presentation, visible keyboard focus, skip link and reduced-motion support.
- Existing course, player, notes and admin functionality retained; detailed visual review of those screens remains pending.

## Design provenance
Guidance: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill at 09170eec67eefd46a7ae85de61b40c194020f997. Used its local design-system search. Generated guidance is in design-system/. The generic search recommended children's fonts and a marketing landing pattern; these are not appropriate for adult technical learning. Implementation intentionally retains Inter/Space Grotesk, uses a workspace layout and muted forest/sage palette instead. No third-party installer was run.

## Checks
- `cd frontend && npm ci && npm run build`
- `npm audit --omit=dev`: zero reported vulnerabilities at review time.
- Vite warns about the ~791 kB JavaScript chunk; splitting is pending.
- Browser and authenticated integration checks are pending. A successful build is not proof of runtime correctness.

## Safety and review
No real database, course videos, user notes, .env or node_modules belong in this repository. Existing backend files are retained without source changes. Cookie auth, ACLs, playback tickets/renewal and original Range playback are not intentionally changed.

Do not run deploy-production.sh against production until the owner approves. The inherited script is not a backup/rollback orchestrator. Deployment must first back up SQLite safely and existing static assets, preserve .env and courses/data directories, build the approved commit, run health/auth/media/notes checks and retain rollback. Never delete the live project directory or database to install this UI. Serve built assets with Nginx and the API on the same origin; never use Vite development serving in production. Production requires SESSION_COOKIE_SECURE=true.
