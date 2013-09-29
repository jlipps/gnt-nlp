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
  corpusQere: null,
  bookWords: {},
  bookPos: {},
  bookFreqWords: {},
  bookSortedFreqs: {},
  bookQere: {}
};

words.wordsForBook = function(book) {
  book = words.ensureBook(book);
  if (typeof words.bookWords[book] === "undefined") {
    var dataPath = path.resolve(bookDataDir, book + ".json");
    var res = words.parseTspFile(dataPath);
    words.bookWords[book] = res[0];
    words.bookPos[book] = res[1];
    words.bookQere[book] = res[2];
  }
  return [words.bookWords[book], words.bookPos[book], words.bookQere[book]];
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
    var corpusQere = {};
    var allBooks = _.clone(books.bookAbbrevList);
    _.each(allBooks, function(book) {
      var res = words.wordsForBook(book)
        , wordList = res[0]
        , posMap = res[1]
        , qereList = res[2];
      corpusWords = corpusWords.concat(wordList);
      _.each(qereList, function(data, word) {
        if (!_.has(corpusQere, word)) {
          corpusQere[word] = {
            lemma: data.lemma,
            occurrences: []
          };
        }
        corpusQere[word].occurrences = corpusQere[word].occurrences.concat(data.occurrences);
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
    words.corpusQere = corpusQere;
  }
  return [words.corpusWords, words.corpusPosMap, words.corpusQere];
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
  var data = require(filename);
  var wordList = [];
  var qereList = {};
  var posMap = {};
  _.each(data, function(verses) {
    _.each(verses, function(words) {
      _.each(words, function(word) {
        wordList.push(parseInt(word.s, 10));
        if (!_.has(qereList, word.q)) {
          qereList[word.s] = {};
          qereList[word.s].occurrences = [];
          qereList[word.s].lemma = word.lQ;
        }
        qereList[word.s].occurrences.push(word.q);
        if (!_.has(posMap, word.s)) {
          posMap[word.s] = {};
        }
        if (!_.has(posMap[word.s], word.m)) {
          posMap[word.s][word.m] = 1;
        } else {
          posMap[word.s][word.m]++;
        }
      });
    });
  });
  return [wordList, posMap, qereList];
};

words.ensureBook = function(book) {
  if (!_.contains(books.bookAbbrevList, book)) {
    book = books.abbrevFromName(book);
  }
  return book;
};

module.exports = words;
