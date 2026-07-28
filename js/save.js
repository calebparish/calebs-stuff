const SAVE_KEY = 'householdClickerV2';

function saveGame() {
  try {
    const data = {
      resources: { ...gameState.resources },
      clickPower: gameState.clickPower,
      items: { ...gameState.items },
      energyItems: { ...gameState.energyItems },
      researchBuildings: { ...gameState.researchBuildings },
      upgrades: { ...gameState.upgrades },
      researchDone: { ...gameState.researchDone },
      achievements: [...gameState.achievements],
      currentRoom: gameState.currentRoom,
      totalStuffEarned: gameState.totalStuffEarned,
      totalEnergyEarned: gameState.totalEnergyEarned,
      blessings: { ...gameState.blessings },
      renovationCount: gameState.renovationCount,
      boostActive: gameState.boostActive,
      boostEndTime: gameState.boostEndTime,
      boostMultiplier: gameState.boostMultiplier,
      boostCost: gameState.boostCost,
      lastAutoConvert: gameState.lastAutoConvert,
      autoConvertEnabled: gameState.autoConvertEnabled,
      autoConvertAmount: gameState.autoConvertAmount,
      autoConvertInterval: gameState.autoConvertInterval,
      settings: { ...gameState.settings },
      tutorialDone: gameState.tutorialDone,
      tabOrder: gameState.tabOrder
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    dirty = false;
  } catch (e) {
    console.warn('Save failed:', e);
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;

    const data = JSON.parse(raw);
    if (!data || !data.resources) return false;

    gameState.resources.stuff = data.resources.stuff || 0;
    gameState.resources.energy = data.resources.energy || 0;
    gameState.resources.researchPoints = data.resources.researchPoints || 0;
    gameState.resources.rp = data.resources.rp || 0;
    gameState.clickPower = data.clickPower || 1;

    if (data.items) {
      for (const key of Object.keys(gameState.items)) {
        gameState.items[key] = data.items[key] || 0;
      }
    }
    if (data.energyItems) {
      for (const key of Object.keys(gameState.energyItems)) {
        gameState.energyItems[key] = data.energyItems[key] || 0;
      }
    }
    if (data.researchBuildings) {
      for (const key of Object.keys(gameState.researchBuildings)) {
        gameState.researchBuildings[key] = data.researchBuildings[key] || 0;
      }
    }
    if (data.upgrades) {
      for (const key of Object.keys(data.upgrades)) {
        gameState.upgrades[key] = data.upgrades[key];
      }
    }
    if (data.researchDone) {
      for (const key of Object.keys(data.researchDone)) {
        gameState.researchDone[key] = data.researchDone[key];
      }
    }
    gameState.achievements = data.achievements || [];
    gameState.currentRoom = data.currentRoom || 'closet';
    gameState.totalStuffEarned = data.totalStuffEarned || 0;
    gameState.totalEnergyEarned = data.totalEnergyEarned || 0;

    if (data.blessings) {
      for (const key of Object.keys(data.blessings)) {
        gameState.blessings[key] = data.blessings[key];
      }
    }
    if (data.renovationCount !== undefined) gameState.renovationCount = data.renovationCount;

    if (data.boostActive) gameState.boostActive = data.boostActive;
    if (data.boostEndTime) gameState.boostEndTime = data.boostEndTime;
    if (data.boostMultiplier) gameState.boostMultiplier = data.boostMultiplier;
    if (data.boostCost) gameState.boostCost = data.boostCost;
    if (data.lastAutoConvert) gameState.lastAutoConvert = data.lastAutoConvert;
    if (data.autoConvertEnabled !== undefined) gameState.autoConvertEnabled = data.autoConvertEnabled;
    else if (gameState.upgrades.autoConvert) gameState.autoConvertEnabled = true;
    if (data.autoConvertAmount) gameState.autoConvertAmount = data.autoConvertAmount;
    if (data.autoConvertInterval) gameState.autoConvertInterval = data.autoConvertInterval;
    if (data.settings) {
      if (data.settings.brightness) gameState.settings.brightness = data.settings.brightness;
      if (data.settings.sound !== undefined) gameState.settings.sound = data.settings.sound;
      if (data.settings.music !== undefined) gameState.settings.music = data.settings.music;
      if (data.settings.sfx !== undefined) gameState.settings.sfx = data.settings.sfx;
    }
    if (data.tutorialDone !== undefined) gameState.tutorialDone = data.tutorialDone;
    if (data.tabOrder) gameState.tabOrder = data.tabOrder;

    gameState.lastTick = Date.now();
    dirty = false;
    return true;
  } catch (e) {
    console.warn('Load failed:', e);
    return false;
  }
}

function exportSave() {
  saveGame();
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  const blob = new Blob([raw], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `household-clicker-save-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importSave(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      location.reload();
    } catch (err) {
      showNotification('Invalid save file');
    }
  };
  reader.readAsText(file);
}

function wipeSave() {
  if (!confirm('💥 Delete EVERYTHING? This cannot be undone!')) return;
  localStorage.removeItem(SAVE_KEY);
  gameState = JSON.parse(JSON.stringify(DefaultState));
  gameState.resources.energy = 5;
  gameState = new Proxy(gameState, stateHandler);
  gameState.lastTick = Date.now();
  dirty = true;
  saveGame();
  applySettings();
  renderAll();
  showNotification('💥 Game wiped — fresh start!');
}
