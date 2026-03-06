document.addEventListener('DOMContentLoaded', function() {
  var state = getGameState();
  var gameArea = document.getElementById('game-area');
  var resultDiv = document.getElementById('result');
  var card = document.getElementById('dg-card');
  var emoji = document.getElementById('dg-emoji');
  var text = document.getElementById('dg-text');
  var counter = document.getElementById('dg-counter');
  var progressEl = document.getElementById('dg-progress');
  var errorsEl = document.getElementById('dg-errors');
  var btnDanger = document.getElementById('btn-danger');
  var btnOk = document.getElementById('btn-ok');

  // Si déjà terminé
  if (state.enigme1 && state.enigme1.completed !== null) {
    if (gameArea) gameArea.classList.add('hidden');
    showResult(state.enigme1.completed);
    return;
  }

  // 10 situations : danger = true, ok = false
  var situations = [
    { emoji: '🪜', text: 'Un ouvrier monte sur une échelle cassée pour atteindre le 2ème étage', danger: true },
    { emoji: '🪖', text: 'Tout le monde porte un casque de chantier avant d\'entrer sur le site', danger: false },
    { emoji: '⚡', text: 'Un apprenti touche des câbles électriques dénudés à mains nues', danger: true },
    { emoji: '🦺', text: 'L\'équipe enfile son gilet haute visibilité avant de travailler près de la route', danger: false },
    { emoji: '🍺', text: 'Un conducteur d\'engin boit de l\'alcool pendant sa pause déjeuner', danger: true },
    { emoji: '🔒', text: 'Le chef de chantier vérifie que les échafaudages sont bien fixés', danger: false },
    { emoji: '🩴', text: 'Un maçon travaille en tongs parce qu\'il fait chaud', danger: true },
    { emoji: '🧯', text: 'Des extincteurs sont placés à chaque étage du bâtiment en construction', danger: false },
    { emoji: '📱', text: 'Un grutier regarde son téléphone pendant qu\'il manœuvre la grue', danger: true },
    { emoji: '🚧', text: 'Le périmètre du chantier est clôturé avec des barrières de sécurité', danger: false }
  ];

  var order = getShuffledOrder('enigme1', situations.length);
  var shuffled = order.map(function(i) { return situations[i]; });

  var currentIndex = 0;
  var correctCount = 0;
  var errorCount = 0;
  var total = shuffled.length;
  var isProcessing = false;

  function showCurrent() {
    if (currentIndex >= total) { endGame(); return; }
    var s = shuffled[currentIndex];
    if (emoji) emoji.textContent = s.emoji;
    if (text) text.textContent = s.text;
    if (counter) counter.textContent = 'SITUATION ' + (currentIndex + 1) + ' / ' + total;

    if (card) {
      card.classList.remove('danger-slide-in', 'flash-danger', 'flash-ok', 'flash-wrong');
      void card.offsetWidth;
      card.classList.add('danger-slide-in');
    }
    isProcessing = false;
  }

  function updateStats() {
    if (progressEl) progressEl.textContent = '📋 ' + currentIndex + ' / ' + total;
    if (errorsEl) errorsEl.textContent = '❌ ' + errorCount + ' erreur' + (errorCount > 1 ? 's' : '');
  }

  function handleChoice(playerSaysDanger) {
    if (isProcessing || currentIndex >= total) return;
    isProcessing = true;

    var s = shuffled[currentIndex];
    var isCorrect = (playerSaysDanger === s.danger);

    if (isCorrect) {
      correctCount++;
      if (card) card.classList.add(s.danger ? 'flash-danger' : 'flash-ok');
      // Flash le bon bouton
      var correctBtn = playerSaysDanger ? btnDanger : btnOk;
      if (correctBtn) { correctBtn.classList.add('btn-correct'); setTimeout(function() { correctBtn.classList.remove('btn-correct'); }, 400); }
    } else {
      errorCount++;
      if (card) card.classList.add('flash-wrong');
      var wrongBtn = playerSaysDanger ? btnDanger : btnOk;
      if (wrongBtn) { wrongBtn.classList.add('btn-wrong'); setTimeout(function() { wrongBtn.classList.remove('btn-wrong'); }, 400); }
      // Montrer la bonne réponse
      var rightBtn = s.danger ? btnDanger : btnOk;
      if (rightBtn) { rightBtn.classList.add('btn-correct'); setTimeout(function() { rightBtn.classList.remove('btn-correct'); }, 600); }
    }

    currentIndex++;
    updateStats();

    setTimeout(function() {
      showCurrent();
    }, isCorrect ? 400 : 800);
  }

  function endGame() {
    var success = correctCount >= 8;
    if (!state.enigme1) state.enigme1 = { completed: null };
    state.enigme1.completed = success;
    saveGameState(state);
    setTimeout(function() {
      if (gameArea) gameArea.classList.add('hidden');
      showResult(success);
    }, 400);
  }

  function showResult(success) {
    if (resultDiv) resultDiv.classList.remove('hidden');
    if (gameArea) gameArea.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    var resultBox = document.getElementById('result-box');
    var resultIcon = document.getElementById('result-icon');
    var resultTitle = document.getElementById('result-title');
    var resultText = document.getElementById('result-text');
    var resultScore = document.getElementById('result-score');

    if (resultScore) resultScore.textContent = correctCount + ' / ' + total + ' correct';

    if (success) {
      if (resultBox) resultBox.classList.add('success');
      if (resultIcon) resultIcon.textContent = '✓';
      if (resultTitle) resultTitle.textContent = 'BON ŒIL !';
      if (resultText) resultText.textContent = 'Tu sais repérer les dangers sur un chantier. Récompense débloquée !';
    } else {
      if (resultBox) resultBox.classList.add('fail');
      if (resultIcon) resultIcon.textContent = '✗';
      if (resultTitle) resultTitle.textContent = 'TROP D\'ERREURS';
      if (resultText) resultText.textContent = 'Il fallait au moins 8/10 bonnes réponses. Récompense verrouillée.';
    }
  }

  if (btnDanger) btnDanger.addEventListener('click', function() { handleChoice(true); });
  if (btnOk) btnOk.addEventListener('click', function() { handleChoice(false); });

  updateStats();
  showCurrent();
});
