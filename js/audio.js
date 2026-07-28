let sfxVolume = 1;
let musicVolume = 1;
let bgmAudio = null;
let whooshRaw = null;
let upgradeRaw = null;

function setSFXVolume(v) {
  sfxVolume = v / 100;
}

function setMusicVolume(v) {
  musicVolume = v / 100;
  if (bgmAudio) bgmAudio.volume = musicVolume;
}

function initBGM() {
  bgmAudio = new Audio('bgm.mp3');
  bgmAudio.loop = true;
  bgmAudio.volume = 0;
}

function startBGM() {
  if (!bgmAudio) initBGM();
  if (bgmAudio.paused) bgmAudio.play().catch(() => {});
  bgmAudio.volume = 0;
  const target = musicVolume;
  const steps = 100;
  let i = 0;
  const interval = setInterval(() => {
    i++;
    bgmAudio.volume = (i / steps) * target;
    if (i >= steps) clearInterval(interval);
  }, 100);
}

function initWhoosh() {
  fetch(WHOOSH_DATA_URI)
    .then(r => r.arrayBuffer())
    .then(buf => { whooshRaw = buf; })
    .catch(() => {});
}

function playWhoosh() {
  if (!whooshRaw) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  ctx.decodeAudioData(whooshRaw.slice(0))
    .then(buffer => {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.playbackRate.value = 1;
      src.detune.value = -1200;
      const gain = ctx.createGain();
      gain.gain.value = sfxVolume;
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start();
    })
    .catch(() => {});
}

function initUpgradeSound() {
  upgradeRaw = new Audio('upgrade.mp3');
  upgradeRaw.volume = sfxVolume;
}

function playUpgradeSound() {
  if (!upgradeRaw) return;
  const clone = upgradeRaw.cloneNode();
  clone.volume = sfxVolume;
  clone.play().catch(() => {});
}

function playSFX(src) {
  const audio = new Audio(src);
  audio.volume = sfxVolume;
  audio.play().catch(() => {});
}
