/* 古いほん:年表の並べ替え・絞り込み・検証(ブラウザと Node の両方で使う) */
(function (root) {
  'use strict';

  var REGIONS = ['egypt', 'mesopotamia', 'india', 'china', 'greece', 'west-asia', 'japan', 'europe'];
  var GENRES = ['religion', 'myth', 'folklore', 'law', 'thought', 'history'];
  var REGION_LABELS = {
    'egypt': 'エジプト', 'mesopotamia': 'メソポタミア', 'india': 'インド', 'china': '中国',
    'greece': 'ギリシャ', 'west-asia': '西アジア', 'japan': '日本', 'europe': 'ヨーロッパ'
  };
  var GENRE_LABELS = {
    'religion': '宗教・経典', 'myth': '神話・叙事詩', 'folklore': '説話・昔話', 'law': '法典', 'thought': '思想', 'history': '歴史'
  };
  var TICKS = [-2500, -2000, -1500, -1000, -500, 0, 500, 1000, 1500, 2000];

  function sortTexts(texts) {
    return texts.slice().sort(function (a, b) {
      return (a.yearFrom - b.yearFrom) || (a.yearTo - b.yearTo) ||
        (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    });
  }

  function filterTexts(texts, regions, genres) {
    return texts.filter(function (t) {
      var okRegion = regions.length === 0 || regions.indexOf(t.region) !== -1;
      var okGenre = genres.length === 0 || t.genres.some(function (g) {
        return genres.indexOf(g) !== -1;
      });
      return okRegion && okGenre;
    });
  }

  function withTicks(sorted) {
    var out = [];
    var i = 0;
    sorted.forEach(function (t) {
      while (i < TICKS.length && TICKS[i] <= t.yearFrom) {
        out.push({ type: 'tick', year: TICKS[i] });
        i++;
      }
      out.push({ type: 'text', text: t });
    });
    return out;
  }

  function formatYear(year) {
    if (year < 0) return '前' + (-year);
    if (year === 0) return '紀元';
    return '後' + year;
  }

  var STRING_FIELDS = ['title', 'dateLabel', 'language', 'medium', 'summary', 'quote'];

  function validateTexts(texts) {
    if (!Array.isArray(texts)) return ['データが配列ではありません'];
    var errors = [];
    var seen = {};
    texts.forEach(function (t, n) {
      var where = '[' + n + '] ' + (t && t.id ? t.id : '(idなし)') + ': ';
      if (typeof t.id !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.id)) {
        errors.push(where + 'id はケバブケースの英小文字にしてください');
      } else if (seen[t.id]) {
        errors.push(where + 'id が重複しています');
      } else {
        seen[t.id] = true;
      }
      STRING_FIELDS.forEach(function (f) {
        if (typeof t[f] !== 'string' || t[f].trim() === '') errors.push(where + f + ' が空です');
      });
      if (typeof t.titleOriginal !== 'string') errors.push(where + 'titleOriginal は文字列にしてください');
      if (!Number.isInteger(t.yearFrom) || !Number.isInteger(t.yearTo)) {
        errors.push(where + 'yearFrom / yearTo は整数にしてください');
      } else if (t.yearFrom > t.yearTo) {
        errors.push(where + 'yearFrom が yearTo より後になっています');
      }
      if (REGIONS.indexOf(t.region) === -1) errors.push(where + 'region が不正です: ' + t.region);
      if (!Array.isArray(t.genres) || t.genres.length === 0) {
        errors.push(where + 'genres が空です');
      } else {
        t.genres.forEach(function (g) {
          if (GENRES.indexOf(g) === -1) errors.push(where + 'genre が不正です: ' + g);
        });
      }
      if (t.article !== '' && t.article !== 'texts/' + t.id + '.html') {
        errors.push(where + 'article は "" か "texts/' + t.id + '.html" にしてください');
      }
    });
    return errors;
  }

  var api = {
    REGIONS: REGIONS, GENRES: GENRES, REGION_LABELS: REGION_LABELS, GENRE_LABELS: GENRE_LABELS,
    TICKS: TICKS,
    sortTexts: sortTexts, filterTexts: filterTexts, withTicks: withTicks,
    formatYear: formatYear, validateTexts: validateTexts
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Timeline = api;
})(this);
