# API endpoint inventory

Generated from FastAPI routes. Public frontend requests prefix paths with `/api`; Nginx strips that prefix.

| Methods | Backend path | Direct dependencies |
|---|---|---|
| GET | `/continue-watching` | get_current_user |
| GET | `/me/stats` | get_current_user |
| POST | `/progress` | get_current_user |
| GET | `/lessons/{lesson_id}/comments` | get_current_user |
| POST | `/lessons/{lesson_id}/comments` | get_current_user |
| DELETE | `/comments/{comment_id}` | get_current_user |
| GET | `/lessons/{lesson_id}/note` | get_current_user |
| PUT | `/lessons/{lesson_id}/note` | get_current_user |
| POST | `/lessons/{lesson_id}/note-images` | get_current_user |
| GET | `/notes/images/{name}` | get_current_user |
| GET | `/media/{lesson_id}` | get_current_user |
| POST | `/media/{lesson_id}/ticket` | get_current_user |
| GET, HEAD | `/play/{ticket}` | get_current_user |
| GET | `/attachments/{attachment_id}` | get_current_user |
| GET | `/subtitles/{subtitle_id}` | get_current_user |
| GET | `/auth/config` | None (public or handler-specific validation) |
| POST | `/auth/setup` | None (public or handler-specific validation) |
| POST | `/auth/login` | None (public or handler-specific validation) |
| POST | `/auth/jellyfin/login` | None (public or handler-specific validation) |
| POST | `/auth/logout` | None (public or handler-specific validation) |
| POST | `/auth/forgot-password` | None (public or handler-specific validation) |
| GET | `/auth/token/{token}` | None (public or handler-specific validation) |
| POST | `/auth/token/{token}` | None (public or handler-specific validation) |
| POST | `/auth/change-password` | get_current_user |
| GET | `/branding` | None (public or handler-specific validation) |
| GET | `/branding/logo` | None (public or handler-specific validation) |
| GET | `/branding/favicon` | None (public or handler-specific validation) |
| PUT | `/admin/branding` | require_admin |
| POST | `/admin/branding/logo` | require_admin |
| DELETE | `/admin/branding/logo` | require_admin |
| POST | `/admin/branding/favicon` | require_admin |
| DELETE | `/admin/branding/favicon` | require_admin |
| GET | `/courses` | get_current_user |
| GET | `/featured` | get_current_user |
| GET | `/courses/{course_id}` | get_current_user |
| POST | `/lessons/{lesson_id}/duration` | get_current_user |
| GET | `/admin/users` | require_admin |
| POST | `/admin/users` | require_admin |
| DELETE | `/admin/users/{user_id}` | require_admin |
| POST | `/admin/users/{user_id}/reset-password` | require_admin |
| GET | `/admin/users/{user_id}/course-access` | require_admin |
| PUT | `/admin/users/{user_id}/course-access` | require_admin |
| GET | `/admin/settings` | require_admin |
| PUT | `/admin/settings` | require_admin |
| POST | `/admin/settings/test-jellyfin` | require_admin |
| GET | `/admin/notifications` | require_admin |
| PUT | `/admin/notifications` | require_admin |
| POST | `/admin/notifications/test` | require_admin |
| GET | `/admin/email-settings` | require_admin |
| PUT | `/admin/email-settings` | require_admin |
| POST | `/admin/email-settings/test` | require_admin |
| GET | `/admin/login-history` | require_admin |
| GET | `/admin/courses` | require_admin |
| PUT | `/admin/courses/{course_id}` | require_admin |
| GET | `/admin/backup` | require_admin |
| POST | `/admin/rescan` | require_admin |
| GET | `/admin/users/{user_id}` | require_admin |
| PUT | `/admin/users/{user_id}/email` | require_admin |
| GET | `/health` | None (public or handler-specific validation) |
