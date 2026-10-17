/*
 * Czech syllabification (slabikování).
 *
 * Rule-based, no dictionary:
 *  - nuclei are vowels, diphthongs (ou, au, eu) and syllabic r, l (vlk, Pe-tr, ja-bl-ko)
 *    plus word-final m (se-dm, o-sm)
 *  - "ch" is a single consonant
 *  - one consonant between nuclei goes to the next syllable (ma-ma)
 *  - in a longer cluster only the last consonant goes to the next syllable (mat-ka, kost-ka),
 *    or the last two when they form stop + liquid (do-brý, ses-tra, ře-kla)
 *    or, in clusters of three or more, sibilant + stop (lid-ský, ďá-bel-ské)
 *  - non-syllabic prepositions k, s, v, z are joined to the following word (v+do-mě)
 *
 * Works as a classic <script> (exposes window.Sylab) and as a CommonJS module.
 */
(function (root) {
  'use strict';

  const VOWELS = 'aáeéěiíoóuúůyý';
  const LIQUIDS = ['r', 'l', 'ř'];
  // Consonants that open a syllable together with a following liquid: tra, bla, kři, vrá.
  const STOPS = ['b', 'p', 'd', 't', 'ď', 'ť', 'g', 'k', 'v', 'f', 'h', 'ch'];
  // In clusters of three or more, sibilant + stop opens the next syllable: lid-ský, žen-ský.
  const SIBILANTS = ['s', 'z', 'š', 'ž'];
  const VOICELESS_STOPS = ['k', 't', 'p'];
  // A syllabic r/l never follows these (Karl, Orlík).
  const NOT_BEFORE_SYLLABIC = ['r', 'l', 'j'];

  const NON_SYLLABIC_PREPOSITIONS = ['k', 's', 'v', 'z'];
  const SINGLE_LETTER_VOWEL_WORDS = ['o', 'u', 'a', 'i'];

  // Prefix + "u" that must not merge into a diphthong (po-u-žít, na-u-čit, ne-u-mím).
  const OU_HIATUS = /^(po|do|pro)u[žčk]/;
  const AU_HIATUS = /^(na|za|pra)u/;
  const EU_HIATUS_PREFIX = /^(ne|pře|vše)u/;
  const EU_DIPHTHONG_EXCEPTIONS = /^(neutr|neuro|neurál)/;

  const DEFAULTS = {
    separator: '-',
    joiner: '+',
    joinSingleLetterVowels: false,
  };

  function isVowel(ch) {
    return VOWELS.includes(ch);
  }

  // True when the vowel pair at `i` straddles the end of the prefix captured by `re` (p[o|u]žít).
  function prefixEndsAt(re, word, i) {
    const m = re.exec(word);
    return m !== null && m[1].length === i + 1;
  }

  function isDiphthong(lower, i) {
    const pair = lower[i] + (lower[i + 1] || '');
    const word = lower.join('');
    if (pair === 'ou') return !prefixEndsAt(OU_HIATUS, word, i);
    if (pair === 'au') return !prefixEndsAt(AU_HIATUS, word, i);
    if (pair === 'eu') {
      if (i === 0) return true;
      if (EU_DIPHTHONG_EXCEPTIONS.test(word)) return true;
      if (prefixEndsAt(EU_HIATUS_PREFIX, word, i)) return false;
      // mu-ze-um, ly-ce-um
      if (i + 2 === lower.length - 1 && lower[i + 2] === 'm') return false;
      return true;
    }
    return false;
  }

  /** Splits a word into phonological units: { text, key, nucleus }. */
  function toUnits(word) {
    const chars = Array.from(word);
    const lower = chars.map((c) => {
      const l = c.toLowerCase();
      return l.length === 1 ? l : c;
    });
    const units = [];
    let i = 0;
    while (i < chars.length) {
      if (lower[i] === 'c' && lower[i + 1] === 'h') {
        units.push({ text: chars[i] + chars[i + 1], key: 'ch', nucleus: false });
        i += 2;
      } else if (isVowel(lower[i]) && isDiphthong(lower, i)) {
        units.push({ text: chars[i] + chars[i + 1], key: lower[i] + lower[i + 1], nucleus: true });
        i += 2;
      } else {
        units.push({ text: chars[i], key: lower[i], nucleus: isVowel(lower[i]) });
        i += 1;
      }
    }
    markSyllabicConsonants(units);
    return units;
  }

  function markSyllabicConsonants(units) {
    for (let i = 1; i < units.length; i++) {
      const unit = units[i];
      const prev = units[i - 1];
      const next = units[i + 1];
      const isLast = i === units.length - 1;
      const candidate = unit.key === 'r' || unit.key === 'l' || (unit.key === 'm' && isLast);
      if (!candidate || unit.nucleus) continue;
      if (prev.nucleus || NOT_BEFORE_SYLLABIC.includes(prev.key)) continue;
      if (next && next.nucleus) continue;
      unit.nucleus = true;
    }
  }

  /** How many consonants of the cluster between two nuclei start the next syllable. */
  function onsetLength(cluster) {
    const n = cluster.length;
    if (n <= 1) return n;
    if (LIQUIDS.includes(cluster[n - 1]) && STOPS.includes(cluster[n - 2])) return 2;
    if (n >= 3 && VOICELESS_STOPS.includes(cluster[n - 1]) && SIBILANTS.includes(cluster[n - 2])) return 2;
    return 1;
  }

  /** Returns the syllables of a single word; a word without a nucleus is returned whole. */
  function syllabifyWord(word) {
    const units = toUnits(word);
    const nuclei = [];
    units.forEach((u, i) => {
      if (u.nucleus) nuclei.push(i);
    });
    if (nuclei.length < 2) return [word];

    const syllables = [];
    let start = 0;
    for (let k = 0; k < nuclei.length - 1; k++) {
      const cluster = units.slice(nuclei[k] + 1, nuclei[k + 1]).map((u) => u.key);
      const boundary = nuclei[k + 1] - onsetLength(cluster);
      syllables.push(units.slice(start, boundary).map((u) => u.text).join(''));
      start = boundary;
    }
    syllables.push(units.slice(start).map((u) => u.text).join(''));
    return syllables;
  }

  function tokenize(text) {
    const tokens = [];
    const re = /(\p{L}+)|(\s+)|([^\p{L}\s]+)/gu;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m[1]) tokens.push({ type: 'word', text: m[1] });
      else if (m[2]) tokens.push({ type: 'space', text: m[2] });
      else tokens.push({ type: 'other', text: m[3] });
    }
    return tokens;
  }

  function isJoinable(word, options) {
    const lower = word.toLowerCase();
    if (NON_SYLLABIC_PREPOSITIONS.includes(lower)) return true;
    return options.joinSingleLetterVowels && SINGLE_LETTER_VOWEL_WORDS.includes(lower);
  }

  // The joined preposition must be followed by something it can belong to: a word, number or opening quote/bracket.
  function canFollowPreposition(token) {
    if (!token) return false;
    return token.type === 'word' || /^[\p{N}"„“‚'«»(\[]/u.test(token.text);
  }

  /**
   * Syllabifies text and returns parts: { text, kind } where kind is
   * 'text', 'separator' (between syllables) or 'joiner' (preposition + word).
   */
  function syllabifyParts(input, opts) {
    const options = Object.assign({}, DEFAULTS, opts);
    const tokens = tokenize(input.normalize('NFC'));
    const parts = [];

    tokens.forEach((token, i) => {
      if (token.type === 'word') {
        syllabifyWord(token.text).forEach((syllable, s) => {
          if (s > 0) parts.push({ text: options.separator, kind: 'separator' });
          parts.push({ text: syllable, kind: 'text' });
        });
        return;
      }
      const prev = tokens[i - 1];
      const joins =
        token.type === 'space' &&
        !/[\n\r]/.test(token.text) &&
        prev &&
        prev.type === 'word' &&
        isJoinable(prev.text, options) &&
        canFollowPreposition(tokens[i + 1]);
      parts.push(joins ? { text: options.joiner, kind: 'joiner' } : { text: token.text, kind: 'text' });
    });

    return parts;
  }

  function syllabify(input, opts) {
    return syllabifyParts(input, opts).map((p) => p.text).join('');
  }

  const api = { syllabify, syllabifyParts, syllabifyWord };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.Sylab = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
