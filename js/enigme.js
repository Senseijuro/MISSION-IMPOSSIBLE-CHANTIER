document.addEventListener('DOMContentLoaded', function() {
  var state = getGameState();
  var locked = document.getElementById('locked');
  var gameArea = document.getElementById('game-area');
  var resultDiv = document.getElementById('result');
  var grid = document.getElementById('ordre-grid');
  var progressEl = document.getElementById('ord-progress');
  var errorsEl = document.getElementById('ord-errors');
  var nextStepEl = document.getElementById('ord-next-step');

  // 1. BYPASS
  if (!state.quiz || state.quiz.completed === null) {
    if (locked) locked.classList.remove('hidden');
    if (gameArea) gameArea.classList.add('hidden');
    return;
  }
  if (state.enigma && state.enigma.completed !== null) {
    if (gameArea) gameArea.classList.add('hidden');
    if (locked) locked.classList.add('hidden');
    showResult(state.enigma.completed, state.enigma.score || 0);
    return;
  }
  if (locked) locked.classList.add('hidden');

  // 2. CACHER LE JEU
  if (gameArea) gameArea.classList.add('hidden');

  // 3. TUTORIEL
  Tutorial.show({
    icon: '🏗️',
    title: 'CHEF DE CHANTIER',
    subtitle: 'ÉPREUVE 3',
    description: 'Remets les étapes de construction d\'une maison dans le bon ordre chronologique.',
    steps: [
      { icon: '👀', text: 'Regarde les différentes étapes affichées en vrac.' },
      { icon: '🔢', text: 'Clique sur celle qui doit être réalisée en <strong>premier</strong>.' },
      { icon: '🧱', text: 'Continue jusqu\'à la dernière étape .' }
    ],
    warning: 'Réfléchis bien, 4 erreurs max autorisées !',
    buttonText: 'C\'EST PARTI !',
    theme: 'gold'
  }).then(function() {
    if (window.globalTimer) globalTimer.start();
    if (gameArea) gameArea.classList.remove('hidden');
    initGame();
  });

  // 4. LOGIQUE DU JEU
  function initGame() {
    var steps = [
      { order: 1, emoji: '📐', name: 'Étude du terrain',     job: 'Géomètre' },
      { order: 2, emoji: '🕳️', name: 'Terrassement',        job: 'Terrassier' },
      { order: 3, emoji: '🏗️', name: 'Fondations',          job: 'Maçon' },
      { order: 4, emoji: '🧱', name: 'Murs porteurs',        job: 'Maçon' },
      { order: 5, emoji: '🪵', name: 'Charpente',            job: 'Charpentier' },
      { order: 6, emoji: '🏠', name: 'Toiture',              job: 'Couvreur' },
      { order: 7, emoji: '⚡', name: 'Électricité & Plomberie', job: 'Électricien / Plombier' },
      { order: 8, emoji: '🎨', name: 'Finitions & Peinture', job: 'Peintre' }
    ];

    var displayOrder = getShuffledOrder('enigma', steps.length);
    var shuffledDisplay = displayOrder.map(function(i) { return steps[i]; });

    var currentStep = 1; 
    var errorCount = 0;
    var total = steps.length;

    shuffledDisplay.forEach(function(step, index) {
      var el = document.createElement('div');
      el.className = 'ordre-tile';
      el.dataset.order = step.order;
      el.dataset.index = index;
      el.innerHTML =
        '<div class="ordre-tile-num" id="num-' + index + '">' + '?' + '</div>' +
        '<span class="ordre-tile-emoji">' + step.emoji + '</span>' +
        '<div class="ordre-tile-info">' +
          '<span class="ordre-tile-name">' + step.name + '</span>' +
          '<span class="ordre-tile-job">' + step.job + '</span>' +
        '</div>';
      el.addEventListener('click', function() { selectTile(el, step); });
      grid.appendChild(el);
    });

    function updateStats() {
      if (progressEl) progressEl.textContent = '🏗️ ' + (currentStep - 1) + ' / ' + total + ' étapes';
      if (errorsEl) errorsEl.textContent = '❌ ' + errorCount + ' erreur' + (errorCount > 1 ? 's' : '');
    }

    function updateNextStep() {
      if (nextStepEl) {
        if (currentStep <= total) {
          nextStepEl.textContent = 'Étape ' + currentStep + ' — Que fait-on maintenant ?';
        } else {
          nextStepEl.textContent = 'Toutes les étapes trouvées !';
        }
      }
    }

    function selectTile(el, step) {
      if (el.classList.contains('locked')) return;

      if (step.order === currentStep) {
        el.classList.add('locked');
        var numEl = el.querySelector('.ordre-tile-num');
        if (numEl) numEl.textContent = step.order;
        currentStep++;
        updateStats();
        updateNextStep();

        if (currentStep > total) {
          endGame();
        }
      } else {
        errorCount++;
        el.classList.add('wrong-pick');
        setTimeout(function() { el.classList.remove('wrong-pick'); }, 500);
        updateStats();

        if (errorCount >= 4) {
          endGame();
        }
      }
    }

    function endGame() {
      var success = (currentStep > total) && errorCount < 4;
      if (!state.enigma) state.enigma = { completed: null };
      state.enigma.completed = success;
      state.enigma.score = currentStep - 1; // Sauvegarde du nombre d'étapes trouvées
      saveGameState(state);
      setTimeout(function() {
        if (gameArea) gameArea.classList.add('hidden');
        showResult(success, currentStep - 1);
      }, 600);
    }

    updateStats();
    updateNextStep();
  }

  // 5. FONCTION SHOWRESULT
  function showResult(success, stepsFound) {
    if (resultDiv) resultDiv.classList.remove('hidden');
    if (gameArea) gameArea.classList.add('hidden');
    if (locked) locked.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    var resultBox = document.getElementById('result-box');
    var resultIcon = document.getElementById('result-icon');
    var resultTitle = document.getElementById('result-title');
    var resultText = document.getElementById('result-text');
    var resultScore = document.getElementById('result-score');

    if (resultScore) resultScore.textContent = stepsFound + ' / 8 étapes trouvées';

    if (success) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
      if (window.confetti) {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#ff007f', '#00d4ff', '#ffd700', '#a855f7'], disableForReducedMotion: true });
      }
      if (resultBox) {
        resultBox.classList.remove('success-effect'); 
        void resultBox.offsetWidth; 
        resultBox.classList.add('success-effect', 'success');
      }
      if (resultIcon) resultIcon.textContent = '✓';
      if (resultTitle) resultTitle.textContent = 'MAISON CONSTRUITE !';
      if (resultText) resultText.textContent = 'Tu connais l\'ordre de construction d\'une maison. Dernière récompense débloquée !';
    } else {
      if (navigator.vibrate) navigator.vibrate([50, 100, 50, 100, 50]); 
      if (resultBox) {
        resultBox.classList.remove('fail-effect'); 
        void resultBox.offsetWidth; 
        resultBox.classList.add('fail-effect', 'fail');
      }
      if (resultIcon) resultIcon.textContent = '✗';
      if (resultTitle) resultTitle.textContent = 'CHANTIER STOPPÉ';
      if (resultText) resultText.textContent = stepsFound < 8 && document.getElementById('ord-errors').textContent.includes('4') === false
        ? 'Il fallait trouver toutes les étapes dans le bon ordre. Récompense verrouillée.'
        : 'Trop d\'erreurs ! Le chef de chantier a arrêté les travaux. Récompense verrouillée.';
    }
  }
});