// Run with Node:            node test/syllabify.test.js
// or macOS JavaScriptCore:  /System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc test/syllabify.test.js
// (both from the project root)

const Sylab =
  typeof require === 'function' ? require('../syllabify.js') : (load('syllabify.js'), globalThis.Sylab);
const log = typeof console !== 'undefined' ? console.log : print;

const cases = [
  // basic
  ['máma', 'má-ma'],
  ['kolo', 'ko-lo'],
  ['pes', 'pes'],
  ['matka', 'mat-ka'],
  ['okno', 'ok-no'],
  ['pejsek', 'pej-sek'],
  ['písnička', 'pís-nič-ka'],
  ['kostka', 'kost-ka'],
  ['malinká', 'ma-lin-ká'],
  // stop + liquid onset
  ['sestra', 'ses-tra'],
  ['dobrý', 'do-brý'],
  ['řekla', 'ře-kla'],
  ['Ostrava', 'Os-tra-va'],
  ['odvrátit', 'od-vrá-tit'],
  ['sestřička', 'ses-třič-ka'],
  ['myslet', 'mys-let'],
  ['zmrzlina', 'zmrz-li-na'],
  ['česká', 'čes-ká'],
  ['lidský', 'lid-ský'],
  ['ženský', 'žen-ský'],
  ['ďábelské', 'ďá-bel-ské'],
  ['městský', 'měst-ský'],
  ['jestli', 'jes-tli'],
  // ch
  ['chata', 'cha-ta'],
  ['moucha', 'mou-cha'],
  ['Chrudim', 'Chru-dim'],
  // syllabic r, l, m
  ['vlk', 'vlk'],
  ['krk', 'krk'],
  ['čtvrtek', 'čtvr-tek'],
  ['Brno', 'Br-no'],
  ['Vltava', 'Vl-ta-va'],
  ['Petr', 'Pe-tr'],
  ['jablko', 'ja-bl-ko'],
  ['srdce', 'srd-ce'],
  ['hrdlo', 'hr-dlo'],
  ['sedm', 'se-dm'],
  ['film', 'film'],
  ['Karel', 'Ka-rel'],
  ['Orlík', 'Or-lík'],
  // diphthongs and hiatus
  ['auto', 'au-to'],
  ['euro', 'eu-ro'],
  ['pouze', 'pou-ze'],
  ['proud', 'proud'],
  ['použít', 'po-u-žít'],
  ['naučit', 'na-u-čit'],
  ['neumím', 'ne-u-mím'],
  ['neutrální', 'neu-trál-ní'],
  ['muzeum', 'mu-ze-um'],
  ['pauza', 'pau-za'],
  ['diamant', 'di-a-mant'],
  // case and punctuation
  ['MÁMA', 'MÁ-MA'],
  ['Ahoj, jak se máš?', 'A-hoj, jak se máš?'],
  ['Frýdek-Místek', 'Frý-dek-Mís-tek'],
  // non-syllabic prepositions
  ['v domě', 'v+do-mě'],
  ['V lese je s kamarádem.', 'V+le-se je s+ka-ma-rá-dem.'],
  ['k mámě a z města', 'k+má-mě a z+měs-ta'],
  ['v 5 hodin', 'v+5 ho-din'],
  ['v „Praze"', 'v+„Pra-ze"'],
  ['jdu k\nvám', 'jdu k\nvám'],
  ['vitamín v', 'vi-ta-mín v'],
  ['s. r. o.', 's. r. o.'],
  ['ve městě', 've měs-tě'],
];

const optionCases = [
  [{ joinSingleLetterVowels: true }, 'o lese a u řeky', 'o+le-se a+u+ře-ky'],
  [{ joinSingleLetterVowels: false }, 'o lese a u řeky', 'o le-se a u ře-ky'],
  [{ separator: '·' }, 'v domě', 'v+do·mě'],
];

let failed = 0;
function check(label, actual, expected) {
  if (actual !== expected) {
    failed++;
    log('FAIL ' + JSON.stringify(label) + ': expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
  }
}

cases.forEach(([input, expected]) => check(input, Sylab.syllabify(input), expected));
optionCases.forEach(([opts, input, expected]) =>
  check(input + ' ' + JSON.stringify(opts), Sylab.syllabify(input, opts), expected)
);

const total = cases.length + optionCases.length;
log((total - failed) + '/' + total + ' passed');
if (failed) {
  if (typeof process !== 'undefined') process.exitCode = 1;
  else throw new Error(failed + ' test(s) failed');
}
