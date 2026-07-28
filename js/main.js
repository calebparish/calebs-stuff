let lastUiUpdate = 0;

function applySettings() {
  const b = gameState.settings.brightness / 100;
  document.body.style.filter = `brightness(${b})`;
}

function gameLoop(timestamp) {
  const now = Date.now();
  const delta = (now - gameState.lastTick) / 1000;
  gameState.lastTick = now;

  if (delta > 0 && delta < 10) {
    const achBonus = getAchievementBonus();

    const stuffGain = calculateStuffProduction() * delta * achBonus;
    const energyGain = calculateEnergyProduction() * delta * achBonus;

    gameState.resources.stuff += stuffGain;
    gameState.totalStuffEarned += stuffGain;
    gameState.resources.energy += energyGain;
    gameState.totalEnergyEarned += energyGain;

    const energyDrainPerSec = calculateEnergyDrain();
    const energyDrain = Math.min(energyDrainPerSec * delta, gameState.resources.energy);
    gameState.resources.energy -= energyDrain;

    const researchGain = energyDrain >= energyDrainPerSec * delta
      ? calculateResearchProduction() * delta * achBonus
      : 0;

    if (researchGain > 0) {
      gameState.resources.researchPoints += researchGain;
    }

    if (gameState.upgrades.autoOrganization) {
      const totalItems = getTotalItems();
      gameState.resources.stuff += totalItems * 0.5 * delta * achBonus;
      gameState.totalStuffEarned += totalItems * 0.5 * delta;
    }

    if (gameState.upgrades.autoConvert && gameState.autoConvertEnabled && gameState.resources.energy >= gameState.autoConvertAmount && now - gameState.lastAutoConvert >= gameState.autoConvertInterval * 1000) {
      const ratio = getConvertRatio();
      const amount = Math.floor(gameState.autoConvertAmount / 50) * 50;
      gameState.resources.energy -= amount;
      gameState.resources.stuff += amount * ratio;
      gameState.totalStuffEarned += amount * ratio;
      gameState.lastAutoConvert = now;
    }
  }

  if (gameState.boostActive && now >= gameState.boostEndTime) {
    gameState.boostActive = false;
    gameState.boostMultiplier = 1;
  }

  checkAchievements();

  const room = getCurrentRoom();
  if (room !== gameState.currentRoom) {
    gameState.currentRoom = room;
  }

  if (now - lastUiUpdate > 100) {
    updateDisplay();
    lastUiUpdate = now;
  }

  if (dirty && now % 2000 < 100) {
    saveGame();
  }

  requestAnimationFrame(gameLoop);
}

document.addEventListener('DOMContentLoaded', () => {
  loadGame();
  applySettings();
  initWhoosh();
  initUpgradeSound();
  initBGM();
  startBGM();
  document.documentElement.classList.add('homescreen-active');

  const s = gameState.settings;
  const setSlider = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  setSlider('brightness-slider', s.brightness);
  setSlider('sound-slider', s.sound);
  setSlider('sfx-slider', s.sfx);
  setSlider('music-slider', s.music);

  setupEvents();
  applyTabOrder();
  setupTutorialEvents();
  renderAll();
  gameState.lastTick = Date.now();
  requestAnimationFrame(gameLoop);

  setInterval(() => {
    if (dirty) saveGame();
  }, 30000);

  window.addEventListener('beforeunload', () => {
    saveGame();
  });
});
