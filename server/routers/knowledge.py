"""Knowledge check and assessment router for quizzes."""

from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from access.policies import can_access_course
from auth import get_current_user, require_admin
from db import get_conn
from services.knowledge_service import (
    get_quiz_items,
    grade_quiz_attempt,
    get_user_quiz_stats,
)

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


class SubmitQuizRequest(BaseModel):
    course_id: int
    section_id: Optional[int] = None
    answers: Dict[int, int] = Field(
        default_factory=dict,
        description="Map of question_id to selected option index"
    )


class QuizQuestionCreate(BaseModel):
    course_id: int
    section_id: Optional[int] = None
    question_text: str
    options: List[str]
    correct_index: int
    explanation: Optional[str] = ""
    difficulty: Optional[str] = "intermediate"


@router.get("/courses/{course_id}/sections/{section_id}/questions")
def get_section_questions(
    course_id: int,
    section_id: int,
    current_user: dict = Depends(get_current_user),
):
    """Return public quiz questions for a section without exposing answers."""
    user_id = int(current_user["sub"])
    with get_conn() as conn:
        if not can_access_course(conn, current_user, course_id):
            raise HTTPException(status_code=403, detail="Access denied to this course")
        questions = get_quiz_items(conn, course_id, section_id=section_id, include_answers=False)
        return {"questions": questions}


@router.get("/courses/{course_id}/questions")
def get_course_questions(
    course_id: int,
    current_user: dict = Depends(get_current_user),
):
    """Return all quiz questions for a course across sections without exposing answers."""
    user_id = int(current_user["sub"])
    with get_conn() as conn:
        if not can_access_course(conn, current_user, course_id):
            raise HTTPException(status_code=403, detail="Access denied to this course")
        questions = get_quiz_items(conn, course_id, section_id=None, include_answers=False)
        return {"questions": questions}


@router.post("/submit")
def submit_quiz(
    payload: SubmitQuizRequest,
    current_user: dict = Depends(get_current_user),
):
    """Submit user answers, compute score, save attempt record, and return explanations."""
    user_id = int(current_user["sub"])
    with get_conn() as conn:
        if not can_access_course(conn, current_user, payload.course_id):
            raise HTTPException(status_code=403, detail="Access denied to this course")

        result = grade_quiz_attempt(
            conn=conn,
            user_id=user_id,
            course_id=payload.course_id,
            section_id=payload.section_id,
            user_answers=payload.answers,
        )
        return result


@router.get("/courses/{course_id}/history")
def get_quiz_history(
    course_id: int,
    current_user: dict = Depends(get_current_user),
):
    """Retrieve learner attempt history for the course."""
    user_id = int(current_user["sub"])
    with get_conn() as conn:
        if not can_access_course(conn, current_user, course_id):
            raise HTTPException(status_code=403, detail="Access denied to this course")
        history = get_user_quiz_stats(conn, user_id, course_id)
        return {"history": history}


@router.post("/questions", dependencies=[Depends(require_admin)])
def create_question(payload: QuizQuestionCreate):
    """Admin endpoint to insert or update quiz questions."""
    import json
    if payload.correct_index < 0 or payload.correct_index >= len(payload.options):
        raise HTTPException(status_code=400, detail="Invalid correct_index for options list")

    with get_conn() as conn:
        cursor = conn.execute(
            """
            INSERT INTO quiz_questions (course_id, section_id, question_text, explanation, options_json, correct_index, difficulty)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.course_id,
                payload.section_id,
                payload.question_text,
                payload.explanation,
                json.dumps(payload.options),
                payload.correct_index,
                payload.difficulty,
            ),
        )
        return {"id": cursor.lastrowid, "message": "Question created successfully"}
