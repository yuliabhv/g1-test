export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function selectTestQuestions(questions) {
  const signs = shuffle(questions.filter(q => q.section === 'signs')).slice(0, 20);
  const rules = shuffle(questions.filter(q => q.section === 'rules')).slice(0, 20);
  return [...signs, ...rules];
}

export function selectPracticeQuestions(questions, category, count = 20) {
  let pool = questions;
  if (category && category !== 'all') {
    pool = questions.filter(q => q.category === category);
  }
  return shuffle(pool).slice(0, count);
}

export function calculateScore(questions, answers) {
  let signsCorrect = 0, signsTotal = 0;
  let rulesCorrect = 0, rulesTotal = 0;

  questions.forEach((q, i) => {
    const isCorrect = answers[i] === q.correct;
    if (q.section === 'signs') {
      signsTotal++;
      if (isCorrect) signsCorrect++;
    } else {
      rulesTotal++;
      if (isCorrect) rulesCorrect++;
    }
  });

  const totalCorrect = signsCorrect + rulesCorrect;
  const totalQuestions = questions.length;
  const signsPassed = signsTotal > 0 ? signsCorrect >= Math.ceil(signsTotal * 0.8) : true;
  const rulesPassed = rulesTotal > 0 ? rulesCorrect >= Math.ceil(rulesTotal * 0.8) : true;

  return {
    signsCorrect,
    signsTotal,
    rulesCorrect,
    rulesTotal,
    totalCorrect,
    totalQuestions,
    percentage: Math.round((totalCorrect / totalQuestions) * 100),
    signsPassed,
    rulesPassed,
    passed: signsPassed && rulesPassed
  };
}

export function shuffleOptions(question) {
  const indices = question.options.map((_, i) => i);
  const shuffled = shuffle(indices);
  const newOptions = shuffled.map(i => question.options[i]);
  const newCorrect = shuffled.indexOf(question.correct);
  return { ...question, options: newOptions, correct: newCorrect, _originalCorrect: question.correct };
}
