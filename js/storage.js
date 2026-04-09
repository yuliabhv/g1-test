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

export function clearAllData() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(PREFIX)) keys.push(key);
  }
  keys.forEach(k => localStorage.removeItem(k));
}
