const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const T = require('../timeline.js');

const root = path.join(__dirname, '..');
const texts = JSON.parse(fs.readFileSync(path.join(root, 'texts.json'), 'utf8'));

test('texts.json が検証を通る', () => {
  assert.deepEqual(T.validateTexts(texts), []);
});

test('初回の16件がそろっている', () => {
  const ids = texts.map(t => t.id).sort();
  assert.deepEqual(ids, [
    'analects', 'book-of-the-dead', 'dhammapada', 'enuma-elish', 'gilgamesh', 'hammurabi',
    'heart-sutra', 'hebrew-bible', 'iliad', 'kojiki-nihonshoki', 'laozi', 'lotus-sutra',
    'odyssey', 'pyramid-texts', 'rigveda', 'suttanipata'
  ]);
});

test('年表の先頭はピラミッド・テキスト、最後は古事記・日本書紀', () => {
  const sorted = T.sortTexts(texts);
  assert.equal(sorted[0].id, 'pyramid-texts');
  assert.equal(sorted[sorted.length - 1].id, 'kojiki-nihonshoki');
});

test('article に書かれた記事ファイルが実在する', () => {
  for (const t of texts.filter(t => t.article)) {
    assert.ok(fs.existsSync(path.join(root, t.article)), t.article + ' がありません');
  }
});
