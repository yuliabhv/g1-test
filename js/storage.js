const PREFIX = 'g1ru_';

function get(key) {
  try {
    const val = localStorage.getItem(PREFIX + key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

function set(key, val) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(val));
  } catch {}
}

export function saveTestResult(result) {
  const history = getTestHistory();
  history.push({
    ...result,
    date: new Date().toISOString()
  });
  set('test_history', history);
}

export function getTestHistory() {
  return get('test_history') || [];
}

export function saveQuestionResult(questionId, correct) {
  const stats = get('question_stats') || {};
  if (!stats[questionId]) {
    stats[questionId] = { correct: 0, wrong: 0 };
  }
  if (correct) {
    stats[questionId].correct++;
  } else {
    stats[questionId].wrong++;
  }
  set('question_stats', stats);
}

export function getQuestionStats() {
  return get('question_stats') || {};
}

export function getCategoryProgress(questions) {
  const stats = getQuestionStats();
  const categories = {};

  for (const q of questions) {
    if (!categories[q.category]) {
      categories[q.category] = { total: 0, mastered: 0 };
    }
    categories[q.category].total++;
    const s = stats[q.id];
    if (s && s.correct > 0 && s.correct >= s.wrong) {
      categories[q.category].mastered++;
    }
  }

  return categories;
}

export function getOverallProgress(questions) {
  const stats = getQuestionStats();
  let mastered = 0;
  for (const q of questions) {
    const s = stats[q.id];
    if (s && s.correct > 0 && s.correct >= s.wrong) {
      mastered++;
    }
  }
  return { mastered, total: questions.length };
}

export function recordStudySession() {
  const today = new Date().toISOString().slice(0, 10);
  const sessions = get('study_sessions') || {};
  sessions[today] = (sessions[today] || 0) + 1;
  set('study_sessions', sessions);
}

export function getStudySessions() {
  return get('study_sessions') || {};
}

export function getStreak() {
  const sessions = getStudySessions();
  const dates = Object.keys(sessions).sort().reverse();
  if (dates.length === 0) return { current: 0, best: 0, totalDays: 0 };

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  let current = 0;
  let checkDate = dates.includes(today) ? today : (dates.includes(yesterday) ? yesterday : null);

  if (checkDate) {
    let d = new Date(checkDate);
    while (sessions[d.toISOString().slice(0, 10)]) {
      current++;
      d = new Date(d.getTime() - 86400000);
    }
  }

  // Best streak
  let best = 0, streak = 1;
  const sorted = Object.keys(sessions).sort();
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    if (curr - prev === 86400000) {
      streak++;
    } else {
      best = Math.max(best, streak);
      streak = 1;
    }
  }
  best = Math.max(best, streak);
  if (sorted.length === 0) best = 0;

  return { current, best, totalDays: sorted.length };
}

export function recordQuestionTime(ms) {
  const times = get('question_times') || [];
  times.push(ms);
  if (times.length > 500) times.splice(0, times.length - 500);
  set('question_times', times);
}

export function getTimeStats() {
  const times = get('question_times') || [];
  if (times.length === 0) return { avg: 0, total: 0, count: 0 };
  const total = times.reduce((a, b) => a + b, 0);
  return {
    avg: Math.round(total / times.length),
    total,
    count: times.length
  };
}

export function getTotalAnswered() {
  const stats = getQuestionStats();
  let total = 0;
  for (const id in stats) {
    total += stats[id].correct + stats[id].wrong;
  }
  return total;
}

export function clearAllData() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(PREFIX)) keys.push(key);
  }
  keys.forEach(k => localStorage.removeItem(k));
}
