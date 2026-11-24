import { useState, useEffect } from "react";
import { api } from "../api";
import { IconCheck, IconAward, IconHelpCircle } from "../icons";

export default function KnowledgeCheck() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courseDetail, setCourseDetail] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [userAnswers, setUserAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const list = await api.getCourses();
      setCourses(list || []);
      if (list && list.length > 0) {
        const ccnaCourse = list.find((c) => c.title.toLowerCase().includes("ccna")) || list[0];
        setSelectedCourseId(ccnaCourse.id);
      }
    } catch (err) {
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCourseId) return;
    loadCourseDetails(selectedCourseId);
    loadHistory(selectedCourseId);
  }, [selectedCourseId]);

  const loadCourseDetails = async (courseId) => {
    try {
      const detail = await api.getCourse(courseId);
      setCourseDetail(detail);
      // Auto-select first section or all
      if (detail?.sections && detail.sections.length > 0) {
        setSelectedSectionId(detail.sections[0].id);
      } else {
        setSelectedSectionId("");
      }
    } catch (err) {
      console.error("Failed to load course detail:", err);
    }
  };

  const loadHistory = async (courseId) => {
    try {
      const res = await api.getKnowledgeHistory(courseId);
      setHistory(res?.history || []);
    } catch (err) {
      console.error("Failed to load quiz history:", err);
    }
  };

  useEffect(() => {
    if (!selectedCourseId) return;
    fetchQuestions();
  }, [selectedCourseId, selectedSectionId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      setQuizResult(null);
      setUserAnswers({});
      const res = await api.getKnowledgeQuestions(selectedCourseId, selectedSectionId || null);
      setQuestions(res?.questions || []);
    } catch (err) {
      setError(err.message || "Failed to fetch quiz questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    if (quizResult) return; // Locked after submission
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(userAnswers).length === 0) {
      alert("Please select at least one answer before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.submitKnowledgeQuiz({
        course_id: Number(selectedCourseId),
        section_id: selectedSectionId ? Number(selectedSectionId) : null,
        answers: userAnswers,
      });
      setQuizResult(res);
      loadHistory(selectedCourseId);
    } catch (err) {
      alert(err.message || "Failed to evaluate quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setQuizResult(null);
  };

  return (
    <div className="kc-container">
      <div className="kc-header">
        <div className="kc-badge">
          <IconAward width={18} height={18} />
          <span>CCNA & Network Knowledge Check</span>
        </div>
        <h1 className="kc-title">Interactive Knowledge Assessment</h1>
        <p className="kc-subtitle">
          Test your comprehension of core networking concepts, protocols, frames, and device behaviors.
        </p>
      </div>

      <div className="kc-toolbar">
        <div className="kc-field">
          <label>Course:</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="kc-select"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="kc-field">
          <label>Topic / Section:</label>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="kc-select"
          >
            <option value="">All Topics</option>
            {courseDetail?.sections?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>

        <button onClick={fetchQuestions} className="btn btn-secondary btn-sm" disabled={loading}>
          Reload Questions
        </button>
      </div>

      {loading && <div className="kc-status">Loading questions...</div>}
      {error && <div className="kc-error">{error}</div>}

      {!loading && questions.length === 0 && (
        <div className="kc-empty">
          <IconHelpCircle width={40} height={40} style={{ opacity: 0.5, marginBottom: 12 }} />
          <p>No questions currently found for this section.</p>
        </div>
      )}

      {quizResult && (
        <div className={`kc-result-card ${quizResult.percentage >= 80 ? "pass" : "review"}`}>
          <div className="kc-result-score">
            <h2>
              {quizResult.score} / {quizResult.total}
            </h2>
            <span>Score: {quizResult.percentage}%</span>
          </div>
          <p className="kc-result-feedback">
            {quizResult.percentage >= 80
              ? "Great job! You have demonstrated strong grasp of these networking topics."
              : "Keep practicing! Review the detailed explanations below to cement the foundational theory."}
          </p>
          <button onClick={resetQuiz} className="btn btn-primary btn-sm">
            Retake Quiz
          </button>
        </div>
      )}

      {!loading && questions.length > 0 && (
        <form onSubmit={handleSubmit} className="kc-questions-list">
          {questions.map((q, idx) => {
            const resultDetail = quizResult?.details?.find((d) => d.question_id === q.id);
            const isAnswered = userAnswers[q.id] !== undefined;

            return (
              <div
                key={q.id}
                className={`kc-question-card ${
                  resultDetail ? (resultDetail.is_correct ? "correct-card" : "wrong-card") : ""
                }`}
              >
                <div className="kc-q-header">
                  <span className="kc-q-num">Question {idx + 1}</span>
                  <span className="kc-q-diff">{q.difficulty}</span>
                </div>
                <h3 className="kc-q-text">{q.question_text}</h3>

                <div className="kc-options">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userAnswers[q.id] === optIdx;
                    let optionClass = "kc-option";

                    if (quizResult && resultDetail) {
                      if (optIdx === resultDetail.correct_index) {
                        optionClass += " option-correct";
                      } else if (isSelected && !resultDetail.is_correct) {
                        optionClass += " option-wrong";
                      }
                    } else if (isSelected) {
                      optionClass += " option-selected";
                    }

                    return (
                      <div
                        key={optIdx}
                        className={optionClass}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                      >
                        <span className="kc-option-radio">
                          {isSelected && <span className="kc-option-dot" />}
                        </span>
                        <span className="kc-option-label">{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {quizResult && resultDetail && (
                  <div className="kc-explanation">
                    <strong>Explanation:</strong> {resultDetail.explanation}
                  </div>
                )}
              </div>
            );
          })}

          {!quizResult && (
            <div className="kc-submit-box">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || questions.length === 0}
              >
                {submitting ? "Evaluating..." : "Submit Answers"}
              </button>
            </div>
          )}
        </form>
      )}

      {history.length > 0 && (
        <div className="kc-history-section">
          <h3>Your Recent Assessments</h3>
          <div className="kc-history-list">
            {history.slice(0, 5).map((h) => (
              <div key={h.id} className="kc-history-item">
                <div>
                  <strong>{h.section_title || "General Assessment"}</strong>
                  <div className="kc-history-date">{new Date(h.completed_at).toLocaleString()}</div>
                </div>
                <div className="kc-history-score">
                  {h.score} / {h.total_questions} ({Math.round((h.score / h.total_questions) * 100)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .kc-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px 16px 80px 16px;
        }
        .kc-header {
          margin-bottom: 24px;
        }
        .kc-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px;
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent, #3b82f6);
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 12px;
        }
        .kc-title {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: var(--text, #111827);
        }
        .kc-subtitle {
          color: var(--text-muted, #6b7280);
          font-size: 15px;
          margin: 0;
        }
        .kc-toolbar {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
          padding: 16px;
          background: var(--surface, #f9fafb);
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 10px;
          margin-bottom: 24px;
        }
        .kc-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          min-width: 200px;
        }
        .kc-field label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted, #6b7280);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .kc-select {
          padding: 8px 12px;
          background: var(--bg, #ffffff);
          border: 1px solid var(--border, #d1d5db);
          border-radius: 6px;
          font-size: 14px;
          color: var(--text, #111827);
          outline: none;
        }
        .kc-status, .kc-empty {
          text-align: center;
          padding: 48px 16px;
          color: var(--text-muted, #6b7280);
        }
        .kc-error {
          padding: 12px 16px;
          background: #fee2e2;
          color: #b91c1c;
          border-radius: 8px;
          margin-bottom: 16px;
        }
        .kc-result-card {
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
          border: 1px solid;
        }
        .kc-result-card.pass {
          background: rgba(16, 185, 129, 0.08);
          border-color: #10b981;
        }
        .kc-result-card.review {
          background: rgba(245, 158, 11, 0.08);
          border-color: #f59e0b;
        }
        .kc-result-score h2 {
          font-size: 32px;
          margin: 0;
          color: var(--text, #111827);
        }
        .kc-result-score span {
          font-weight: 600;
          font-size: 16px;
        }
        .kc-result-feedback {
          margin: 0;
          max-width: 500px;
          color: var(--text-muted, #4b5563);
        }
        .kc-questions-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .kc-question-card {
          padding: 20px;
          background: var(--bg, #ffffff);
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 12px;
          transition: border-color 0.2s;
        }
        .kc-question-card.correct-card {
          border-color: #10b981;
        }
        .kc-question-card.wrong-card {
          border-color: #ef4444;
        }
        .kc-q-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .kc-q-num {
          font-size: 12px;
          font-weight: 600;
          color: var(--accent, #3b82f6);
          text-transform: uppercase;
        }
        .kc-q-diff {
          font-size: 11px;
          padding: 2px 8px;
          background: var(--surface, #f3f4f6);
          border-radius: 4px;
          color: var(--text-muted, #6b7280);
          text-transform: capitalize;
        }
        .kc-q-text {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 16px 0;
          line-height: 1.5;
          color: var(--text, #111827);
        }
        .kc-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .kc-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .kc-option:hover {
          border-color: var(--accent, #3b82f6);
          background: rgba(59, 130, 246, 0.02);
        }
        .kc-option.option-selected {
          border-color: var(--accent, #3b82f6);
          background: rgba(59, 130, 246, 0.06);
        }
        .kc-option.option-correct {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }
        .kc-option.option-wrong {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }
        .kc-option-radio {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid var(--border, #9ca3af);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .kc-option.option-selected .kc-option-radio {
          border-color: var(--accent, #3b82f6);
        }
        .kc-option-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent, #3b82f6);
        }
        .kc-option.option-correct .kc-option-dot {
          background: #10b981;
        }
        .kc-option-label {
          font-size: 14px;
          color: var(--text, #1f2937);
        }
        .kc-explanation {
          margin-top: 14px;
          padding: 12px 14px;
          background: var(--surface, #f9fafb);
          border-left: 3px solid var(--accent, #3b82f6);
          border-radius: 4px;
          font-size: 13px;
          color: var(--text-muted, #4b5563);
          line-height: 1.5;
        }
        .kc-submit-box {
          display: flex;
          justify-content: flex-end;
          margin-top: 12px;
        }
        .kc-history-section {
          margin-top: 48px;
          border-top: 1px solid var(--border, #e5e7eb);
          padding-top: 24px;
        }
        .kc-history-section h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .kc-history-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .kc-history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--surface, #f9fafb);
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 8px;
          font-size: 14px;
        }
        .kc-history-date {
          font-size: 12px;
          color: var(--text-muted, #6b7280);
          margin-top: 2px;
        }
        .kc-history-score {
          font-weight: 700;
          color: var(--accent, #3b82f6);
        }
      `}</style>
    </div>
  );
}
