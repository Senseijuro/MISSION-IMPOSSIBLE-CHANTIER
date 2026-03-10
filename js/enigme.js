document.addEventListener('DOMContentLoaded', function() {
  var state = getGameState();
  var locked = document.getElementById('locked');
  var gameArea = document.getElementById('game-area');
  var resultDiv = document.getElementById('result');
  var grid = document.getElementById('ordre-grid');
  var progressEl = document.getElementById('ord-progress');
  var errorsEl = document.getElementById('ord-errors');
  var nextStepEl = document.getElementById('ord-next-step');

  // Vérifier débloqué
  if (!state.quiz || state.quiz.completed === null) {
    if (locked) locked.classList.remove('hidden');
    if (gameArea) gameArea.classList.add('hidden');
    return;
  }

  // Si déjà terminé
  if (state.enigma && state.enigma.completed !== null) {
    if (gameArea) gameArea.classList.add('hidden');
    if (locked) locked.classList.add('hidden');
    showResult(state.enigma.completed, 0);
    return;
  }

  if (locked) locked.classList.add('hidden');

  // 8 étapes dans l'ordre CORRECT de construction
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

  // Mélanger l'affichage (pas l'ordre logique)
  var displayOrder = getShuffledOrder('enigma', steps.length);
  var shuffledDisplay = displayOrder.map(function(i) { return steps[i]; });

  var currentStep = 1; // On cherche l'étape 1 d'abord
  var errorCount = 0;
  var total = steps.length;

  // Créer les tuiles
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
      // Correct !
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
      // Mauvais
      errorCount++;
      el.classList.add('wrong-pick');
      setTimeout(function() { el.classList.remove('wrong-pick'); }, 500);
      updateStats();

      // 4 erreurs = perdu
      if (errorCount >= 4) {
        endGame();
      }
    }
  }

  function endGame() {
    var success = (currentStep > total) && errorCount < 4;
    if (!state.enigma) state.enigma = { completed: null };
    state.enigma.completed = success;
    saveGameState(state);
    setTimeout(function() {
      if (gameArea) gameArea.classList.add('hidden');
      showResult(success, currentStep - 1);
    }, 600);
  }

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

    if (resultScore) resultScore.textContent = stepsFound + ' / ' + total + ' étapes trouvées';

    if (success) {
      /* --- EFFETS DE VICTOIRE --- */
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
      if (window.confetti) {
        confetti({ 
          particleCount: 150, spread: 80, origin: { y: 0.6 },
          colors: ['#ff007f', '#00d4ff', '#ffd700', '#a855f7'], 
          disableForReducedMotion: true
        });
      }

      if (resultBox) resultBox.classList.add('success');
      if (resultIcon) resultIcon.textContent = '✓';
      if (resultTitle) resultTitle.textContent = 'MAISON CONSTRUITE !';
      if (resultText) resultText.textContent = 'Tu connais l\'ordre de construction d\'une maison. Dernière récompense débloquée !';
    } else {
      /* --- EFFETS D'ÉCHEC --- */
      if (navigator.vibrate) navigator.vibrate([50, 100, 50, 100, 50]); 
      if (resultBox) {
        resultBox.classList.remove('fail-effect'); 
        void resultBox.offsetWidth; 
        resultBox.classList.add('fail-effect');
      }

      if (resultBox) resultBox.classList.add('fail');
      if (resultIcon) resultIcon.textContent = '✗';
      if (resultTitle) resultTitle.textContent = 'CHANTIER STOPPÉ';
      if (resultText) resultText.textContent = errorCount >= 4
        ? 'Trop d\'erreurs ! Le chef de chantier a arrêté les travaux. Récompense verrouillée.'
        : 'Il fallait trouver toutes les étapes dans le bon ordre. Récompense verrouillée.';
    }
  }

  updateStats();
  updateNextStep();
});
