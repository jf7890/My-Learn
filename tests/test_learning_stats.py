"""Deterministic streak rules; never use wall-clock dates in expectations."""
import sys
import unittest
from datetime import date
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'server'))
from services.learning_stats import compute_streak

class StreakTests(unittest.TestCase):
    def test_empty(self):
        self.assertEqual(compute_streak([], date(2026, 9, 30)), 0)
    def test_duplicates_count_once(self):
        self.assertEqual(compute_streak(['2026-09-30'] * 3, date(2026, 9, 30)), 1)
    def test_yesterday_keeps_streak_alive(self):
        self.assertEqual(compute_streak(['2026-09-29', '2026-09-28'], date(2026, 9, 30)), 2)
    def test_missed_day_breaks_streak(self):
        self.assertEqual(compute_streak(['2026-09-28'], date(2026, 9, 30)), 0)
    def test_month_boundary(self):
        self.assertEqual(compute_streak(['2026-10-01', '2026-09-30'], date(2026, 10, 1)), 2)
    def test_future_is_not_counted(self):
        self.assertEqual(compute_streak(['2026-10-01'], date(2026, 9, 30)), 0)
