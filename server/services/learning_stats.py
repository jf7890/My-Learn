"""Read-only learner statistics shared by self-service and administrator routes."""
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

LEARNING_TIMEZONE = ZoneInfo("Asia/Ho_Chi_Minh")

def compute_streak(date_strings, today=None):
    dates = set(date_strings)
    cursor = today or datetime.now(LEARNING_TIMEZONE).date()
    if cursor.isoformat() not in dates:
        cursor -= timedelta(days=1)
    streak = 0
    while cursor.isoformat() in dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak

def get_learning_stats(user_id: int, is_admin: bool = False):
    from db import get_conn
    admin = int(is_admin)
    with get_conn() as conn:
        lessons_completed = conn.execute(
            "SELECT COUNT(*) c FROM progress p JOIN lessons l ON l.id=p.lesson_id JOIN sections s ON s.id=l.section_id "
            "WHERE p.user_id=? AND p.completed=1 AND (?=1 OR EXISTS (SELECT 1 FROM course_access a WHERE a.user_id=? AND a.course_id=s.course_id))",
            (user_id, admin, user_id),
        ).fetchone()["c"]
        courses_completed = conn.execute(
            "SELECT COUNT(*) c FROM (SELECT s.course_id, COUNT(l.id) total, SUM(CASE WHEN p.completed=1 THEN 1 ELSE 0 END) done "
            "FROM lessons l JOIN sections s ON l.section_id=s.id LEFT JOIN progress p ON p.lesson_id=l.id AND p.user_id=? "
            "WHERE (?=1 OR EXISTS (SELECT 1 FROM course_access a WHERE a.user_id=? AND a.course_id=s.course_id)) "
            "GROUP BY s.course_id HAVING total>0 AND total=done)",
            (user_id, admin, user_id),
        ).fetchone()["c"]
        watch_seconds = conn.execute(
            "SELECT COALESCE(SUM(COALESCE(l.duration_seconds,p.position_seconds)),0) s FROM progress p "
            "JOIN lessons l ON l.id=p.lesson_id JOIN sections s ON s.id=l.section_id WHERE p.user_id=? AND p.completed=1 "
            "AND (?=1 OR EXISTS (SELECT 1 FROM course_access a WHERE a.user_id=? AND a.course_id=s.course_id))",
            (user_id, admin, user_id),
        ).fetchone()["s"]
        user = conn.execute("SELECT created_at FROM users WHERE id=?", (user_id,)).fetchone()
        dates = conn.execute("SELECT DISTINCT day d FROM first_video_completions WHERE user_id=? AND day IS NOT NULL", (user_id,)).fetchall()
    return {"lessons_completed": lessons_completed, "courses_completed": courses_completed,
            "watch_seconds": watch_seconds, "member_since": user["created_at"] if user else None,
            "streak_days": compute_streak([row["d"] for row in dates]), "streak_today": datetime.now(ZoneInfo("Asia/Ho_Chi_Minh")).date().isoformat() in [row["d"] for row in dates]}


