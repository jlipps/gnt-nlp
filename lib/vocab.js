"use strict";

var _ = require('underscore')
  , lex = require('./lexicon')
  , fs = require('fs')
  , words = require('./words');

exports.wordsByFreq = function(params) {
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
    sortFn = function() {
      var corpusRes = words.wordFreqsForCorpus()
        , freqMap = corpusRes[0]
        , bookPosMap = corpusRes[1];
      var bookRes = words.sortedWordFreqsForBook(book)
        , freqs = bookRes[0];
      for (var i = 0; i < freqs.length; i++) {
        freqs[i].corpusFreq = freqMap[freqs[i].word];
      }
      return [freqs, bookPosMap];
    };
    includeCorpusFreq = true;
  } else {
    sortFn = words.sortedWordFreqsForCorpus;
  }
  var sortRes = sortFn()
    , freqs = sortRes[0]
    , posMap = sortRes[1];
  var returnFreqs = [];
  if (typeof from === "number") {
    freqs = freqs.slice(from);
  }
  if (limit) {
    freqs = freqs.slice(0, limit);
  }
  for (var i = 0; i < freqs.length; i++) {
    var strongsData = lex.convertStrongsNumber(freqs[i].word);
    var wordFreq = _.extend(freqs[i], strongsData);
    wordFreq.pos = exports.getPosData(posMap[freqs[i].word]);
    var hasCorpusFreq = typeof freqs[i].corpusFreq !== "undefined";
    var minCFSet = typeof minCorpusFreq === "number";
    var maxCFSet = typeof maxCorpusFreq === "number";
    if (typeof minFreq === "number" && freqs[i].freq < minFreq) {
      continue;
    }
    if (typeof maxFreq === "number" && freqs[i].freq > maxFreq) {
      continue;
    }
    if (hasCorpusFreq && minCFSet && freqs[i].corpusFreq < minCorpusFreq) {
      continue;
    }
    if (hasCorpusFreq && maxCFSet && freqs[i].corpusFreq > maxCorpusFreq) {
      continue;
    }
    returnFreqs.push(wordFreq);
  }
  return returnFreqs;
};

exports.getPosData = function(wordPos) {
  var data = {
    common: null
    , pos: null
    , gender: null
    , freq: wordPos
  };
  var maxFreq = 0;
  _.each(wordPos, function(freq, pos) {
    if (freq > maxFreq) {
      maxFreq = freq;
      data.common = pos;
    }
  });
  var parts = data.common.split("-");
  data.pos = parts[0];
  if (data.pos === 'N') {
    data.gender = parts[1][2];
  }
  return data;
};

exports.wordFreqsData = function(wordFreqs) {
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

exports.wordFreqsToCSV = function(wordFreqs, delimiter) {
  if (typeof delimiter === "undefined") {
    delimiter = ",";
  }
  var csvOut = "front" + delimiter + "back\n";
  _.each(wordFreqs, function(wordFreq) {
    var def = wordFreq.strongs_def || wordFreq.kjv_def || wordFreq.derivation || "(none)";
    var word = wordFreq.lemma.trim();
    if (_.contains(["M", "N", "F"], wordFreq.pos.gender)) {
      word += ", ";
      if (wordFreq.pos.gender === "M") {
        word += "ὁ";
      } else if (wordFreq.pos.gender === "N") {
        word += "το";
      } else if (wordFreq.pos.gender === "F") {
        word += "ἡ";
      }
    }
    if (delimiter === ",") {
      word = '"' + word + '"';
      csvOut += word.replace(/"/g, '\"') + ",\"(" + wordFreq.pos.pos + ") " +
                def.replace(/"/g, '\"').trim() + "\"\n";
    } else {
      csvOut += word + delimiter + "(" + wordFreq.pos.pos + ") " + def.trim() + "\n";
    }
  });
  return csvOut;
};

if (require.main === module) {


  var wordFreqs = exports.wordsByFreq({minFreq: 51});
  console.log(wordFreqs);
  console.log(exports.wordFreqsData(wordFreqs));
  //var gnt50 = exports.wordFreqsToCSV(wordFreqs);
  //fs.writeFileSync("/Users/jlipps/Desktop/gnt-50.csv", gnt50);
  //var bookWordFreqs = exports.wordsByFreq({maxCorpusFreq: 50, minFreq: 5});
  //var limit = 100;
  //for (var i = 0; i < 5; i++) {
    //var from = limit * i;
    //var params = {limit: limit, from: from};
    //wordFreqs = exports.wordsByFreq(params);
    //console.log(exports.wordFreqsData(wordFreqs));
    //if (i === 4) {
      //console.log(wordFreqs);
    //}
  //}
}
