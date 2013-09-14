"use strict";

var _ = require('underscore')
  , fs = require('fs')
  , path = require('path')
  , bookDataDir = path.resolve(__dirname, "..", "data", "text")
  , books = require('./books');

var words = {
  corpusWords: null,
  corpusFreqWords: null,
  corpusSortedFreqs: null,
  corpusPosMap: null,
  corpusTranslit: null,
  bookWords: {},
  bookPos: {},
  bookFreqWords: {},
  bookSortedFreqs: {},
  bookTranslit: {}
};

words.wordsForBook = function(book) {
  book = words.ensureBook(book);
  if (typeof words.bookWords[book] === "undefined") {
    var tspPath = path.resolve(bookDataDir, book + ".TSP");
    var res = words.parseTspFile(tspPath);
    words.bookWords[book] = res[0];
    words.bookPos[book] = res[1];
    words.bookTranslit[book] = res[2];
  }
  return [words.bookWords[book], words.bookPos[book], words.bookTranslit[book]];
};

words.wordFreqsForBook = function(book) {
  if (typeof words.bookFreqWords[book] === "undefined") {
    var res = words.wordsForBook(book);
    var freqs = words.wordListToFreqMap(res[0], res[1]);
    words.bookFreqWords[book] = freqs;
  }
  return [words.bookFreqWords[book], words.bookPos[book]];
};

words.wordsForCorpus = function() {
  if (words.corpusWords === null) {
    var corpusWords = [];
    var corpusPosMap = {};
    var corpusTranslit = {};
    var allBooks = _.clone(books.bookAbbrevList);
    _.each(allBooks, function(book) {
      var res = words.wordsForBook(book)
        , wordList = res[0]
        , posMap = res[1]
        , translitList = res[2];
      corpusWords = corpusWords.concat(wordList);
      _.each(translitList, function(data, word) {
        if (!_.has(corpusTranslit, word)) {
          corpusTranslit[word] = {
            lemma: data.lemma,
            occurrences: []
          };
        }
        corpusTranslit[word].occurrences = corpusTranslit[word].occurrences.concat(data.occurrences);
      });
      _.each(posMap, function(poss, word) {
        if (!_.has(corpusPosMap, word)) {
          corpusPosMap[word] = {};
        }
        _.each(poss, function(freq, pos) {
          if (!_.has(corpusPosMap[word], pos)) {
            corpusPosMap[word][pos] = freq;
          } else {
            corpusPosMap[word][pos] += freq;
          }
        });
      });
    });
    words.corpusWords = corpusWords;
    words.corpusPosMap = corpusPosMap;
    words.corpusTranslit = corpusTranslit;
  }
  return [words.corpusWords, words.corpusPosMap, words.corpusTranslit];
};

words.wordFreqsForCorpus = function() {
  if (words.corpusFreqWords === null) {
    var res = words.wordsForCorpus();
    words.corpusFreqWords = words.wordListToFreqMap(res[0]);
    words.corpusPosMap = res[1];
  }
  return [words.corpusFreqWords, words.corpusPosMap];
};

words.wordListToFreqMap = function(wordList) {
  var freqMap = {};
  _.each(wordList, function(word) {
    if (_.has(freqMap, word)) {
      freqMap[word]++;
    } else {
      freqMap[word] = 1;
    }
  });
  return freqMap;
};

words.sortedWordFreqsForBook = function(book) {
  if (typeof words.bookSortedFreqs[book] === "undefined") {
    var res = words.wordFreqsForBook(book);
    words.bookSortedFreqs[book] = words.sortWordFreqs(res[0]);
  }
  return [words.bookSortedFreqs[book], words.bookPos[book]];
};

words.sortWordFreqs = function(freqMap) {
  var cmp = function(freqObj) {
    return freqObj.freq * -1;
  };
  var freqArray = [];
  _.each(freqMap, function(freq, word) {
    freqArray.push({word: word, freq: freq});
  });
  return _.sortBy(freqArray, cmp);
};

words.sortedWordFreqsForCorpus = function() {
  if (words.corpusSortedFreqs === null) {
    var res = words.wordFreqsForCorpus();
    words.corpusSortedFreqs = words.sortWordFreqs(res[0]);
  }
  return [words.corpusSortedFreqs, words.corpusPosMap];
};

words.parseTspFile = function(filename) {
  var data = fs.readFileSync(filename);
  data = data.toString('utf8');
  var wordList = [];
  var translitList = {};
  var posMap = {};
  var wordsData = data.split("\n");
  _.each(wordsData, function(datum) {
    if (datum !== "") {
      var wordData = datum.split(" ");
      var word = wordData[6];
      var pos = wordData[5];
      var translit = wordData[3];
      var translitLemma = wordData[9];
      if (/^\d+$/.test(word)) {
        wordList.push(parseInt(word, 10));
        if (!_.has(translitList, word)) {
          translitList[word] = {};
          translitList[word].occurrences = [];
          translitList[word].lemma = translitLemma;
        }
        translitList[word].occurrences.push(translit);
        if (!_.has(posMap, word)) {
          posMap[word] = {};
        }
        if (!_.has(posMap[word], pos)) {
          posMap[word][pos] = 1;
        } else {
          posMap[word][pos]++;
        }
      } else {
        console.log(wordData);
      }
    }
  });
  return [wordList, posMap, translitList];
};

words.ensureBook = function(book) {
  if (!_.contains(books.bookAbbrevList, book)) {
    book = books.abbrevFromName(book);
  }
  return book;
};

module.exports = words;
