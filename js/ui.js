let updateCounter = 0;
let needsRender = true;
let needsButtonsUpdate = true;

function updateDisplay() {
  updateCounter++;

  document.getElementById('stuff-amount').textContent = formatNumber(gameState.resources.stuff);
  document.getElementById('energy-amount').textContent = formatNumber(gameState.resources.energy);
  const sProd = calculateStuffProduction();
  const eProd = calculateEnergyProduction();
  const eDrain = calculateEnergyDrain();
  const rProd = calculateResearchProduction();

  document.getElementById('stuff-rate').textContent = `(+${formatRate(sProd)}/s)`;
  const eDrainFormatted = formatRate(eDrain);
  const eProdFormatted = formatRate(eProd);
  document.getElementById('energy-rate').textContent = `(+${eProdFormatted}/s −${eDrainFormatted}/s)`;
  const prodEl = document.getElementById('energy-prod-display');
  if (prodEl) prodEl.textContent = `+${eProdFormatted}/s`;

  const rpEl = document.getElementById('research-points-amount');
  const rpRateEl = document.getElementById('research-points-rate');
  if (rpEl) rpEl.textContent = formatNumber(gameState.resources.researchPoints);
  const rProdActual = eProd >= eDrain ? rProd : 0;
  if (rpRateEl) rpRateEl.textContent = `(+${formatRate(rProdActual)}/s)`;

  document.getElementById('click-power-display').textContent = getClickPower();

  const room = getCurrentRoom();
  const roomData = ROOM_NAMES[room];
  document.getElementById('room-badge').textContent = `${roomData.icon} ${roomData.name}`;
  if (room !== gameState.currentRoom) {
    gameState.currentRoom = room;
    document.getElementById('click-button').textContent = getRoomEmoji(room);
    showNotification(`🏠 Reached the ${roomData.name}!`);
    dirty = true;
  }

  if (updateCounter === 1 || updateCounter % 30 === 0) {
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
}

function getRoomEmoji(room) {
  const map = {
    closet: '📦',
    kitchen: '🍳',
    livingRoom: '🛋️',
    bedroom: '🛏️',
    bathroom: '🚿',
    garage: '🔧',
    basement: '⬇️',
    attic: '🏚️',
    backyard: '🌳',
    cellar: '🍷'
  };
  return map[room] || '📦';
}

function renderItems() {
  const container = document.getElementById('items-list');
  if (!container) return;
  let html = '';
  for (const it of ITEMS) {
    const owned = gameState.items[it.id] || 0;
    const cost = getItemCost(it.id);
    const canBuy = gameState.resources.stuff >= cost && isRoomUnlocked(it.roomUnlock);
    const isLocked = !isRoomUnlocked(it.roomUnlock);
    let prodStr = '';
    if (owned > 0) {
      const contrib = it.production * owned;
      prodStr = `+${formatRate(contrib)}/s`;
    }

    html += `
      <div class="item-entry ${isLocked ? 'locked' : ''}">
        <div class="item-info">
          <div class="item-name">${it.icon} ${it.name}</div>
          <div class="item-desc">${it.desc}${prodStr ? ' — ' + prodStr : ''}</div>
        </div>
        <div class="item-owned">×${owned}</div>
        <div class="item-cost">${isLocked ? ROOM_NAMES[it.roomUnlock].icon + ' ' + ROOM_NAMES[it.roomUnlock].name : formatNumber(cost) + ' 📦'}</div>
        <button class="buy-btn" data-item="${it.id}" ${!canBuy || isLocked ? 'disabled' : ''}>${isLocked ? '🔒' : 'Buy'}</button>
      </div>`;
  }
  container.innerHTML = html;
}

function renderUpgrades() {
  const container = document.getElementById('upgrades-list');
  if (!container) return;
  let html = '';
  for (const up of UPGRADES) {
    const owned = gameState.upgrades[up.id];
    const divineMult = 0.8 ** (gameState.blessings.divineSpeed || 0);
    const displayCost = Math.floor(up.cost * divineMult);
    const canBuy = gameState.resources.stuff >= displayCost && isRoomUnlocked(up.roomUnlock) && !owned;
    const isLocked = !isRoomUnlocked(up.roomUnlock);

    html += `
      <div class="upgrade-item ${isLocked ? 'locked' : ''}">
        <div class="upgrade-info">
          <div class="upgrade-name">${up.icon} ${up.name}</div>
          <div class="upgrade-desc">${up.desc}</div>
        </div>
        <div class="upgrade-cost">${isLocked ? ROOM_NAMES[up.roomUnlock].icon + ' ' + ROOM_NAMES[up.roomUnlock].name : formatNumber(displayCost) + ' 📦'}</div>
        <button class="buy-btn ${owned ? 'owned' : ''}" data-upgrade="${up.id}" ${!canBuy || owned ? 'disabled' : ''} ${owned ? 'data-bought="true"' : ''}>${owned ? '✓ Owned' : 'Buy'}</button>
      </div>`;
  }
  container.innerHTML = html;
}

function renderEnergyItems() {
  const container = document.getElementById('energy-items-list');
  if (!container) return;
  let html = '';
  for (const it of ENERGY_ITEMS) {
    const owned = gameState.energyItems[it.id] || 0;
    const cost = getEnergyItemCost(it.id);
    const canBuy = gameState.resources.stuff >= cost && isRoomUnlocked(it.roomUnlock);
    const isLocked = !isRoomUnlocked(it.roomUnlock);
    let prodStr = '';
    if (owned > 0) {
      const contrib = it.production * owned;
      prodStr = `+${formatRate(contrib)}/s`;
    }

    html += `
      <div class="item-entry ${isLocked ? 'locked' : ''}">
        <div class="item-info">
          <div class="item-name">${it.icon} ${it.name}</div>
          <div class="item-desc">${it.desc}${prodStr ? ' — ' + prodStr : ''}</div>
        </div>
        <div class="item-owned">×${owned}</div>
        <div class="item-cost">${isLocked ? ROOM_NAMES[it.roomUnlock].icon + ' ' + ROOM_NAMES[it.roomUnlock].name : formatNumber(cost) + ' 📦'}</div>
        <button class="buy-btn" data-energy-item="${it.id}" ${!canBuy || isLocked ? 'disabled' : ''}>${isLocked ? '🔒' : 'Buy'}</button>
      </div>`;
  }
  container.innerHTML = html;
}

function renderResearchBuildings() {
  const container = document.getElementById('research-lab-list');
  if (!container) return;

  const eDrain = calculateEnergyDrain();
  const eProd = calculateEnergyProduction();
  const powered = eProd >= eDrain;

  const banner = document.getElementById('research-status');
  if (banner) {
    banner.className = powered ? 'research-banner powered' : 'research-banner starved';
    banner.textContent = powered ? '🟢 Research Running' : '🔴 Energy Starved — 0 RP/s';
  }

  let html = '';
  for (const b of RESEARCH_BUILDINGS) {
    const owned = gameState.researchBuildings[b.id] || 0;
    const stuffCost = getResearchBuildingCost(b.id, 'stuff');
    const energyCost = getResearchBuildingCost(b.id, 'energy');
    const canBuy = gameState.resources.stuff >= stuffCost && gameState.resources.energy >= energyCost && isRoomUnlocked(b.roomUnlock);
    const isLocked = !isRoomUnlocked(b.roomUnlock);
    let prodStr = '';
    if (owned > 0) {
      const contrib = b.production * owned;
      prodStr = `+${formatRate(contrib)}/s`;
    }

    let costStr = `${formatNumber(stuffCost)} 📦`;
    if (energyCost > 0) costStr += ` + ${formatNumber(energyCost)} ⚡`;

    const drainStr = owned > 0 ? `⚡ ${formatRate(b.energyDrain * owned)}/s` : `⚡ ${formatRate(b.energyDrain)}/s each`;

    html += `
      <div class="item-entry ${isLocked ? 'locked' : ''}">
        <div class="item-info">
          <div class="item-name">${b.icon} ${b.name}</div>
          <div class="item-desc">${b.desc}${prodStr ? ' — ' + prodStr : ''}</div>
        </div>
        <div class="item-owned">×${owned}</div>
        <div class="item-cost">${isLocked ? ROOM_NAMES[b.roomUnlock].icon + ' ' + ROOM_NAMES[b.roomUnlock].name : costStr}</div>
        <div class="item-drain">${owned > 0 ? drainStr : `⚡ ${formatRate(b.energyDrain)}/s`}</div>
        <button class="buy-btn" data-research-building="${b.id}" ${!canBuy || isLocked ? 'disabled' : ''}>${isLocked ? '🔒' : 'Buy'}</button>
      </div>`;
  }
  container.innerHTML = html;
}

function renderResearchProjects() {
  const container = document.getElementById('research-projects-list');
  if (!container) return;
  let html = '';
  for (const p of RESEARCH_PROJECTS) {
    const done = gameState.researchDone[p.id];
    const canBuy = gameState.resources.researchPoints >= p.cost && !done;

    html += `
      <div class="upgrade-item">
        <div class="upgrade-info">
          <div class="upgrade-name">${p.icon} ${p.name}</div>
          <div class="upgrade-desc">${p.desc}</div>
        </div>
        <div class="upgrade-cost">${formatNumber(p.cost)} 📄</div>
        <button class="buy-btn ${done ? 'owned' : ''}" data-research-project="${p.id}" ${!canBuy || done ? 'disabled' : ''} ${done ? 'data-bought="true"' : ''}>${done ? '✓ Done' : 'Research'}</button>
      </div>`;
  }
  container.innerHTML = html;
}

function renderEnergyActions() {
  const boostBtn = document.getElementById('boost-btn');
  const convertBtn = document.getElementById('convert-btn');
  const boostInfo = document.getElementById('boost-info');
  const convertInfo = document.getElementById('convert-info');

  const drainDisplay = document.getElementById('energy-drain-display');
  if (drainDisplay) {
    const drain = calculateEnergyDrain();
    drainDisplay.textContent = `—${formatRate(drain)}/s`;
  }

  const autoToggle = document.getElementById('auto-convert-toggle');
  const amountInput = document.getElementById('auto-convert-amount');
  const intervalInput = document.getElementById('auto-convert-interval');

  if (autoToggle) {
    autoToggle.checked = gameState.autoConvertEnabled;
  }
  if (amountInput && !amountInput.matches(':focus')) {
    amountInput.value = gameState.autoConvertAmount;
    amountInput.disabled = !gameState.autoConvertEnabled;
  }
  if (intervalInput && !intervalInput.matches(':focus')) {
    intervalInput.value = gameState.autoConvertInterval;
    intervalInput.disabled = !gameState.autoConvertEnabled;
  }

  if (gameState.upgrades.boostUnlock) {
    if (boostBtn) boostBtn.style.display = '';
    if (boostBtn) {
      let cost = gameState.upgrades.boostEfficiency ? Math.floor(gameState.boostCost / 2) : gameState.boostCost;
      cost = Math.floor(cost * (0.85 ** (gameState.blessings.efficientCrafting || 0)));
      boostBtn.disabled = gameState.resources.energy < cost;
    }
    if (boostInfo) {
      if (gameState.boostActive) {
        const remaining = Math.max(0, Math.floor((gameState.boostEndTime - Date.now()) / 1000));
        boostInfo.textContent = `Active — ${remaining}s remaining (${gameState.boostMultiplier}× production)`;
        boostInfo.style.color = '#7ac4d8';
      } else {
        let cost = gameState.upgrades.boostEfficiency ? Math.floor(gameState.boostCost / 2) : gameState.boostCost;
        cost = Math.floor(cost * (0.85 ** (gameState.blessings.efficientCrafting || 0)));
        boostInfo.textContent = `Costs ${formatNumber(cost)} ⚡ — ${gameState.upgrades.boostPower ? '3' : '2'}× for ${gameState.upgrades.boostDuration ? '60' : '30'}s`;
        boostInfo.style.color = '';
      }
    }
  } else {
    if (boostBtn) boostBtn.style.display = 'none';
  }

  if (gameState.upgrades.convertUnlock) {
    if (convertBtn) convertBtn.style.display = '';
    if (convertBtn) {
      convertBtn.disabled = gameState.resources.energy < 50;
    }
    if (convertInfo) {
      const ratio = getConvertRatio();
      const maxConvert = Math.floor(gameState.resources.energy / 50) * ratio;
      convertInfo.textContent = `1 ⚡ → ${ratio} 📦 (max ${formatNumber(maxConvert)} 📦)`;
    }
  } else {
    if (convertBtn) convertBtn.style.display = 'none';
  }
}

function renderEnergyUpgrades() {
  const container = document.getElementById('energy-upgrades-list');
  if (!container) return;
  let html = '';
  for (const up of ENERGY_UPGRADES) {
    const owned = gameState.upgrades[up.id];
    const canBuy = gameState.resources.energy >= up.cost && isRoomUnlocked(up.roomUnlock) && !owned;
    const isLocked = !isRoomUnlocked(up.roomUnlock);

    html += `
      <div class="upgrade-item ${isLocked ? 'locked' : ''}">
        <div class="upgrade-info">
          <div class="upgrade-name">${up.icon} ${up.name}</div>
          <div class="upgrade-desc">${up.desc}</div>
        </div>
        <div class="upgrade-cost">${isLocked ? ROOM_NAMES[up.roomUnlock].icon + ' ' + ROOM_NAMES[up.roomUnlock].name : formatNumber(up.cost) + ' ⚡'}</div>
        <button class="buy-btn ${owned ? 'owned' : ''}" data-energy-upgrade="${up.id}" ${!canBuy || owned ? 'disabled' : ''} ${owned ? 'data-bought="true"' : ''}>${owned ? '✓ Owned' : 'Buy'}</button>
      </div>`;
  }
  container.innerHTML = html;
}

function renderAchievements() {
  const container = document.getElementById('achievements-list');
  if (!container) return;
  let html = '';
  for (const ach of ACHIEVEMENTS) {
    const unlocked = gameState.achievements.includes(ach.id);
    html += `
      <div class="achievement-item ${unlocked ? '' : 'locked'}">
        <div class="achievement-info">
          <div class="achievement-name">${ach.icon} ${ach.name}</div>
          <div class="achievement-desc">${unlocked ? '✅ ' : ''}${ach.desc}</div>
          <div class="achievement-reward">Reward: ${ach.reward}</div>
        </div>
      </div>`;
  }
  container.innerHTML = html;
}

function renderAltar() {
  const cost = getTitheCost();

  const costStuff = document.getElementById('altar-cost-stuff');
  const costEnergy = document.getElementById('altar-cost-energy');
  const costRp = document.getElementById('altar-cost-rp');
  if (costStuff) costStuff.textContent = formatNumber(cost.stuff) + ' 📦';
  if (costEnergy) costEnergy.textContent = formatNumber(cost.energy) + ' ⚡';
  if (costRp) costRp.textContent = formatNumber(cost.rp) + ' 📄';

  const btn = document.getElementById('altar-btn');
  if (btn) {
    btn.disabled = !canAffordTithe() || gameState.currentBlessingChoices.length > 0;
  }

  const cardsContainer = document.getElementById('blessing-cards');
  if (cardsContainer) {
    if (gameState.currentBlessingChoices.length > 0) {
      let html = '';
      for (const id of gameState.currentBlessingChoices) {
        const blessing = BLESSINGS.find(b => b.id === id);
        if (!blessing) continue;
        const rank = gameState.blessings[id] || 0;
        html += `
          <div class="blessing-card" data-blessing-id="${id}">
            <div class="card-name">${blessing.name}</div>
            <div class="card-effect">${blessing.desc}</div>
            ${rank > 0 ? `<div class="card-rank">Rank ${rank} → ${rank + 1}</div>` : '<div class="card-rank">New</div>'}
          </div>`;
      }
      cardsContainer.innerHTML = html;
      cardsContainer.style.display = 'flex';
    } else {
      cardsContainer.style.display = 'none';
      cardsContainer.innerHTML = '';
    }
  }

  const listContainer = document.getElementById('blessings-list');
  if (listContainer) {
    const owned = Object.entries(gameState.blessings).filter(([, rank]) => rank > 0);
    if (owned.length === 0) {
      listContainer.innerHTML = '<p class="text-dim">No blessings yet. Pray at the altar to receive one.</p>';
    } else {
      let html = '';
      for (const [id, rank] of owned) {
        const blessing = BLESSINGS.find(b => b.id === id);
        if (!blessing) continue;
        html += `<div class="owned-blessing"><span class="blessing-name">${blessing.name}</span> <span class="blessing-rank">×${rank}</span></div>`;
      }
      listContainer.innerHTML = html;
    }
  }
}

function renderAll() {
  try { renderItems(); } catch(e) { console.error('renderItems:', e); }
  try { renderUpgrades(); } catch(e) { console.error('renderUpgrades:', e); }
  try { renderAchievements(); } catch(e) { console.error('renderAchievements:', e); }
  try { renderAltar(); } catch(e) { console.error('renderAltar:', e); }
  try { renderEnergyItems(); } catch(e) { console.error('renderEnergyItems:', e); }
  try { renderResearchBuildings(); } catch(e) { console.error('renderResearchBuildings:', e); }
  try { renderResearchProjects(); } catch(e) { console.error('renderResearchProjects:', e); }
  try { renderEnergyActions(); } catch(e) { console.error('renderEnergyActions:', e); }
  try { renderEnergyUpgrades(); } catch(e) { console.error('renderEnergyUpgrades:', e); }
}

function showNotification(text) {
  const container = document.getElementById('notification-container');
  const el = document.createElement('div');
  el.className = 'notification';
  el.textContent = text;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
