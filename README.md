# My-Learn

Self-hosted learning workspace for small teams. React frontend, FastAPI backend, SQLite and original video files on disk. Derived from Self Learn/uLearn; retain the included license.

## Features
- Cookie-authenticated local accounts and admin-managed course ACLs.
- Original MP4 Range playback, session-bound playback tickets and automatic renewal.
- Private rich-text notes/images, progress and browser print/PDF.
- Soft sky/ivory and contrast dark appearances.
- Daily streak for first completion of a new video, Asia/Ho_Chi_Minh calendar days.
- Shared Profile/Settings, password change and per-user administration pages.
- Admin password resets, masked generated credentials and clipboard/reveal controls.

## Structure
```text
frontend/src/
  components/       pages and reusable UI (CourseAccessEditor is independent)
  features/player/  player timeline, audio persistence and helpers
  api.js            same-origin API client
server/
  routers/          HTTP validation, auth dependencies and responses
  services/         shared statistics, playback tickets, Range and note sanitization
  access/           server-side authorization and filesystem path policies
  db.py             SQLite schema and additive initialization
  scanner.py        course discovery
  auth.py           password hashing and cookie JWT authentication
  schemas.py        request models
tests/              backend helper regression tests
deploy/             Nginx and systemd templates
docs/API.md         generated endpoint inventory
```

Routers must not call other route handlers. Shared behavior belongs in services. Frontend detail pages must not import the admin dashboard to access a reusable widget.

## Local development
Requires Python 3, Node.js compatible with Vite 7, FFmpeg/FFprobe.
```bash
git clone https://github.com/jf7890/My-Learn.git
cd My-Learn
cp .env.example .env
# Set a random SECRET_KEY. Only for local HTTP: SESSION_COOKIE_SECURE=false.
./run-local.sh
```
Store private files in `data/` and original course directories in `courses/`; both are ignored by Git. Never commit .env, credentials, databases, user uploads or media. Database paths use ULEARN_DB for backward compatibility.

**HTTP preview limitation:** strict video Fetch Metadata checks require a trustworthy browser context. Use trusted HTTPS for network previews; HTTP on a LAN IP can return playback 403. Do not disable the video checks or ship a self-signed preview proxy to production.

## Production
Public HTTPS → Cloudflare Tunnel → Nginx static frontend on :4173 → FastAPI on loopback :8000. Production project path in systemd template: `/root/My-Learn`. Existing unit name remains `selflearn-api.service`, static root `/var/www/selflearn`, preserving deployment compatibility.

Keep SESSION_COOKIE_SECURE=true; use a strong SECRET_KEY and accurate CORS_ORIGINS. Never run Vite dev/preview as the production service. The .env example defaults to secure cookies.

Before release:
1. Inspect the diff and run tests/build below.
2. Back up SQLite with its backup API and preserve notes/images, branding, environment, current static assets and service config.
3. Pull the approved commit with `git pull --ff-only`; build locked dependencies.
4. Preserve original courses and database, never replace them with preview data. Do not rescan simply to deploy UI changes.
5. Deploy static assets and restart the API, then check health, unauthorized access, login, video Range, ACLs and private notes.
6. Keep previous code/service/static assets and compatible database backup for rollback.

`deploy-production.sh` is an installer, **not a backup/rollback orchestrator**. Review it before executing; it modifies Nginx/systemd. Original operations notes are archived at docs/OPERATIONS-LEGACY.md and may reference the former path.

## Validation
```bash
.venv/bin/python -m unittest discover -s tests
.venv/bin/python -m compileall -q server
npm --prefix frontend ci
npm --prefix frontend run build
npm --prefix frontend audit
```
Helper tests and successful builds are not a substitute for authenticated browser/integration tests. Endpoint list: [docs/API.md](docs/API.md).

## Security model and current limitations
- Server checks account authorization and course ACLs; UI/localStorage metadata is not authoritative.
- Passwords are bcrypt hashes; generated resets are displayed only in the active UI and responses use no-store.
- Self-service change checks the existing password; admin email override reauthenticates the admin. Recovery/reset links are invalidated on credential changes.
- **Existing JWT sessions are not yet revoked by password changes/resets.** Treat this as a security follow-up, not a completed feature.
- Recovery email in user Settings is a placeholder pending mailbox verification. Admin email override writes directly and does not verify mailbox ownership. SMTP delivery must be tested separately.
- Streak is based on accepted completion events, not proof that every second of a video was watched. Historical completed videos are excluded from new streak credit because reliable original completion dates are unavailable.
- Clipboard can be blocked by browser policy. Masking protects shoulder-surfing, not someone controlling DevTools or the device.
- Large frontend bundle and incremental CSS layers remain optimization work. Full user-flow, accessibility and visual regression coverage remain pending.

## API review notes
- New admin user detail/email endpoints require require_admin; password changes require authenticated identity.
- User statistics are shared through services.learning_stats, not cross-router calls.
- See generated inventory for each route and direct dependency. The inventory is not proof of complete authorization correctness; course ACLs can be enforced within handlers/services.
- API compatibility is intentionally preserved in this cleanup. No production database migration or deploy is implied by a documentation/refactor commit.
