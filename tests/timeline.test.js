const test = require('node:test');
const assert = require('node:assert/strict');
const T = require('../timeline.js');

const t = (id, yearFrom, yearTo, region, genres) =>
  ({ id, yearFrom, yearTo, region, genres });

test('sortTexts: yearFrom → yearTo → id の順に並べ、元の配列は変えない', () => {
  const input = [t('c', -300, -100, 'india', ['religion']),
                 t('b', -300, -100, 'india', ['religion']),
                 t('a', -2400, -2300, 'egypt', ['religion']),
                 t('d', -300, -200, 'india', ['religion'])];
  const out = T.sortTexts(input);
  assert.deepEqual(out.map(x => x.id), ['a', 'd', 'b', 'c']);
  assert.equal(input[0].id, 'c');
});

test('filterTexts: 軸の中は OR、軸の間は AND、空の軸は全件', () => {
  const texts = [t('eg', -2400, -2300, 'egypt', ['religion']),
                 t('me', -2100, -1200, 'mesopotamia', ['myth']),
                 t('jp', 712, 720, 'japan', ['myth', 'history'])];
  assert.equal(T.filterTexts(texts, [], []).length, 3);
  assert.deepEqual(T.filterTexts(texts, ['egypt', 'japan'], []).map(x => x.id), ['eg', 'jp']);
  assert.deepEqual(T.filterTexts(texts, [], ['history']).map(x => x.id), ['jp']);
  assert.deepEqual(T.filterTexts(texts, ['mesopotamia', 'japan'], ['myth']).map(x => x.id), ['me', 'jp']);
  assert.deepEqual(T.filterTexts(texts, ['egypt'], ['myth']), []);
});

test('withTicks: 各文献の前に、その yearFrom 以下でまだ出していない目盛りを入れる', () => {
  const sorted = [t('a', -2400, -2300, 'egypt', ['religion']),
                  t('b', -2100, -1200, 'mesopotamia', ['myth']),
                  t('c', -1754, -1754, 'mesopotamia', ['law']),
                  t('d', 712, 720, 'japan', ['history'])];
  const out = T.withTicks(sorted).map(x => x.type === 'tick' ? x.year : x.text.id);
  assert.deepEqual(out, [-2500, 'a', 'b', -2000, 'c', -1500, -1000, -500, 0, 500, 'd']);
});

test('withTicks: 空の配列には何も返さない', () => {
  assert.deepEqual(T.withTicks([]), []);
});

test('formatYear', () => {
  assert.equal(T.formatYear(-2500), '前2500');
  assert.equal(T.formatYear(0), '紀元');
  assert.equal(T.formatYear(500), '後500');
});

test('spanPercent: 全範囲 -2500〜1000 に対する位置と幅', () => {
  assert.deepEqual(T.spanPercent({ yearFrom: -2500, yearTo: 1000 }), { left: 0, width: 100 });
  const s = T.spanPercent({ yearFrom: -750, yearTo: -750 });
  assert.equal(s.left, 50);
  assert.equal(s.width, 0.6);
});

const valid = () => ({
  id: 'gilgamesh', title: 'ギルガメシュ叙事詩', titleOriginal: '', yearFrom: -2100, yearTo: -1200,
  dateLabel: '前2100〜前1200年ごろ', region: 'mesopotamia', genres: ['myth'],
  language: 'アッカド語', medium: '粘土板', summary: '概要', quote: '一節',
  article: 'texts/gilgamesh.html'
});

test('validateTexts: 正しいデータはエラーなし', () => {
  assert.deepEqual(T.validateTexts([valid()]), []);
  assert.deepEqual(T.validateTexts([{ ...valid(), article: '' }]), []);
});

test('validateTexts: 不正な値を検出する', () => {
  assert.ok(T.validateTexts({}).length > 0, '配列でない');
  const cases = [
    { id: 'Bad_ID' }, { title: '' }, { yearFrom: -1000.5 }, { yearFrom: 0, yearTo: -10 },
    { region: 'rome' }, { genres: [] }, { genres: ['poetry'] }, { summary: '' },
    { article: 'texts/other.html' }
  ];
  for (const c of cases) {
    const errs = T.validateTexts([{ ...valid(), ...c }]);
    assert.ok(errs.length > 0, JSON.stringify(c) + ' を検出できていない');
  }
  assert.ok(T.validateTexts([valid(), valid()]).some(e => e.includes('重複')));
});
