(function () {
  'use strict';

  const STORAGE_KEY = 'sylab.state';
  // Opening of Vítězslav Nezval's Edison (1928).
  const SAMPLE = [
    'Naše životy jsou truchlivé jak pláč',
    'Jednou kvečeru šel z herny mladý hráč',
    'venku sněžilo nad monstrancemi barů',
    'vzduch byl vlhký neboť chýlilo se k jaru',
    'avšak noc se chvěla jako prérie',
    'pod údery hvězdné artilerie',
    'které naslouchali u politických stolů',
    'pijáci nad sklenicemi alkoholů',
    'polonahé ženy v šatě z pavích per',
    'melancholikové jako vpodvečer',
    '',
    'Bylo tu však něco těžkého co drtí',
    'smutek stesk a úzkost z života i smrti',
  ].join('\n');

  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const joinVowels = document.getElementById('join-vowels');
  const copyButton = document.getElementById('copy');
  const clearButton = document.getElementById('clear');

  let plainOutput = '';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
    } catch (e) {
      return null;
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ text: input.value, joinVowels: joinVowels.checked }));
    } catch (e) {
      // Storage unavailable (private mode, file:// in some browsers) — nothing to persist.
    }
  }

  function toNode(part) {
    if (part.kind === 'text') return document.createTextNode(part.text);
    const span = document.createElement('span');
    span.className = part.kind;
    span.textContent = part.text;
    return span;
  }

  // Words (including v+word pairs) go into nowrap spans so lines never break at a syllable hyphen.
  function render() {
    const parts = Sylab.syllabifyParts(input.value, { joinSingleLetterVowels: joinVowels.checked });
    plainOutput = parts.map((p) => p.text).join('');

    const fragment = document.createDocumentFragment();
    let word = null;
    for (const part of parts) {
      if (part.kind === 'text' && /^\s+$/.test(part.text)) {
        fragment.append(part.text);
        word = null;
        continue;
      }
      if (!word) {
        word = document.createElement('span');
        word.className = 'word';
        fragment.append(word);
      }
      word.append(toNode(part));
    }
    output.replaceChildren(fragment);
    save();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(plainOutput);
    } catch (e) {
      const scratch = document.createElement('textarea');
      scratch.value = plainOutput;
      document.body.appendChild(scratch);
      scratch.select();
      document.execCommand('copy');
      scratch.remove();
    }
    copyButton.textContent = 'Zkopírováno';
    setTimeout(() => (copyButton.textContent = 'Kopírovat'), 1500);
  }

  const saved = load();
  input.value = saved ? saved.text : SAMPLE;
  joinVowels.checked = Boolean(saved && saved.joinVowels);

  input.addEventListener('input', render);
  joinVowels.addEventListener('change', render);
  copyButton.addEventListener('click', copy);
  clearButton.addEventListener('click', () => {
    input.value = '';
    render();
    input.focus();
  });

  render();

  // Service workers need http(s); opening index.html from disk still works, just without offline/install.
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js');
  }
})();
