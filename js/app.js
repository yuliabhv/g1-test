import { QUESTIONS } from './questions.js';
import { selectTestQuestions, selectPracticeQuestions, calculateScore, shuffleOptions } from './test-engine.js';
import { saveTestResult, saveQuestionResult, recordStudySession, recordQuestionTime } from './storage.js';
import {
  renderHome, renderStudy, renderStudyCategory,
  renderPracticeSelect, renderPracticeQuestion, renderPracticeResult,
  renderTestStart, renderTestQuestion, renderTestResult,
  renderHistory, renderStats
} from './ui.js';

const app = document.getElementById('app');

const state = {
  currentScreen: 'home',
  currentQuestions: [],
  currentIndex: 0,
  answers: [],
  timerRemaining: null,
  timerInterval: null,
  questionStartTime: null,
};

function clearTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
  state.timerRemaining = null;
}

function route() {
  clearTimer();
  const hash = location.hash || '#home';
  const parts = hash.split('/');
  const base = parts[0];
  const param = parts[1];

  app.scrollTo?.(0, 0);
  window.scrollTo(0, 0);

  switch (base) {
    case '#home':
      renderHome(app);
      break;

    case '#study':
      if (param) {
        renderStudyCategory(app, param);
      } else {
        renderStudy(app);
      }
      break;

    case '#practice':
      if (param) {
        startPractice(param);
      } else {
        renderPracticeSelect(app);
      }
      break;

    case '#test':
      renderTestStart(app);
      bindTestStart();
      break;

    case '#history':
      renderHistory(app);
      break;

    case '#stats':
      renderStats(app);
      break;

    default:
      renderHome(app);
  }
}

// ========== PRACTICE ==========

function startPractice(category) {
  const raw = selectPracticeQuestions(QUESTIONS, category, 20);
  state.currentQuestions = raw.map(q => shuffleOptions(q));
  state.currentIndex = 0;
  state.answers = new Array(state.currentQuestions.length).fill(undefined);
  recordStudySession();
  showPracticeQuestion();
}

function showPracticeQuestion() {
  if (state.currentIndex >= state.currentQuestions.length) {
    renderPracticeResult(app, state);
    return;
  }

  state.questionStartTime = Date.now();
  renderPracticeQuestion(app, state);
  bindPracticeEvents();
}

function bindPracticeEvents() {
  app.querySelectorAll('.option-btn:not(.disabled)').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      state.answers[state.currentIndex] = idx;
      if (state.questionStartTime) {
        recordQuestionTime(Date.now() - state.questionStartTime);
        state.questionStartTime = null;
      }
      const q = state.currentQuestions[state.currentIndex];
      saveQuestionResult(q.id, idx === q.correct);
      renderPracticeQuestion(app, state);

      const nextBtn = document.getElementById('next-btn');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          state.currentIndex++;
          showPracticeQuestion();
        });
      }
    });
  });
}

// ========== TEST ==========

function bindTestStart() {
  const btn = document.getElementById('start-test-btn');
  if (btn) {
    btn.addEventListener('click', startTest);
  }
}

function startTest() {
  const raw = selectTestQuestions(QUESTIONS);
  state.currentQuestions = raw.map(q => shuffleOptions(q));
  state.currentIndex = 0;
  state.answers = new Array(40).fill(undefined);
  state.timerRemaining = 24 * 60; // 24 minutes
  recordStudySession();

  state.timerInterval = setInterval(() => {
    if (state.timerRemaining === null) return;
    const now = Date.now();
    state.timerRemaining--;
    if (state.timerRemaining <= 0) {
      finishTest();
    } else {
      // Just update timer display
      const timerEl = app.querySelector('.timer');
      if (timerEl) {
        const min = Math.floor(state.timerRemaining / 60);
        const sec = state.timerRemaining % 60;
        timerEl.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
        if (state.timerRemaining < 120) {
          timerEl.classList.add('warning');
        }
      }
    }
  }, 1000);

  showTestQuestion();
}

function showTestQuestion() {
  renderTestQuestion(app, state);
  bindTestEvents();
}

function bindTestEvents() {
  app.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index);
      state.answers[state.currentIndex] = idx;
      // Re-render to show selection
      showTestQuestion();
    });
  });

  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      state.currentIndex++;
      showTestQuestion();
    });
  }

  const prevBtn = document.getElementById('prev-btn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      state.currentIndex--;
      showTestQuestion();
    });
  }

  const finishBtn = document.getElementById('finish-btn');
  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      const unanswered = state.answers.filter(a => a === undefined).length;
      if (unanswered > 0) {
        if (!confirm(`У вас ${unanswered} вопрос(ов) без ответа. Завершить экзамен?`)) return;
      }
      finishTest();
    });
  }
}

function finishTest() {
  clearTimer();
  const score = calculateScore(state.currentQuestions, state.answers);

  // Save question results
  state.currentQuestions.forEach((q, i) => {
    if (state.answers[i] !== undefined) {
      saveQuestionResult(q.id, state.answers[i] === q.correct);
    }
  });

  // Save test result
  saveTestResult({
    signsCorrect: score.signsCorrect,
    signsTotal: score.signsTotal,
    rulesCorrect: score.rulesCorrect,
    rulesTotal: score.rulesTotal,
    totalCorrect: score.totalCorrect,
    totalQuestions: score.totalQuestions,
    percentage: score.percentage,
    passed: score.passed
  });

  renderTestResult(app, score, state);
}

// ========== INIT ==========
window.addEventListener('hashchange', route);
route();
