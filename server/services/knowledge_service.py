"""Knowledge check service for quiz generation, storage, and submission verification."""

import json
import sqlite3
from typing import Dict, List, Optional


def init_quiz_tables(conn: sqlite3.Connection) -> None:
    """Initialize tables for quiz questions, options, and user attempt history."""
    conn.execute("""
        CREATE TABLE IF NOT EXISTS quiz_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
            question_text TEXT NOT NULL,
            explanation TEXT,
            options_json TEXT NOT NULL,
            correct_index INTEGER NOT NULL,
            difficulty TEXT DEFAULT 'intermediate',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_quiz_questions_course_section
        ON quiz_questions(course_id, section_id);
    """)

    conn.execute("""
        CREATE TABLE IF NOT EXISTS quiz_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
            score INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            answers_json TEXT NOT NULL,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user
        ON quiz_attempts(user_id, course_id, section_id);
    """)


def get_quiz_items(
    conn: sqlite3.Connection,
    course_id: int,
    section_id: Optional[int] = None,
    include_answers: bool = False,
) -> List[Dict]:
    """Retrieve quiz questions. When include_answers is False, hide correct_index and explanation."""
    query = """
        SELECT id, course_id, section_id, question_text, explanation, options_json, correct_index, difficulty
        FROM quiz_questions
        WHERE course_id = ?
    """
    params = [course_id]
    if section_id is not None:
        query += " AND section_id = ?"
        params.append(section_id)

    query += " ORDER BY id ASC"

    cursor = conn.execute(query, params)
    rows = cursor.fetchall()
    results = []
    for r in rows:
        row_dict = dict(r)
        options = json.loads(row_dict["options_json"])
        item = {
            "id": row_dict["id"],
            "course_id": row_dict["course_id"],
            "section_id": row_dict["section_id"],
            "question_text": row_dict["question_text"],
            "options": options,
            "difficulty": row_dict.get("difficulty", "intermediate"),
        }
        if include_answers:
            item["correct_index"] = row_dict["correct_index"]
            item["explanation"] = row_dict["explanation"]
        results.append(item)
    return results


def grade_quiz_attempt(
    conn: sqlite3.Connection,
    user_id: int,
    course_id: int,
    section_id: Optional[int],
    user_answers: Dict[int, int],
) -> Dict:
    """Grade user answers, persist attempt record, and return detailed score breakdown."""
    query = """
        SELECT id, question_text, explanation, options_json, correct_index
        FROM quiz_questions
        WHERE course_id = ?
    """
    params = [course_id]
    if section_id is not None:
        query += " AND section_id = ?"
        params.append(section_id)

    rows = conn.execute(query, params).fetchall()
    if not rows:
        return {
            "score": 0,
            "total": 0,
            "percentage": 0.0,
            "details": [],
        }

    score = 0
    details = []
    for r in rows:
        q_id = r["id"]
        correct_idx = r["correct_index"]
        selected_idx = user_answers.get(q_id)
        is_correct = selected_idx is not None and selected_idx == correct_idx
        if is_correct:
            score += 1

        details.append({
            "question_id": q_id,
            "question_text": r["question_text"],
            "options": json.loads(r["options_json"]),
            "selected_index": selected_idx,
            "correct_index": correct_idx,
            "is_correct": is_correct,
            "explanation": r["explanation"],
        })

    total = len(rows)
    percentage = round((score / total) * 100, 1) if total > 0 else 0.0

    conn.execute(
        """
        INSERT INTO quiz_attempts (user_id, course_id, section_id, score, total_questions, answers_json)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (user_id, course_id, section_id, score, total, json.dumps(user_answers)),
    )

    return {
        "score": score,
        "total": total,
        "percentage": percentage,
        "details": details,
    }


def get_user_quiz_stats(conn: sqlite3.Connection, user_id: int, course_id: int) -> List[Dict]:
    """Fetch past quiz attempt summaries grouped by section."""
    cursor = conn.execute(
        """
        SELECT a.id, a.section_id, s.title as section_title, a.score, a.total_questions, a.completed_at
        FROM quiz_attempts a
        LEFT JOIN sections s ON s.id = a.section_id
        WHERE a.user_id = ? AND a.course_id = ?
        ORDER BY a.completed_at DESC
        LIMIT 50
        """,
        (user_id, course_id),
    )
    return [dict(r) for r in cursor.fetchall()]
