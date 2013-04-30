"use strict";

var _ = require('underscore')
  , lex = require('./lexicon')
  , words = require('./words');

var wordsByFreq = function(book, params, cb) {
  var limit = params.limit;
  var from = params.from;
  var minFreq = params.minFreq;
  var maxFreq = params.maxFreq;
  words.sortedWordFreqsForBook(book, function(err, freqs) {
    var returnFreqs = [];
    if (err) return cb(err);
    if (typeof from === "number") {
      freqs = freqs.slice(from);
    }
    if (limit) {
      freqs = freqs.slice(0, limit);
    }
    for (var i = 0; i < freqs.length; i++) {
      var strongsData = lex.convertStrongsNumber(freqs[i].word);
      var wordFreq = _.extend(freqs[i], strongsData);
      if (typeof minFreq === "number" && freqs[i].freq < minFreq) {
        break;
      }
      if (typeof maxFreq === "number" && freqs[i].freq > maxFreq) {
        break;
      }
      returnFreqs.push(wordFreq);
    }
    cb(null, returnFreqs);
  });
};

var wordFreqsData = function(wordFreqs) {
  var data = {lemmas: wordFreqs.length};
  var maxFreq = 0;
  var minFreq = 50000;
  _.each(wordFreqs, function(wordFreq) {
    if (wordFreq.freq < minFreq) {
      minFreq = wordFreq.freq;
    }
    if (wordFreq.freq > maxFreq) {
      maxFreq = wordFreq.freq;
    }
  });
  data.minFreq = minFreq;
  data.maxFreq = maxFreq;
  return data;
};

if (require.main === module) {
  var limit = 100;
  for (var i = 0; i < 10; i++) {
    var from = limit * i;
    var params = {limit: limit, from: from};
    wordsByFreq('RO', params, function(err, wordFreqs) {
      console.log(wordFreqsData(wordFreqs));
    });
  }
}
