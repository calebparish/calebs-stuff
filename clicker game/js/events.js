function setupEvents() {
  const clickBtn = document.getElementById('click-button');
  const tabBtns = document.querySelectorAll('.tab-btn');

  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      document.getElementById('homescreen').classList.add('hidden');
      setTimeout(() => document.documentElement.classList.remove('homescreen-active'), 800);
      playWhoosh();
      startBGM();
      if (!gameState.tutorialDone && gameState.totalStuffEarned === 0) {
        setTimeout(() => startTutorial(), 900);
      }
    });
  }

  const settingsToggle = document.getElementById('settings-toggle');
  const settingsPanel = document.getElementById('settings-panel');
  if (settingsToggle && settingsPanel) {
    settingsToggle.addEventListener('click', () => {
      settingsPanel.classList.toggle('open');
    });
  }

  const brightnessSlider = document.getElementById('brightness-slider');
  if (brightnessSlider) {
    brightnessSlider.addEventListener('input', () => {
      gameState.settings.brightness = parseInt(brightnessSlider.value);
      applySettings();
      dirty = true;
    });
  }

  const soundSlider = document.getElementById('sound-slider');
  if (soundSlider) {
    soundSlider.addEventListener('input', () => {
      gameState.settings.sound = parseInt(soundSlider.value);
      dirty = true;
    });
  }

  const sfxSlider = document.getElementById('sfx-slider');
  if (sfxSlider) {
    sfxSlider.addEventListener('input', () => {
      gameState.settings.sfx = parseInt(sfxSlider.value);
      setSFXVolume(gameState.settings.sfx);
      dirty = true;
    });
  }

  const musicSlider = document.getElementById('music-slider');
  if (musicSlider) {
    musicSlider.addEventListener('input', () => {
      gameState.settings.music = parseInt(musicSlider.value);
      setMusicVolume(gameState.settings.music);
      dirty = true;
    });
  }

  clickBtn.addEventListener('click', handleClick);
  clickBtn.addEventListener('mousedown', (e) => e.preventDefault());

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  tabBtns.forEach(btn => {
    btn.draggable = true;
    btn.addEventListener('dragstart', onTabDragStart);
    btn.addEventListener('dragover', onTabDragOver);
    btn.addEventListener('drop', onTabDrop);
    btn.addEventListener('dragend', onTabDragEnd);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      if (document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        handleClick();
      }
    }
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (e.key >= '1' && e.key <= '6') {
      const idx = parseInt(e.key) - 1;
      if (tabBtns[idx]) switchTab(tabBtns[idx].dataset.tab);
    }
  });

  const altarBtn = document.getElementById('altar-btn');
  if (altarBtn) {
    altarBtn.addEventListener('click', () => {
      prayAtAltar();
      dirty = true;
    });
  }

  const blessingCards = document.getElementById('blessing-cards');
  if (blessingCards) {
    blessingCards.addEventListener('click', (e) => {
      const card = e.target.closest('.blessing-card');
      if (!card) return;
      const id = card.dataset.blessingId;
      if (claimBlessing(id)) {
        dirty = true;
        showNotification(`✨ Received blessing: ${BLESSINGS.find(b => b.id === id)?.name}`);
      }
    });
  }

  function rerenderActiveTab() {
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'items';
    const renderMap = {
      items: renderItems,
      lab: () => { renderResearchBuildings(); renderResearchProjects(); },
      energy: () => { renderEnergyItems(); renderEnergyActions(); renderEnergyUpgrades(); },
      upgrades: renderUpgrades,
      milestones: renderAchievements,
      altar: renderAltar
    };
    if (renderMap[activeTab]) renderMap[activeTab]();
  }

  const itemsList = document.getElementById('items-list');
  itemsList.addEventListener('click', (e) => {
    const btn = e.target.closest('.buy-btn');
    if (!btn) return;
    if (btn.dataset.bought) return;
    const id = btn.dataset.item;
    if (buyItem(id)) {
      dirty = true;
      playUpgradeSound();
      rerenderActiveTab();
    }
  });

  const upgradesList = document.getElementById('upgrades-list');
  upgradesList.addEventListener('click', (e) => {
    const btn = e.target.closest('.buy-btn');
    if (!btn) return;
    if (btn.dataset.bought) return;
    const id = btn.dataset.upgrade;
    if (buyUpgrade(id)) {
      dirty = true;
      playUpgradeSound();
      rerenderActiveTab();
    }
  });

  const energyItemsList = document.getElementById('energy-items-list');
  if (energyItemsList) {
    energyItemsList.addEventListener('click', (e) => {
      const btn = e.target.closest('.buy-btn');
      if (!btn) return;
      if (btn.dataset.bought) return;
      const id = btn.dataset.energyItem;
    if (buyEnergyItem(id)) {
      dirty = true;
      playUpgradeSound();
      rerenderActiveTab();
    }
    });
  }

  const researchLabList = document.getElementById('research-lab-list');
  if (researchLabList) {
    researchLabList.addEventListener('click', (e) => {
      const btn = e.target.closest('.buy-btn');
      if (!btn) return;
      if (btn.dataset.bought) return;
      const id = btn.dataset.researchBuilding;
    if (buyResearchBuilding(id)) {
      dirty = true;
      playUpgradeSound();
      rerenderActiveTab();
    }
    });
  }

  const researchProjectsList = document.getElementById('research-projects-list');
  if (researchProjectsList) {
    researchProjectsList.addEventListener('click', (e) => {
      const btn = e.target.closest('.buy-btn');
      if (!btn) return;
      if (btn.dataset.bought) return;
      const id = btn.dataset.researchProject;
    if (buyResearchProject(id)) {
      dirty = true;
      playUpgradeSound();
      rerenderActiveTab();
    }
    });
  }

  const energyUpgradesList = document.getElementById('energy-upgrades-list');
  if (energyUpgradesList) {
    energyUpgradesList.addEventListener('click', (e) => {
      const btn = e.target.closest('.buy-btn');
      if (!btn) return;
      if (btn.dataset.bought) return;
      const id = btn.dataset.energyUpgrade;
    if (buyEnergyUpgrade(id)) {
      dirty = true;
      playUpgradeSound();
      rerenderActiveTab();
    }
    });
  }

  const boostBtn = document.getElementById('boost-btn');
  if (boostBtn) {
    boostBtn.addEventListener('click', () => {
      if (activateBoost()) {
        dirty = true;
      }
    });
  }

  const convertBtn = document.getElementById('convert-btn');
  if (convertBtn) {
    convertBtn.addEventListener('click', () => {
      if (convertEnergy()) {
        dirty = true;
      }
    });
  }

  const autoToggle = document.getElementById('auto-convert-toggle');
  if (autoToggle) {
    autoToggle.addEventListener('change', toggleAutoConvert);
  }

  const amountInput = document.getElementById('auto-convert-amount');
  if (amountInput) {
    amountInput.addEventListener('change', () => {
      const val = Math.max(50, Math.floor(parseInt(amountInput.value) / 50) * 50);
      gameState.autoConvertAmount = val || 50;
      amountInput.value = gameState.autoConvertAmount;
      dirty = true;
    });
  }

  const wipeBtn = document.getElementById('wipe-btn');
  if (wipeBtn) {
    wipeBtn.addEventListener('click', wipeSave);
  }

  const intervalInput = document.getElementById('auto-convert-interval');
  if (intervalInput) {
    intervalInput.addEventListener('change', () => {
      const val = Math.max(1, parseInt(intervalInput.value));
      gameState.autoConvertInterval = val || 1;
      intervalInput.value = gameState.autoConvertInterval;
      dirty = true;
    });
  }
}

function getClickPower() {
  let base = gameState.clickPower;
  if (gameState.upgrades.clickPower2) base *= 2;
  if (gameState.upgrades.clickPower4) base *= 4;
  if (gameState.upgrades.clickPower8) base *= 8;
  if (gameState.upgrades.clickPower16) base *= 16;

  base *= (1 + (gameState.blessings.steadyHands || 0));

  if (gameState.researchDone.betterPipettes) base += 5;
  if (gameState.researchDone.ergonomicSetup) base += 15;
  if (gameState.researchDone.dimensionalRift) base *= 10;

  return Math.floor(base * getAchievementBonus());
}

function handleClick() {
  let amount = getClickPower();

  const goldenMult = 1.25 ** (gameState.blessings.goldenTouch || 0);
  amount = Math.floor(amount * goldenMult);

  gameState.resources.stuff += amount;
  gameState.totalStuffEarned += amount;
  dirty = true;
  needsRender = true;

  const btn = document.getElementById('click-button');
  btn.classList.remove('clicked');
  void btn.offsetWidth;
  btn.classList.add('clicked');

  spawnParticles(amount);
}

function spawnParticles(amount) {
  const container = document.getElementById('click-particles');
  const particles = ['📦', '✦', '⭐', '🎁', '📥'];
  const count = Math.min(5, 1 + Math.floor(amount / 10));

  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'click-particle';
    p.textContent = particles[Math.floor(Math.random() * particles.length)];
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 60;
    p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    container.appendChild(p);
    setTimeout(() => p.remove(), 600);
  }
}

function switchTab(tab) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`panel-${tab}`).classList.add('active');
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  const renderMap = {
    items: renderItems,
    lab: () => { renderResearchBuildings(); renderResearchProjects(); },
    energy: () => { renderEnergyItems(); renderEnergyActions(); renderEnergyUpgrades(); },
    upgrades: renderUpgrades,
    milestones: renderAchievements,
    altar: renderAltar
  };
  if (renderMap[tab]) renderMap[tab]();
}

let dragSourceTab = null;

function onTabDragStart(e) {
  dragSourceTab = e.target;
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', e.target.dataset.tab);
}

function onTabDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const tab = e.target.closest('.tab-btn');
  if (!tab || tab === dragSourceTab) return;
  const bar = document.getElementById('tab-bar');
  const rect = tab.getBoundingClientRect();
  const midX = rect.left + rect.width / 2;
  if (e.clientX < midX) {
    bar.insertBefore(dragSourceTab, tab);
  } else {
    bar.insertBefore(dragSourceTab, tab.nextSibling);
  }
}

function onTabDrop(e) {
  e.preventDefault();
  saveTabOrder();
}

function onTabDragEnd(e) {
  e.target.classList.remove('dragging');
  dragSourceTab = null;
  saveTabOrder();
}

function saveTabOrder() {
  const bar = document.getElementById('tab-bar');
  if (!bar) return;
  const order = Array.from(bar.querySelectorAll('.tab-btn')).map(btn => btn.dataset.tab);
  gameState.tabOrder = order;
  dirty = true;
}

function applyTabOrder() {
  const bar = document.getElementById('tab-bar');
  if (!bar || !gameState.tabOrder) return;
  const tabs = {};
  bar.querySelectorAll('.tab-btn').forEach(btn => {
    tabs[btn.dataset.tab] = btn;
  });
  const active = bar.querySelector('.tab-btn.active');
  gameState.tabOrder.forEach(tabId => {
    if (tabs[tabId]) bar.appendChild(tabs[tabId]);
  });
  if (active) active.classList.add('active');
}
