import { CATEGORIES, QUESTIONS } from './questions.js';
import { getOverallProgress, getCategoryProgress, getTestHistory, getStreak, getTimeStats, getTotalAnswered, getQuestionStats } from './storage.js';

const LETTERS = ['А', 'Б', 'В', 'Г'];

export function renderHome(container) {
  const progress = getOverallProgress(QUESTIONS);
  const pct = progress.total > 0 ? Math.round((progress.mastered / progress.total) * 100) : 0;
  const history = getTestHistory();
  const lastTest = history.length > 0 ? history[history.length - 1] : null;

  container.innerHTML = `
    <div class="header">
      <h1>G1 Тест Онтарио</h1>
      <p>Подготовка к экзамену на русском языке</p>
    </div>

    <div class="card">
      <div style="text-align:center;margin-bottom:8px;font-weight:600;">Ваш прогресс</div>
      <div class="progress-bar">
        <div class="progress-fill success" style="width:${pct}%"></div>
      </div>
      <div style="text-align:center;font-size:0.85rem;color:var(--text-secondary)">
        ${progress.mastered} из ${progress.total} вопросов изучено (${pct}%)
      </div>
      ${lastTest ? `
        <div style="text-align:center;font-size:0.85rem;color:var(--text-secondary);margin-top:8px">
          Последний экзамен: ${lastTest.passed ? '✅ Сдан' : '❌ Не сдан'} (${lastTest.percentage}%)
        </div>
      ` : ''}
    </div>

    <a href="#study" class="mode-card">
      <div class="mode-icon">📖</div>
      <div class="mode-info">
        <h3>Изучение</h3>
        <p>Просмотр всех вопросов с ответами по категориям</p>
      </div>
    </a>

    <a href="#practice" class="mode-card">
      <div class="mode-icon">✏️</div>
      <div class="mode-info">
        <h3>Практика</h3>
        <p>Отвечайте на вопросы с мгновенной обратной связью</p>
      </div>
    </a>

    <a href="#test" class="mode-card">
      <div class="mode-icon">🎓</div>
      <div class="mode-info">
        <h3>Пробный экзамен</h3>
        <p>40 вопросов как на настоящем тесте G1 (80% для сдачи)</p>
      </div>
    </a>

    <a href="#stats" class="mode-card">
      <div class="mode-icon">📊</div>
      <div class="mode-info">
        <h3>Статистика</h3>
        <p>Прогресс, серии, точность и время</p>
      </div>
    </a>

    <a href="#history" class="mode-card">
      <div class="mode-icon">📜</div>
      <div class="mode-info">
        <h3>История</h3>
        <p>Результаты пробных экзаменов</p>
      </div>
    </a>

    <div class="card" style="margin-top:16px;font-size:0.8rem;color:var(--text-secondary)">
      <strong>О тесте G1:</strong> 40 вопросов (20 знаков + 20 правил). Нужно 16/20 (80%) в каждой секции.
      Стоимость: $158.25. Без ограничения по времени.
    </div>
  `;
}

export function renderStudy(container) {
  const catProgress = getCategoryProgress(QUESTIONS);

  container.innerHTML = `
    <button class="back-btn" onclick="location.hash='#home'">&larr; Назад</button>
    <h2 class="section-title">Изучение по категориям</h2>
    <p class="section-subtitle">Просмотрите все вопросы с правильными ответами</p>
    <ul class="category-list">
      ${CATEGORIES.map(cat => {
        const count = QUESTIONS.filter(q => q.category === cat.id).length;
        const cp = catProgress[cat.id];
        const pct = cp ? Math.round((cp.mastered / cp.total) * 100) : 0;
        return `
          <li class="category-item" onclick="location.hash='#study/${cat.id}'">
            <div class="category-left">
              <span class="category-icon">${cat.icon}</span>
              <span class="category-name">${cat.name}</span>
            </div>
            <span class="category-count">${count} вопр.</span>
          </li>`;
      }).join('')}
    </ul>
  `;
}

export function renderStudyCategory(container, categoryId) {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  if (!cat) { container.innerHTML = '<p>Категория не найдена</p>'; return; }

  const questions = QUESTIONS.filter(q => q.category === categoryId);

  container.innerHTML = `
    <button class="back-btn" onclick="location.hash='#study'">&larr; Назад</button>
    <h2 class="section-title">${cat.icon} ${cat.name}</h2>
    <p class="section-subtitle">${questions.length} вопросов</p>
    ${questions.map((q, i) => `
      <div class="study-question">
        <div class="sq-text">${i + 1}. ${q.question}</div>
        <ul class="sq-options">
          ${q.options.map((opt, j) => `
            <li class="${j === q.correct ? 'correct-opt' : ''}">${LETTERS[j]}) ${opt}</li>
          `).join('')}
        </ul>
        <div class="sq-explanation">${q.explanation}</div>
      </div>
    `).join('')}
  `;
}

export function renderPracticeSelect(container) {
  container.innerHTML = `
    <button class="back-btn" onclick="location.hash='#home'">&larr; Назад</button>
    <h2 class="section-title">Практика</h2>
    <p class="section-subtitle">Выберите категорию или все вопросы</p>

    <div class="category-item" onclick="location.hash='#practice/all'" style="cursor:pointer">
      <div class="category-left">
        <span class="category-icon">🔀</span>
        <span class="category-name">Все вопросы (случайные 20)</span>
      </div>
      <span class="category-count">${QUESTIONS.length}</span>
    </div>

    <ul class="category-list">
      ${CATEGORIES.map(cat => {
        const count = QUESTIONS.filter(q => q.category === cat.id).length;
        return `
          <li class="category-item" onclick="location.hash='#practice/${cat.id}'">
            <div class="category-left">
              <span class="category-icon">${cat.icon}</span>
              <span class="category-name">${cat.name}</span>
            </div>
            <span class="category-count">${count}</span>
          </li>`;
      }).join('')}
    </ul>
  `;
}

export function renderPracticeQuestion(container, state) {
  const q = state.currentQuestions[state.currentIndex];
  if (!q) return;

  const answered = state.answers[state.currentIndex] !== undefined;
  const userAnswer = state.answers[state.currentIndex];
  const isCorrect = userAnswer === q.correct;
  const total = state.currentQuestions.length;
  const current = state.currentIndex + 1;
  const pct = Math.round((current / total) * 100);

  container.innerHTML = `
    <button class="back-btn" onclick="location.hash='#practice'">&larr; Выход</button>
    <div class="progress-bar" style="margin-bottom:16px">
      <div class="progress-fill" style="width:${pct}%"></div>
    </div>
    <div class="question-card">
      <div class="question-counter">Вопрос ${current} из ${total}</div>
      <div class="question-category-tag">${CATEGORIES.find(c => c.id === q.category)?.name || q.category}</div>
      <div class="question-text">${q.question}</div>
      <ul class="options-list">
        ${q.options.map((opt, i) => {
          let cls = '';
          if (answered) {
            cls = 'disabled';
            if (i === q.correct) cls += ' correct';
            else if (i === userAnswer && userAnswer !== q.correct) cls += ' incorrect';
          }
          return `
            <li>
              <button class="option-btn ${cls}" data-index="${i}" ${answered ? 'disabled' : ''}>
                <span class="option-letter">${LETTERS[i]}</span>
                <span>${opt}</span>
              </button>
            </li>`;
        }).join('')}
      </ul>
      ${answered ? `
        <div class="explanation ${isCorrect ? 'correct' : 'incorrect'}">
          ${isCorrect ? '✅ Правильно!' : `❌ Неправильно. Правильный ответ: ${LETTERS[q.correct]}`}
          <br>${q.explanation}
        </div>
      ` : ''}
    </div>
    ${answered ? `
      <button class="btn btn-primary" id="next-btn">
        ${state.currentIndex < total - 1 ? 'Следующий вопрос →' : 'Показать результат'}
      </button>
    ` : ''}
  `;
}

export function renderPracticeResult(container, state) {
  let correct = 0;
  state.currentQuestions.forEach((q, i) => {
    if (state.answers[i] === q.correct) correct++;
  });
  const total = state.currentQuestions.length;
  const pct = Math.round((correct / total) * 100);
  const passed = pct >= 80;

  const wrongs = [];
  state.currentQuestions.forEach((q, i) => {
    if (state.answers[i] !== q.correct) {
      wrongs.push({ q, userAnswer: state.answers[i] });
    }
  });

  container.innerHTML = `
    <div class="result-banner ${passed ? 'pass' : 'fail'}">
      <div class="result-icon">${passed ? '🎉' : '📚'}</div>
      <div class="result-title">${correct} из ${total} правильно (${pct}%)</div>
      <div class="result-subtitle">${passed ? 'Отличная работа!' : 'Продолжайте практику!'}</div>
    </div>

    ${wrongs.length > 0 ? `
      <h3 class="section-title">Ошибки (${wrongs.length})</h3>
      ${wrongs.map(({ q, userAnswer }) => `
        <div class="wrong-answer">
          <div class="wa-question">${q.question}</div>
          <div class="wa-your">Ваш ответ: ${LETTERS[userAnswer]}) ${q.options[userAnswer]}</div>
          <div class="wa-correct">Правильно: ${LETTERS[q.correct]}) ${q.options[q.correct]}</div>
          <div class="wa-explanation">${q.explanation}</div>
        </div>
      `).join('')}
    ` : ''}

    <button class="btn btn-primary" onclick="location.hash='#practice'">Новая практика</button>
    <button class="btn btn-secondary" onclick="location.hash='#home'">На главную</button>
  `;
}

export function renderTestStart(container) {
  container.innerHTML = `
    <button class="back-btn" onclick="location.hash='#home'">&larr; Назад</button>
    <div class="card" style="text-align:center">
      <h2 style="font-size:1.3rem;margin-bottom:12px">🎓 Пробный экзамен G1</h2>
      <p style="margin-bottom:20px;color:var(--text-secondary)">
        Симуляция настоящего теста G1. 40 вопросов: 20 знаков + 20 правил.
        Нужно набрать 16/20 (80%) в каждой секции.
      </p>
      <div class="stats-row">
        <div class="stat-box">
          <div class="stat-value">40</div>
          <div class="stat-label">Вопросов</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">80%</div>
          <div class="stat-label">Проходной</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">20+20</div>
          <div class="stat-label">Знаки + Правила</div>
        </div>
      </div>
      <button class="btn btn-success" id="start-test-btn">Начать экзамен</button>
    </div>
  `;
}

export function renderTestQuestion(container, state) {
  const q = state.currentQuestions[state.currentIndex];
  if (!q) return;

  const total = state.currentQuestions.length;
  const current = state.currentIndex + 1;
  const pct = Math.round((current / total) * 100);
  const selected = state.answers[state.currentIndex];

  let timerHtml = '';
  if (state.timerRemaining !== null) {
    const min = Math.floor(state.timerRemaining / 60);
    const sec = state.timerRemaining % 60;
    const warn = state.timerRemaining < 120;
    timerHtml = `<div class="timer ${warn ? 'warning' : ''}">${min}:${sec.toString().padStart(2, '0')}</div>`;
  }

  container.innerHTML = `
    <div class="test-header">
      <span style="font-weight:600;font-size:0.9rem">Вопрос ${current}/${total}</span>
      ${timerHtml}
    </div>
    <div class="progress-bar" style="margin-bottom:16px">
      <div class="progress-fill" style="width:${pct}%"></div>
    </div>
    <div class="question-card">
      <div class="question-category-tag">${q.section === 'signs' ? '🚧 Знаки' : '📋 Правила'}</div>
      <div class="question-text">${q.question}</div>
      <ul class="options-list">
        ${q.options.map((opt, i) => `
          <li>
            <button class="option-btn ${selected === i ? 'selected' : ''}" data-index="${i}">
              <span class="option-letter">${LETTERS[i]}</span>
              <span>${opt}</span>
            </button>
          </li>
        `).join('')}
      </ul>
    </div>
    <div class="nav-bar">
      ${state.currentIndex > 0 ? `<button class="btn btn-secondary btn-small" id="prev-btn">&larr; Назад</button>` : '<div></div>'}
      ${state.currentIndex < total - 1
        ? `<button class="btn btn-primary btn-small" id="next-btn">Далее &rarr;</button>`
        : `<button class="btn btn-success btn-small" id="finish-btn">Завершить экзамен</button>`}
    </div>
    <div style="text-align:center;margin-top:8px">
      <span style="font-size:0.8rem;color:var(--text-secondary)">
        Отвечено: ${state.answers.filter(a => a !== undefined).length} из ${total}
      </span>
    </div>
  `;
}

export function renderTestResult(container, score, state) {
  const wrongs = [];
  state.currentQuestions.forEach((q, i) => {
    if (state.answers[i] !== q.correct) {
      wrongs.push({ q, userAnswer: state.answers[i], index: i });
    }
  });

  container.innerHTML = `
    <div class="result-banner ${score.passed ? 'pass' : 'fail'}">
      <div class="result-icon">${score.passed ? '🎉' : '😔'}</div>
      <div class="result-title">${score.passed ? 'ЭКЗАМЕН СДАН!' : 'ЭКЗАМЕН НЕ СДАН'}</div>
      <div class="result-subtitle">${score.totalCorrect}/${score.totalQuestions} правильно (${score.percentage}%)</div>
    </div>

    <div class="section-result">
      <span class="label">🚧 Знаки</span>
      <span class="score ${score.signsPassed ? 'pass' : 'fail'}">${score.signsCorrect}/${score.signsTotal} ${score.signsPassed ? '✅' : '❌'}</span>
    </div>
    <div class="section-result">
      <span class="label">📋 Правила</span>
      <span class="score ${score.rulesPassed ? 'pass' : 'fail'}">${score.rulesCorrect}/${score.rulesTotal} ${score.rulesPassed ? '✅' : '❌'}</span>
    </div>

    <p style="text-align:center;font-size:0.85rem;color:var(--text-secondary);margin:12px 0">
      Необходимо: 16/20 (80%) в каждой секции
    </p>

    ${wrongs.length > 0 ? `
      <h3 class="section-title">Разбор ошибок (${wrongs.length})</h3>
      ${wrongs.map(({ q, userAnswer, index }) => `
        <div class="wrong-answer">
          <div style="font-size:0.8rem;color:var(--text-secondary)">Вопрос ${index + 1} (${q.section === 'signs' ? 'Знаки' : 'Правила'})</div>
          <div class="wa-question">${q.question}</div>
          <div class="wa-your">Ваш ответ: ${userAnswer !== undefined ? `${LETTERS[userAnswer]}) ${q.options[userAnswer]}` : 'Без ответа'}</div>
          <div class="wa-correct">Правильно: ${LETTERS[q.correct]}) ${q.options[q.correct]}</div>
          <div class="wa-explanation">${q.explanation}</div>
        </div>
      `).join('')}
    ` : ''}

    <button class="btn btn-primary" id="start-test-btn" onclick="location.hash='#test'">Попробовать снова</button>
    <button class="btn btn-secondary" onclick="location.hash='#home'">На главную</button>
  `;
}

export function renderStats(container) {
  const progress = getOverallProgress(QUESTIONS);
  const catProgress = getCategoryProgress(QUESTIONS);
  const history = getTestHistory();
  const streak = getStreak();
  const timeStats = getTimeStats();
  const totalAnswered = getTotalAnswered();
  const questionStats = getQuestionStats();

  // Calculate accuracy
  let totalCorrect = 0, totalAttempts = 0;
  for (const id in questionStats) {
    totalCorrect += questionStats[id].correct;
    totalAttempts += questionStats[id].correct + questionStats[id].wrong;
  }
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  // Format time
  const formatMs = (ms) => {
    if (ms === 0) return '—';
    const sec = Math.round(ms / 1000);
    if (sec < 60) return `${sec} сек`;
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return `${min} мин ${s} сек`;
  };

  const formatTotalTime = (ms) => {
    if (ms === 0) return '—';
    const min = Math.round(ms / 60000);
    if (min < 60) return `${min} мин`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h} ч ${m} мин`;
  };

  // Score history chart (last 10 tests)
  const recentTests = history.slice(-10);
  const chartMax = 100;
  const chartHeight = 120;

  let chartHtml = '';
  if (recentTests.length > 0) {
    const barWidth = Math.min(32, Math.floor(280 / recentTests.length));
    chartHtml = `
      <div class="card">
        <div class="stats-card-title">История результатов</div>
        <div class="chart-container">
          <div class="chart-line" style="bottom:${(80 / chartMax) * chartHeight}px">
            <span class="chart-line-label">80%</span>
          </div>
          <div class="chart-bars">
            ${recentTests.map((t, i) => {
              const h = Math.max(4, (t.percentage / chartMax) * chartHeight);
              const passed = t.passed;
              const d = new Date(t.date);
              const label = `${d.getDate()}/${d.getMonth() + 1}`;
              return `
                <div class="chart-bar-wrap" style="width:${barWidth}px">
                  <div class="chart-bar ${passed ? 'pass' : 'fail'}" style="height:${h}px">
                    <span class="chart-bar-value">${t.percentage}%</span>
                  </div>
                  <span class="chart-bar-label">${label}</span>
                </div>`;
            }).join('')}
          </div>
        </div>
        <div style="text-align:center;font-size:0.75rem;color:var(--text-secondary);margin-top:8px">
          Последние ${recentTests.length} экзамен(ов) | Пунктир — проходной балл 80%
        </div>
      </div>`;
  }

  // Category breakdown
  const categoryHtml = CATEGORIES.map(cat => {
    const cp = catProgress[cat.id];
    if (!cp) return '';
    const pct = Math.round((cp.mastered / cp.total) * 100);
    const color = pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--error)';
    return `
      <div class="stat-category-row">
        <div class="stat-cat-info">
          <span>${cat.icon}</span>
          <span class="stat-cat-name">${cat.name}</span>
        </div>
        <div class="stat-cat-right">
          <div class="stat-cat-bar">
            <div class="stat-cat-fill" style="width:${pct}%;background:${color}"></div>
          </div>
          <span class="stat-cat-pct" style="color:${color}">${pct}%</span>
        </div>
      </div>`;
  }).join('');

  // Exams passed/failed
  const passed = history.filter(h => h.passed).length;
  const failed = history.length - passed;
  const passRate = history.length > 0 ? Math.round((passed / history.length) * 100) : 0;

  container.innerHTML = `
    <button class="back-btn" onclick="location.hash='#home'">&larr; Назад</button>
    <h2 class="section-title">Статистика</h2>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-icon">🔥</div>
        <div class="stat-card-value">${streak.current}</div>
        <div class="stat-card-label">Текущая серия (дн.)</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">🏆</div>
        <div class="stat-card-value">${streak.best}</div>
        <div class="stat-card-label">Лучшая серия</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">🎯</div>
        <div class="stat-card-value">${accuracy}%</div>
        <div class="stat-card-label">Точность</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon">📝</div>
        <div class="stat-card-value">${totalAnswered}</div>
        <div class="stat-card-label">Ответов всего</div>
      </div>
    </div>

    <div class="card">
      <div class="stats-card-title">Прогресс изучения</div>
      <div class="stats-row" style="margin:12px 0">
        <div class="stat-box">
          <div class="stat-value">${progress.mastered}</div>
          <div class="stat-label">Изучено</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${progress.total - progress.mastered}</div>
          <div class="stat-label">Осталось</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${progress.total}</div>
          <div class="stat-label">Всего</div>
        </div>
      </div>
      <div class="progress-bar" style="height:10px">
        <div class="progress-fill success" style="width:${progress.total > 0 ? Math.round((progress.mastered / progress.total) * 100) : 0}%"></div>
      </div>
    </div>

    <div class="card">
      <div class="stats-card-title">Время</div>
      <div class="stats-row" style="margin:12px 0">
        <div class="stat-box">
          <div class="stat-value" style="font-size:1.1rem">${formatMs(timeStats.avg)}</div>
          <div class="stat-label">Среднее / вопрос</div>
        </div>
        <div class="stat-box">
          <div class="stat-value" style="font-size:1.1rem">${formatTotalTime(timeStats.total)}</div>
          <div class="stat-label">Общее время</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${streak.totalDays}</div>
          <div class="stat-label">Дней занятий</div>
        </div>
      </div>
    </div>

    ${chartHtml}

    ${history.length > 0 ? `
    <div class="card">
      <div class="stats-card-title">Экзамены</div>
      <div class="stats-row" style="margin:12px 0">
        <div class="stat-box">
          <div class="stat-value" style="color:var(--success)">${passed}</div>
          <div class="stat-label">Сдано</div>
        </div>
        <div class="stat-box">
          <div class="stat-value" style="color:var(--error)">${failed}</div>
          <div class="stat-label">Не сдано</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${passRate}%</div>
          <div class="stat-label">% сдачи</div>
        </div>
      </div>
    </div>
    ` : ''}

    <div class="card">
      <div class="stats-card-title">По категориям</div>
      ${categoryHtml}
    </div>
  `;
}

export function renderHistory(container) {
  const history = getTestHistory();

  container.innerHTML = `
    <button class="back-btn" onclick="location.hash='#home'">&larr; Назад</button>
    <h2 class="section-title">История экзаменов</h2>
    ${history.length === 0 ? '<p style="color:var(--text-secondary)">Вы ещё не проходили пробный экзамен.</p>' : ''}
    ${[...history].reverse().map(h => {
      const d = new Date(h.date);
      const dateStr = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      return `
        <div class="history-item">
          <div>
            <div class="history-date">${dateStr}</div>
            <div style="font-size:0.85rem">Знаки: ${h.signsCorrect}/${h.signsTotal} | Правила: ${h.rulesCorrect}/${h.rulesTotal}</div>
          </div>
          <div class="history-score" style="color:${h.passed ? 'var(--success)' : 'var(--error)'}">
            ${h.percentage}% ${h.passed ? '✅' : '❌'}
          </div>
        </div>`;
    }).join('')}
  `;
}
