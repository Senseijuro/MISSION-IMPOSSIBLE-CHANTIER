document.addEventListener('DOMContentLoaded', function() {
  var state = getGameState();
  var locked = document.getElementById('locked');
  var gameArea = document.getElementById('game-area');
  var resultDiv = document.getElementById('result');
  var grid = document.getElementById('epi-grid');
  var foundEl = document.getElementById('epi-found');
  var errorsEl = document.getElementById('epi-errors');

  // Vérifier débloqué
  if (!state.enigme1 || state.enigme1.completed === null) {
    if (locked) locked.classList.remove('hidden');
    if (gameArea) gameArea.classList.add('hidden');
    return;
  }

  // Si déjà terminé
  if (state.quiz && state.quiz.completed !== null) {
    if (gameArea) gameArea.classList.add('hidden');
    if (locked) locked.classList.add('hidden');
    showResult(state.quiz.completed, state.quiz.score || 0);
    return;
  }

  if (locked) locked.classList.add('hidden');

  // 6 EPI corrects + 6 intrus
  var items = [
    { emoji: '🪖', text: 'Casque de chantier',     epi: true },
    { emoji: '🧤', text: 'Gants de sécurité',      epi: true },
    { emoji: '🦺', text: 'Gilet haute visibilité',  epi: true },
    { emoji: '👢', text: 'Chaussures de sécurité',  epi: true },
    { emoji: '🎧', text: 'Casque anti-bruit',       epi: true },
    { emoji: '😷', text: 'Masque anti-poussière',   epi: true },
    { emoji: '🕶️', text: 'Lunettes de soleil',     epi: false },
    { emoji: '📱', text: 'Smartphone',              epi: false },
    { emoji: '🧢', text: 'Casquette',               epi: false },
    { emoji: '🩴', text: 'Tongs',                   epi: false },
    { emoji: '🎒', text: 'Sac à dos',               epi: false },
    { emoji: '⌚', text: 'Montre connectée',        epi: false }
  ];

  var order = getShuffledOrder('quiz', items.length);
  var shuffledItems = order.map(function(i) { return items[i]; });

  var foundCount = 0;
  var errorCount = 0;
  var totalEPI = 6;

  shuffledItems.forEach(function(item, index) {
    var el = document.createElement('div');
    el.className = 'epi-item';
    el.dataset.index = index;
    el.dataset.epi = item.epi;
    el.innerHTML = '<span class="epi-item-emoji">' + item.emoji + '</span>' +
                   '<span class="epi-item-text">' + item.text + '</span>';
    el.addEventListener('click', function() { selectItem(el, item); });
    grid.appendChild(el);
  });

  function selectItem(el, item) {
    if (el.classList.contains('selected') || el.classList.contains('wrong-item')) return;

    if (item.epi) {
      el.classList.add('selected', 'correct-item');
      foundCount++;
      updateStats();
      if (foundCount >= totalEPI) endGame();
    } else {
      el.classList.add('wrong-item', 'shake');
      errorCount++;
      updateStats();
      setTimeout(function() { el.classList.remove('shake'); }, 600);
      if (errorCount >= 4) endGame();
    }
  }

  function updateStats() {
    if (foundEl) foundEl.textContent = '🦺 ' + foundCount + ' / ' + totalEPI + ' EPI trouvés';
    if (errorsEl) errorsEl.textContent = '❌ ' + errorCount + ' erreur' + (errorCount > 1 ? 's' : '');
  }

  function endGame() {
    var success = foundCount >= totalEPI && errorCount < 4;
    if (!state.quiz) state.quiz = { completed: null, score: 0 };
    state.quiz.completed = success;
    state.quiz.score = foundCount;
    saveGameState(state);
    setTimeout(function() {
      if (gameArea) gameArea.classList.add('hidden');
      showResult(success, foundCount);
    }, 800);
  }

  function showResult(success, score) {
    if (resultDiv) resultDiv.classList.remove('hidden');
    if (gameArea) gameArea.classList.add('hidden');
    if (locked) locked.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    var resultBox = document.getElementById('result-box');
    var resultIcon = document.getElementById('result-icon');
    var resultTitle = document.getElementById('result-title');
    var resultText = document.getElementById('result-text');
    var resultScore = document.getElementById('result-score');

    if (resultScore) resultScore.textContent = score + ' / ' + totalEPI + ' EPI trouvés';

    if (success) {
      if (resultBox) resultBox.classList.add('success');
      if (resultIcon) resultIcon.textContent = '✓';
      if (resultTitle) resultTitle.textContent = 'OUVRIER PROTÉGÉ !';
      if (resultText) resultText.textContent = 'Bien joué ! L\'ouvrier est équipé pour le chantier. Récompense débloquée !';
    } else {
      if (resultBox) resultBox.classList.add('fail');
      if (resultIcon) resultIcon.textContent = '✗';
      if (resultTitle) resultTitle.textContent = 'SÉCURITÉ INSUFFISANTE';
      if (resultText) resultText.textContent = errorCount >= 4
        ? 'Trop d\'erreurs ! Tu as donné des objets dangereux à l\'ouvrier. Récompense verrouillée.'
        : 'Il manque des EPI. L\'ouvrier ne peut pas aller sur le chantier. Récompense verrouillée.';
    }
  }

  updateStats();
});
