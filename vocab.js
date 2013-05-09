"use strict";

var _ = require('underscore')
  , lex = require('./lexicon')
  , words = require('./words');

var wordsByFreq = function(params, cb) {
  var limit = params.limit;
  var from = params.from;
  var minFreq = params.minFreq;
  var maxFreq = params.maxFreq;
  var minCorpusFreq = params.minCorpusFreq || null;
  var maxCorpusFreq = params.maxCorpusFreq || null;
  var book = params.book;
  var sortFn;
  var includeCorpusFreq = false;
  if (typeof book === "string") {
    sortFn = function(cb) {
      words.wordFreqsForCorpus(function(err, freqMap) {
        if (err) return cb(err);
        words.sortedWordFreqsForBook(book, function(err, freqs) {
          if (err) return cb(err);
          for (var i = 0; i < freqs.length; i++) {
            freqs[i].corpusFreq = freqMap[freqs[i].word];
          }
          cb(null, freqs);
        });
      });
    };
    includeCorpusFreq = true;
  } else {
    sortFn = words.sortedWordFreqsForCorpus;
  }
  sortFn(function(err, freqs) {
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
      var hasCorpusFreq = typeof freqs[i].corpusFreq !== "undefined";
      var minCFSet = typeof minCorpusFreq === "number";
      var maxCFSet = typeof maxCorpusFreq === "number";
      if (typeof minFreq === "number" && freqs[i].freq < minFreq) {
        break;
      }
      if (typeof maxFreq === "number" && freqs[i].freq > maxFreq) {
        break;
      }
      if (hasCorpusFreq && minCFSet && freqs[i].corpusFreq < minCorpusFreq) {
        continue;
      }
      if (hasCorpusFreq && maxCFSet && freqs[i].corpusFreq > maxCorpusFreq) {
        continue;
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
  var maxCorpusFreq = 0;
  var minCorpusFreq = 50000;
  _.each(wordFreqs, function(wordFreq) {
    if (wordFreq.freq < minFreq) {
      minFreq = wordFreq.freq;
    }
    if (wordFreq.corpusFreq !== null && wordFreq.corpusFreq < minCorpusFreq) {
      minCorpusFreq = wordFreq.corpusFreq;
    }
    if (wordFreq.freq > maxFreq) {
      maxFreq = wordFreq.freq;
    }
    if (wordFreq.corpusFreq !== null && wordFreq.corpusFreq > maxCorpusFreq) {
      maxCorpusFreq = wordFreq.corpusFreq;
    }
  });
  data.minFreq = minFreq;
  data.maxFreq = maxFreq;
  if (minCorpusFreq !== 50000) {
    data.minCorpusFreq = minCorpusFreq;
  }
  if (maxCorpusFreq !== 0) {
    data.maxCorpusFreq = maxCorpusFreq;
  }
  return data;
};

var wordFreqsToCSV = function(wordFreqs) {
  var csvOut = "front,back\n";
  _.each(wordFreqs, function(wordFreq) {
    var def = wordFreq.strongs_def || wordFreq.kjv_def || wordFreq.derivation || "(none)";
    csvOut += wordFreq.lemma.trim() + "," + def.replace(",", "\\,").trim() + "\n";
  });
  return csvOut;
};

if (require.main === module) {
  wordsByFreq({book: 'RO', minFreq: 3, maxCorpusFreq: 50}, function(err, wordFreqs) {
    console.log(wordFreqs);
    console.log(wordFreqsData(wordFreqs));
    //console.log(wordFreqsToCSV(wordFreqs));
  });
  //var limit = 100;
  //for (var i = 0; i < 10; i++) {
    //var from = limit * i;
    //var params = {limit: limit, from: from};
    //wordsByFreq('RO', params, function(err, wordFreqs) {
      //console.log(wordFreqsData(wordFreqs));
    //});
  //}
}
