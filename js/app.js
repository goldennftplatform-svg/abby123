/* =========================================================
   Rumi's Alphabet Stage - game logic
   ========================================================= */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function praise() { return pick(PRAISE); }
function tryAgainLine() { return pick(TRY_AGAIN); }

/* ---------------- settings & stars ---------------- */
const settings = {
  voice: localStorage.getItem('rumiVoice') !== 'off',
  sfx: localStorage.getItem('rumiSfx') !== 'off',
  music: localStorage.getItem('rumiMusic') !== 'off',
  slow: localStorage.getItem('rumiSlow') === 'on',
  voiceURI: localStorage.getItem('rumiVoiceURI') || ''
};

let stars = parseInt(localStorage.getItem('rumiStars') || '0', 10) || 0;
let seenLetters = [];
try { seenLetters = JSON.parse(localStorage.getItem('rumiSeen') || '[]') || []; } catch (e) { seenLetters = []; }

function saveSettings() {
  localStorage.setItem('rumiVoice', settings.voice ? 'on' : 'off');
  localStorage.setItem('rumiSfx', settings.sfx ? 'on' : 'off');
  localStorage.setItem('rumiMusic', settings.music ? 'on' : 'off');
  localStorage.setItem('rumiSlow', settings.slow ? 'on' : 'off');
  localStorage.setItem('rumiVoiceURI', settings.voiceURI || '');
}

function updateStarCount() { $('#starCount').textContent = stars; }
function addStar(amount = 1) {
  stars += amount;
  localStorage.setItem('rumiStars', String(stars));
  updateStarCount();
  const counter = $('#starCounter');
  counter.classList.remove('pop');
  void counter.offsetWidth;
  counter.classList.add('pop');
  sfx('star');

  if (stars > 0 && stars % 5 === 0) {
    stageVictory();
    confetti(30);
    toast(`✨ Honmoon power, ${CHILD_NAME}! ✨`, 2200);
    speak(`Honmoon power, ${CHILD_NAME}! Rumi is so proud of you!`);
  }
}

/* ---------------- sound: original synthesized stage audio ---------------- */
function initAudio() { if (window.RumiAudio) RumiAudio.init(); }
document.addEventListener('pointerdown', initAudio, { once: true });
document.addEventListener('keydown', initAudio, { once: true });

function sfx(name) { if (window.RumiAudio) RumiAudio.sfx(name); }
function stageJingle() { return window.RumiAudio ? RumiAudio.jingle() : 0; }
function stageVictory() {
  if (!window.RumiAudio) return;
  RumiAudio.victory();
  RumiAudio.honmoon();
}

/* Pick the nicest installed voice, or let a grown-up choose one. */
let voices = [];
function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  voices = window.speechSynthesis.getVoices() || [];
  const sel = $('#voiceSelect');
  if (!sel) return;
  const english = voices.filter(v => /^en/i.test(v.lang));
  sel.innerHTML = '<option value="">✨ Auto (best available)</option>' +
    english.map(v => `<option value="${v.voiceURI}">${v.name} (${v.lang})</option>`).join('');
  sel.value = english.some(v => v.voiceURI === settings.voiceURI) ? settings.voiceURI : '';
}

function chooseVoice() {
  if (!voices.length) return null;
  if (settings.voiceURI) {
    return voices.find(v => v.voiceURI === settings.voiceURI) || null;
  }
  const english = voices.filter(v => /^en/i.test(v.lang));
  const wanted = ['natural', 'neural', 'google', 'samantha', 'jenny', 'aria', 'zira', 'karen', 'moira', 'sonia', 'victoria', 'female'];
  return english.find(v => wanted.some(w => v.name.toLowerCase().includes(w))) ||
    english[0] || voices[0] || null;
}

if ('speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function speak(text, opts = {}) {
  if (!settings.voice || !('speechSynthesis' in window)) return;
  try {
    const synth = window.speechSynthesis;
    if (synth.speaking) synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = chooseVoice();
    if (voice) { u.voice = voice; u.lang = voice.lang; }
    else u.lang = 'en-US';
    u.rate = opts.rate || (settings.slow ? 0.66 : 0.92);
    u.pitch = opts.pitch || 1.0;
    u.volume = 1;
    synth.speak(u);
  } catch (e) { /* speech is a bonus, never block play */ }
}

/* ---------------- shared feedback ---------------- */
let toastTimer = null;
function toast(message, ms = 1500) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

function confetti(count = 24) {
  const layer = $('#confetti');
  const colors = ['#ff5fb8', '#ffd45e', '#7b5cff', '#3fd6cf', '#ff8a4c', '#ffffff'];
  for (let i = 0; i < count; i++) {
    const bit = document.createElement('i');
    bit.className = 'confetti-bit';
    bit.style.left = Math.random() * 100 + '%';
    bit.style.background = pick(colors);
    bit.style.setProperty('--dur', (1.5 + Math.random() * 1.4).toFixed(2) + 's');
    bit.style.setProperty('--delay', (Math.random() * 0.35).toFixed(2) + 's');
    bit.style.transform = `rotate(${Math.random() * 360}deg)`;
    layer.appendChild(bit);
    setTimeout(() => bit.remove(), 3400);
  }
}

let roundTimer = null;
function later(fn, ms) { clearTimeout(roundTimer); roundTimer = setTimeout(fn, ms); }

function celebrate(message, word, opts = {}) {
  sfx('correct');
  confetti();
  addStar();
  toast(message);
  if (!opts.spell) speak(word ? `${word}! ${message}` : message);
}

function beat(ms) { return new Promise(resolve => later(resolve, ms)); }

/* Show and say each letter of a matched word, one at a time. */
async function spellLetters(word, el, message) {
  if (!el) return;
  const letters = word.split('').filter(c => c !== ' ');
  el.innerHTML = letters.map(l => `<span>${l.toUpperCase()}</span>`).join('<i>·</i>');
  const spans = $$('span', el);
  for (let i = 0; i < spans.length; i++) {
    spans[i].classList.add('active');
    sfx('tap');
    speak(letters[i], { rate: settings.slow ? 0.5 : 0.62, pitch: 1.25 });
    await beat(settings.slow ? 620 : 470);
    spans[i].classList.remove('active');
    spans[i].classList.add('done');
  }
  if (message) speak(`${word}! ${message}`);
}

/* ---------------- navigation ---------------- */
let currentView = 'home';
const TAGLINES = {
  home: `${CHILD_NAME}, sing it. See it. Learn it!`,
  alpha: `A, B, C — sing with ${CHILD_NAME}!`,
  color: `${CHILD_NAME}, colors everywhere!`,
  word: `${CHILD_NAME}, read the little word!`,
  spell: `${CHILD_NAME}, tap the letters!`,
  wall: `80 pictures for ${CHILD_NAME}!`
};

function showView(name) {
  clearTimeout(roundTimer);
  closeLetterOverlay();
  currentView = name;
  $$('.view').forEach(v => v.classList.toggle('is-active', v.id === 'view-' + name));
  $('#mascotPeek').style.display = name === 'home' ? '' : 'none';
  $('#tagline').textContent = TAGLINES[name] || TAGLINES.home;
  if (name === 'home') $('#homeTip').textContent = pick(HOME_TIPS);
  $('.stage').scrollTop = 0;
  const view = $('#view-' + name);
  if (view) view.scrollTop = 0;
  if (name === 'word' && wordQueue.length === 0) startWords();
}

$$('[data-view]').forEach(btn => btn.addEventListener('click', () => { sfx('tap'); showView(btn.dataset.view); }));
$$('[data-go-home]').forEach(btn => btn.addEventListener('click', () => { sfx('tap'); showView('home'); }));
$('#homeBtn').addEventListener('click', () => { sfx('tap'); showView('home'); });
$('#heroSay').addEventListener('click', () => {
  sfx('mic');
  const line = pick(GREETINGS);
  speak(line);
  toast(`Hi ${CHILD_NAME}! ✨`, 2000);
});

let themeTimer = null;
$('#themeBtn').addEventListener('click', () => {
  initAudio();
  const btn = $('#themeBtn');
  if (!settings.music) {
    toast('Turn on stage music in the grown-up corner 🎵', 2200);
    return;
  }
  if (RumiAudio.isPlaying()) {
    RumiAudio.stopMusic();
    btn.classList.remove('playing');
    btn.textContent = "🎵 Rumi's Stage Theme";
    clearTimeout(themeTimer);
    return;
  }
  const duration = stageJingle();
  if (duration > 0) {
    btn.classList.add('playing');
    btn.textContent = '⏹ Stop the music';
    clearTimeout(themeTimer);
    themeTimer = setTimeout(() => {
      btn.classList.remove('playing');
      btn.textContent = "🎵 Rumi's Stage Theme";
    }, duration * 1000);
    speak(`Let's shine, ${CHILD_NAME}!`);
  }
});

/* ---------------- alphabet ---------------- */
let alphaIndex = 0;
let alphaWordIndex = 0;
let overlay = null;

function letterWords(a) {
  return [{ word: a.word, emoji: a.emoji }].concat(a.more || []);
}

function buildAlphabet() {
  $('#letterGrid').innerHTML = ALPHABET.map((a, i) => `
    <button class="letter-tile${seenLetters.includes(a.letter) ? ' seen' : ''}"
            data-index="${i}" type="button"
            style="--tile-color:${TILE_COLORS[i % TILE_COLORS.length]}"
            aria-label="Letter ${a.letter} for ${a.word}">
      <span class="big">${a.letter}</span>
      <span class="tile-emoji">${a.emoji}</span>
    </button>`).join('');
}

function renderLetterPop(a) {
  const list = letterWords(a);
  const current = list[alphaWordIndex % list.length];
  const pop = $('.letter-pop', overlay);
  $('.pop-emoji', pop).textContent = current.emoji;
  $('.pop-word', pop).textContent = current.word;
  $('.pop-sound', pop).innerHTML = `${a.letter} says <strong>${a.letter.toLowerCase()}</strong> &mdash; ${current.word}!`;
  const more = $('[data-pop="more"]', pop);
  more.classList.toggle('hidden', list.length < 2);
  more.textContent = `🔄 More words (${list.length})`;
  return current;
}

function openLetter(i) {
  alphaIndex = i;
  alphaWordIndex = 0;
  const a = ALPHABET[i];
  closeLetterOverlay();

  if (!seenLetters.includes(a.letter)) {
    seenLetters.push(a.letter);
    localStorage.setItem('rumiSeen', JSON.stringify(seenLetters));
    addStar();
    $(`[data-index="${i}"]`)?.classList.add('seen');
  }
  $('#alphaProgress').textContent = `${seenLetters.length} / 26`;

  overlay = document.createElement('div');
  overlay.className = 'letter-overlay';
  overlay.innerHTML = `
    <div class="letter-pop" role="dialog" aria-modal="true" aria-label="Letter ${a.letter}">
      <button class="pop-close" type="button" aria-label="Close">✕</button>
      <div class="pop-top">
        <div class="pop-letter">${a.letter}</div>
        <div class="pop-side">
          <span class="pop-emoji">${a.emoji}</span>
          <span class="pop-lower">${a.letter.toLowerCase()}</span>
        </div>
      </div>
      <div class="pop-word">${a.word}</div>
      <p class="pop-sound">${a.letter} says <strong>${a.letter.toLowerCase()}</strong> &mdash; ${a.word}!</p>
      <div class="row-buttons">
        <button class="action-btn" data-pop="say" type="button">🔊 Say it</button>
        <button class="action-btn" data-pop="more" type="button">🔄 More words</button>
        <button class="action-btn action-next" data-pop="next" type="button">Next ➡️</button>
      </div>
    </div>`;
  $('#view-alpha').appendChild(overlay);

  const current = renderLetterPop(a);

  $('.pop-close', overlay).addEventListener('click', closeLetterOverlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeLetterOverlay(); });
  $('[data-pop="say"]', overlay).addEventListener('click', () => {
    sfx('tap');
    const w = letterWords(a)[alphaWordIndex % letterWords(a).length];
    speak(`${a.letter}. ${a.letter} for ${w.word}.`);
  });
  $('[data-pop="more"]', overlay).addEventListener('click', () => {
    alphaWordIndex++;
    const w = renderLetterPop(a);
    sfx('tap');
    speak(`${a.letter} for ${w.word}.`);
  });
  $('[data-pop="next"]', overlay).addEventListener('click', () => {
    sfx('tap'); openLetter((alphaIndex + 1) % ALPHABET.length);
  });

  sfx('mic');
  speak(`${a.letter}. ${a.letter} for ${current.word}.`);
}

function closeLetterOverlay() {
  if (overlay) { overlay.remove(); overlay = null; }
}

$('#letterGrid').addEventListener('click', e => {
  const tile = e.target.closest('.letter-tile');
  if (tile) openLetter(parseInt(tile.dataset.index, 10));
});

/* ---------------- colors ---------------- */
let colorMode = 'learn';
let colorIndex = 0;
let findTarget = null;
let findLocked = false;

function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amount));
  const b = Math.max(0, Math.min(255, (n & 255) + amount));
  return `rgb(${r},${g},${b})`;
}

function renderSwatches() {
  $('#swatchRow').innerHTML = COLORS.map((c, i) =>
    `<button class="swatch${i === colorIndex ? ' is-current' : ''}" data-color="${i}"
       style="background:${c.hex}" aria-label="${c.name}" type="button"></button>`).join('');
}

function renderColorLearn() {
  const c = COLORS[colorIndex];
  const orb = $('#spotlightOrb');
  orb.style.setProperty('--orb', c.hex);
  orb.style.setProperty('--orb-dark', shade(c.hex, -55));
  orb.style.setProperty('--orb-glow', c.hex + 'cc');
  $('#colorName').textContent = c.name;
  $('#colorExample').textContent = c.emoji;
  $('#colorProgress').textContent = `${colorIndex + 1} / ${COLORS.length}`;
  renderSwatches();
  speak(`This is ${c.name}.`);
}

function starMarkup(color, label) {
  return `<svg viewBox="0 0 24 24" style="color:${color}" role="img" aria-label="${label}"><use href="#star-icon"></use></svg>`;
}

function renderColorFind() {
  findLocked = false;
  const options = shuffle(COLORS).slice(0, 4);
  findTarget = pick(options);
  $('#colorPrompt').innerHTML = `${CHILD_NAME}, find the <strong>${findTarget.name.toLowerCase()}</strong> star!`;
  $('#colorHint').textContent = `Tap the right star, ${CHILD_NAME}!`;
  $('#starOptions').innerHTML = options.map(c =>
    `<button class="big-star" data-name="${c.name}" type="button"
       aria-label="${c.name} star">${starMarkup(c.hex, c.name)}</button>`).join('');
  $('#colorProgress').textContent = 'Find it!';
  speak(`Find the ${findTarget.name.toLowerCase()} star.`);
}

$$('[data-color-mode]').forEach(tab => tab.addEventListener('click', () => {
  sfx('tap');
  colorMode = tab.dataset.colorMode;
  $$('[data-color-mode]').forEach(t => {
    t.classList.toggle('is-active', t === tab);
    t.setAttribute('aria-selected', String(t === tab));
  });
  $('#colorLearn').classList.toggle('hidden', colorMode !== 'learn');
  $('#colorFind').classList.toggle('hidden', colorMode !== 'find');
  if (colorMode === 'learn') renderColorLearn(); else renderColorFind();
}));

$('#swatchRow').addEventListener('click', e => {
  const b = e.target.closest('[data-color]');
  if (!b) return;
  colorIndex = parseInt(b.dataset.color, 10);
  sfx('tap'); renderColorLearn();
});
$('#colorSay').addEventListener('click', () => { sfx('tap'); speak(`${COLORS[colorIndex].name}!`); });
$('#colorNext').addEventListener('click', () => {
  sfx('tap');
  colorIndex = (colorIndex + 1) % COLORS.length;
  renderColorLearn();
});
$('#starOptions').addEventListener('click', e => {
  const btn = e.target.closest('.big-star');
  if (!btn || findLocked) return;
  if (btn.dataset.name === findTarget.name) {
    findLocked = true;
    btn.style.filter = 'drop-shadow(0 0 16px #fff)';
    const msg = praise();
    sfx('lightstick'); sfx('correct'); confetti(18); addStar(); toast(msg);
    speak(`${findTarget.name}! ${msg}`);
    later(renderColorFind, 1200);
  } else {
    btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake');
    sfx('wrong'); speak(tryAgainLine());
  }
});

/* ---------------- words ---------------- */
let wordQueue = [];
let wordIndex = 0;
let wordLocked = false;
let currentWord = null;

function startWords() {
  wordQueue = shuffle(WORDS).slice(0, 10);
  wordIndex = 0;
  renderWord();
}

function renderWord() {
  wordLocked = false;
  currentWord = wordQueue[wordIndex % wordQueue.length];
  const reverse = wordIndex % 2 === 1;
  $('#wordProgress').textContent = `${wordIndex + 1} / ${wordQueue.length}`;

  $('#wordSpell').innerHTML = '';
  const target = $('#wordTarget');
  target.classList.toggle('as-word', reverse);
  target.textContent = reverse ? currentWord.word : currentWord.emoji;
  $('#wordQuestion').innerHTML = reverse
    ? `Which picture is a <strong>${currentWord.word}</strong>?`
    : `Which word is <strong>${currentWord.word}</strong>?`;

  const distractors = shuffle(WORDS.filter(w => w.word !== currentWord.word)).slice(0, 2);
  const choices = shuffle([currentWord, ...distractors]);
  $('#wordAnswers').innerHTML = choices.map(w =>
    `<button class="answer-btn" data-word="${w.word}" type="button"
       aria-label="${reverse ? w.emoji + ' picture' : 'the word ' + w.word}">${reverse ? w.emoji : w.word}</button>`).join('');

  speak(reverse
    ? `Which picture is a ${currentWord.word}?`
    : `Which word is ${currentWord.word}?`);
}

$('#wordAnswers').addEventListener('click', async e => {
  const btn = e.target.closest('.answer-btn');
  if (!btn || wordLocked) return;
  if (btn.dataset.word === currentWord.word) {
    wordLocked = true;
    btn.classList.add('good');
    const message = praise();
    celebrate(message, currentWord.word, { spell: true });
    await spellLetters(currentWord.word, $('#wordSpell'), message);
    later(() => { wordIndex++; renderWord(); }, 700);
  } else {
    btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake');
    sfx('wrong'); speak(tryAgainLine());
  }
});
$('#wordSay').addEventListener('click', () => {
  sfx('tap');
  speak(wordIndex % 2 === 1
    ? `Which picture is a ${currentWord.word}?`
    : `Which word is ${currentWord.word}?`);
});

/* ---------------- spelling ---------------- */
let spellQueue = [];
let spellIndex = 0;
let spellWord = '';
let spellSlots = [];
let spellBank = [];
let spellLocked = false;

function startSpelling() {
  spellQueue = shuffle(SPELL_WORDS).slice(0, 10);
  spellIndex = 0;
  renderSpell();
}

function renderSpell() {
  spellLocked = false;
  spellWord = spellQueue[spellIndex % spellQueue.length].word;
  const emoji = spellQueue[spellIndex % spellQueue.length].emoji;
  spellSlots = Array(spellWord.length).fill('');
  const extras = shuffle(LETTER_BANK.filter(l => !spellWord.includes(l))).slice(0, Math.max(2, 6 - spellWord.length));
  spellBank = shuffle(spellWord.split('').concat(extras));

  $('#spellProgress').textContent = `${spellIndex + 1} / ${spellQueue.length}`;
  $('#spellPicture').textContent = emoji;
  $('#spellLabel').textContent = `Build the word: ${spellWord.length} letters`;
  $('#letterSlots').innerHTML = spellSlots.map((_, i) =>
    `<div class="slot" data-slot="${i}" aria-label="Letter ${i + 1}">${spellSlots[i]}</div>`).join('');
  $('#letterBank').innerHTML = spellBank.map((l, i) =>
    `<button class="tile-letter" data-i="${i}" data-letter="${l}" type="button" aria-label="Letter ${l}">${l}</button>`).join('');
  $('#spellNext').disabled = false;
  speak(`Build the word ${spellWord}. ${spellWord.split('').join(' ... ')}`);
}

$('#letterBank').addEventListener('click', e => {
  const btn = e.target.closest('.tile-letter');
  if (!btn || spellLocked || btn.classList.contains('used')) return;
  const slotIndex = spellSlots.findIndex(s => s === '');
  if (slotIndex === -1) return;

  if (btn.dataset.letter === spellWord[slotIndex]) {
    spellSlots[slotIndex] = btn.dataset.letter;
    btn.classList.add('used');
    const slot = $(`[data-slot="${slotIndex}"]`);
    slot.textContent = btn.dataset.letter;
    slot.classList.add('filled');
    sfx('tap');
    speak(btn.dataset.letter, { rate: settings.slow ? 0.55 : 0.7 });
    if (!spellSlots.includes('')) {
      spellLocked = true;
      sfx('powerup');
      celebrate('You spelled it!', spellWord);
      later(() => { spellIndex++; renderSpell(); }, 1900);
    }
  } else {
    btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake');
    sfx('wrong'); speak(tryAgainLine());
  }
});

$('#spellClear').addEventListener('click', () => {
  if (spellLocked) return;
  sfx('tap');
  spellSlots = Array(spellWord.length).fill('');
  $$('.slot').forEach(s => { s.textContent = ''; s.classList.remove('filled'); });
  $$('.tile-letter').forEach(t => t.classList.remove('used'));
});
$('#spellNext').addEventListener('click', () => { sfx('tap'); spellIndex++; renderSpell(); });
$('#spellSay').addEventListener('click', () => {
  sfx('tap');
  speak(`${spellWord}. ${spellWord.split('').join(' ... ')}`);
});

/* ---------------- picture wall ---------------- */
let wallCategory = 'All';
let wallBusy = false;

function renderWallTabs() {
  const cats = ['All'].concat(Array.from(new Set(WORDS.map(w => w.category))));
  $('#wallTabs').innerHTML = cats.map(c => `
    <button class="tab${c === wallCategory ? ' is-active' : ''}" data-cat="${c}"
            role="tab" aria-selected="${c === wallCategory}" type="button">${c === 'All' ? '✨ All' : c}</button>`).join('');
}

function renderWall() {
  const list = wallCategory === 'All' ? WORDS : WORDS.filter(w => w.category === wallCategory);
  $('#wallProgress').textContent = `${list.length} pictures`;
  $('#wallGrid').innerHTML = list.map((w, i) => `
    <button class="wall-card" data-i="${i}" type="button" aria-label="Hear and spell ${w.word}">
      <span class="w-emoji">${w.emoji}</span>
      <span class="w-word">${w.word}</span>
      <span class="w-cat">${w.category}</span>
    </button>`).join('');
  $('#wallSpell').innerHTML = '';
}

$('#wallTabs').addEventListener('click', e => {
  const b = e.target.closest('[data-cat]');
  if (!b) return;
  wallCategory = b.dataset.cat;
  sfx('tap');
  renderWallTabs();
  renderWall();
});

$('#wallGrid').addEventListener('click', async e => {
  const b = e.target.closest('.wall-card');
  if (!b || wallBusy) return;
  const list = wallCategory === 'All' ? WORDS : WORDS.filter(w => w.category === wallCategory);
  const w = list[parseInt(b.dataset.i, 10)];
  wallBusy = true;
  sfx('tap');
  speak(w.word);
  await beat(420);
  await spellLetters(w.word, $('#wallSpell'), 'Great spelling!');
  wallBusy = false;
});

/* ---------------- move parade mini-game ---------------- */
let paradeMoves = [];
let paradeStep = 0;
let paradeLocked = false;

function renderMoveStart() {
  paradeLocked = false;
  $('#moveProgress').textContent = 'Ready';
  $('#movePanel').innerHTML = `
    <div class="move-title">Ready to move, ${CHILD_NAME}?</div>
    <p class="move-hint">Rumi shows two moves. Then you guess what comes next!</p>
    <button class="say-btn" data-move-action="start" type="button">▶ Start the parade</button>`;
}

function startParade() {
  paradeMoves = shuffle(MOVES).slice(0, 3);
  paradeStep = 0;
  paradeLocked = false;
  renderParadeStep();
}

function renderParadeStep() {
  paradeLocked = false;
  if (paradeStep >= 2) { renderParadeQuestion(); return; }
  const move = paradeMoves[paradeStep];
  const order = MOVE_ORDER[paradeStep];
  $('#moveProgress').textContent = `${order} / Then?`;
  $('#movePanel').innerHTML = `
    <div class="move-step-label">${order}</div>
    <div class="move-emoji" aria-hidden="true">${move.emoji}</div>
    <div class="move-label">${move.label}</div>
    <div class="row-buttons">
      <button class="action-btn listen-btn" data-move-action="say" type="button">🔊 Say it again</button>
      <button class="action-btn action-next" data-move-action="done" type="button">I did it! ✓</button>
    </div>`;
  if (currentView === 'home') speak(`${order}, ${CHILD_NAME}, ${move.say}!`);
}

function renderParadeQuestion() {
  paradeLocked = false;
  const correct = paradeMoves[2];
  const choices = shuffle([correct, ...shuffle(MOVES.filter(m => m.label !== correct.label)).slice(0, 2)]);
  $('#moveProgress').textContent = 'What next?';
  $('#movePanel').innerHTML = `
    <div class="move-step-label">Then what?</div>
    <div class="move-sequence">
      <span class="seq-chip">${paradeMoves[0].emoji}</span>
      <span class="seq-arrow">➜</span>
      <span class="seq-chip">${paradeMoves[1].emoji}</span>
      <span class="seq-arrow">➜</span>
      <span class="seq-question">?</span>
    </div>
    <p class="move-hint">${CHILD_NAME}, tap the move that comes next!</p>
    <div class="move-choices">
      ${choices.map(m => `
        <button class="move-choice" data-move-choice="${m.label}" type="button"
                aria-label="${m.label}">
          <span class="m-emoji">${m.emoji}</span>
          <span class="m-label">${m.label}</span>
        </button>`).join('')}
    </div>`;
  if (currentView === 'home') {
    speak(`${CHILD_NAME}, we did ${paradeMoves[0].say}, then ${paradeMoves[1].say}. What comes next?`);
  }
}

$('#movePanel').addEventListener('click', e => {
  const actionBtn = e.target.closest('[data-move-action]');
  if (actionBtn) {
    const action = actionBtn.dataset.moveAction;
    sfx('tap');
    if (action === 'start') { startParade(); return; }
    if (action === 'say' && paradeMoves[paradeStep]) {
      speak(`${MOVE_ORDER[paradeStep]}, ${CHILD_NAME}, ${paradeMoves[paradeStep].say}!`);
      return;
    }
    if (action === 'done' && !paradeLocked && paradeMoves[paradeStep]) {
      paradeLocked = true;
      const move = paradeMoves[paradeStep];
      const msg = praise();
      sfx('correct'); addStar(); toast(msg);
      speak(`${move.say}! ${msg}`);
      later(() => { paradeStep++; renderParadeStep(); }, 1100);
      return;
    }
  }

  const choiceBtn = e.target.closest('[data-move-choice]');
  if (!choiceBtn || paradeLocked || paradeMoves.length < 3) return;
  const correct = paradeMoves[2];
  if (choiceBtn.dataset.moveChoice === correct.label) {
    paradeLocked = true;
    choiceBtn.classList.add('good');
    const msg = praise();
    sfx('correct'); confetti(18); addStar(); toast(msg);
    speak(`Yes! ${correct.say}! ${msg}`);
    later(startParade, 1900);
  } else {
    choiceBtn.classList.remove('shake'); void choiceBtn.offsetWidth; choiceBtn.classList.add('shake');
    const line = tryAgainLine();
    sfx('wrong'); toast(line); speak(line);
  }
});

/* ---------------- grown-up settings ---------------- */
const modal = $('#parentModal');
function openModal() { modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); }
function closeModal() { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); }

$('#parentBtn').addEventListener('click', () => { sfx('tap'); openModal(); });
$$('[data-close-modal]').forEach(el => el.addEventListener('click', closeModal));

$('#voiceToggle').checked = settings.voice;
$('#sfxToggle').checked = settings.sfx;
$('#musicToggle').checked = settings.music;
$('#slowToggle').checked = settings.slow;

$('#voiceToggle').addEventListener('change', e => {
  settings.voice = e.target.checked; saveSettings();
  if (settings.voice) speak(`Voice is on, ${CHILD_NAME}!`);
  else if ('speechSynthesis' in window) window.speechSynthesis.cancel();
});
$('#voiceSelect').addEventListener('change', e => {
  settings.voiceURI = e.target.value;
  saveSettings();
  speak(`Hi ${CHILD_NAME}! This is my new stage voice!`);
});
$('#testVoice').addEventListener('click', () => {
  sfx('tap');
  speak(pick(GREETINGS));
});
$('#sfxToggle').addEventListener('change', e => {
  settings.sfx = e.target.checked;
  RumiAudio.setSfx(settings.sfx);
  saveSettings();
  if (settings.sfx) sfx('tap');
});
$('#musicToggle').addEventListener('change', e => {
  settings.music = e.target.checked;
  RumiAudio.setMusic(settings.music);
  saveSettings();
  if (settings.music) sfx('lightstick');
});
$('#slowToggle').addEventListener('change', e => { settings.slow = e.target.checked; saveSettings(); });
$('#resetStars').addEventListener('click', () => {
  if (!confirm('Reset all stars and letter progress?')) return;
  stars = 0; seenLetters = [];
  localStorage.setItem('rumiStars', '0');
  localStorage.setItem('rumiSeen', '[]');
  updateStarCount(); buildAlphabet(); $('#alphaProgress').textContent = '0 / 26';
  toast(`Fresh start for ${CHILD_NAME}! ✨`);
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (modal.classList.contains('is-open')) closeModal();
  else closeLetterOverlay();
});

/* ---------------- boot ---------------- */
RumiAudio.setSfx(settings.sfx);
RumiAudio.setMusic(settings.music);
updateStarCount();
buildAlphabet();
$('#alphaProgress').textContent = `${seenLetters.length} / 26`;
renderColorLearn();
startWords();
startSpelling();
renderWallTabs();
renderWall();
renderMoveStart();
$('#homeTip').textContent = pick(HOME_TIPS);
setInterval(() => {
  if (currentView === 'home') $('#homeTip').textContent = pick(HOME_TIPS);
}, 8000);
