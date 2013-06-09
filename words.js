"use strict";

var _ = require('underscore')
  , fs = require('fs')
  , path = require('path')
  , books = require('./books');

var words = {
    corpusWords: null,
    corpusFreqWords: null,
    corpusSortedFreqs: null,
    corpusPosMap: null,
    bookWords: {},
    bookPos: {},
    bookFreqWords: {},
    bookSortedFreqs: {}
};

words.wordsForBook = function(book, cb) {
  book = words.ensureBook(book);
  if (typeof words.bookWords[book] === "undefined") {
    var tspPath = path.resolve(__dirname, "data", "text", book + ".TSP");
    words.parseTspFile(tspPath, function(err, wordList, posMap) {
      if (err) return cb(err);
      words.bookWords[book] = wordList;
      words.bookPos[book] = posMap;
      cb(null, wordList, posMap);
    });
  } else {
    cb(null, words.bookWords[book], words.bookPos[book]);
  }
};

words.wordFreqsForBook = function(book, cb) {
  if (typeof words.bookFreqWords[book] === "undefined") {
    words.wordsForBook(book, function(err, wordList, posMap) {
      if (err) return cb(err);
      var freqs = words.wordListToFreqMap(wordList, posMap);
      words.bookFreqWords[book] = freqs;
      cb(null, freqs, posMap);
    });
  } else {
    cb(null, words.bookFreqWords[book], words.bookPos[book]);
  }
};

words.wordsForCorpus = function(cb) {
  if (words.corpusWords) {
    cb(null, words.corpusWords);
  } else {
    var corpusWords = [];
    var corpusPosMap = {};
    var allBooks = _.clone(books.bookAbbrevList);
    var alreadyReturned = false;
    var getWordsForNextBook = function() {
      var nextBook = allBooks.shift();
      if (typeof nextBook !== "undefined") {
        words.wordsForBook(nextBook, function(err, wordList, posMap) {
          if (err && !alreadyReturned) {
            alreadyReturned = true;
            return cb(err);
          } else if (!err) {
            corpusWords = corpusWords.concat(wordList);
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
            getWordsForNextBook();
          }
        });
      } else {
        cb(null, corpusWords, corpusPosMap);
      }
    };
    getWordsForNextBook();
  }
};

words.wordFreqsForCorpus = function(cb) {
  if (words.corpusFreqWords === null) {
    words.wordsForCorpus(function(err, wordList, posMap) {
      if (err) return cb(err);
      words.corpusFreqWords = words.wordListToFreqMap(wordList);
      words.corpusPosMap = posMap;
      cb(null, words.corpusFreqWords, posMap);
    });
  } else {
    cb(null, words.corpusFreqWords, words.corpusPosMap);
  }
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

words.sortedWordFreqsForBook = function(book, cb) {
  if (typeof words.bookSortedFreqs[book] === "undefined") {
    words.wordFreqsForBook(book, function(err, freqMap, posMap) {
      if (err) return cb(err);
      words.bookSortedFreqs[book] = words.sortWordFreqs(freqMap);
      cb(null, words.bookSortedFreqs[book], posMap);
    });
  } else {
    cb(null, words.bookSortedFreqs[book], words.bookPos[book]);
  }
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

words.sortedWordFreqsForCorpus = function(cb) {
  if (words.corpusSortedFreqs === null) {
    words.wordFreqsForCorpus(function(err, freqMap, posMap) {
      if (err) return cb(err);
      words.corpusSortedFreqs = words.sortWordFreqs(freqMap);
      cb(null, words.corpusSortedFreqs, posMap);
    });
  } else {
    cb(null, words.corpusSortedFreqs, words.corpusPosMap);
  }
};

words.parseTspFile = function(filename, cb) {
  fs.readFile(filename, function(err, data) {
    if (err) return cb(err);
    data = data.toString('utf8');
    var wordList = [];
    var posMap = {};
    var wordsData = data.split("\n");
    _.each(wordsData, function(datum) {
      if (datum !== "") {
        var wordData = datum.split(" ");
        var word = wordData[6];
        var pos = wordData[5];
        if (/^\d+$/.test(word)) {
          wordList.push(parseInt(word, 10));
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
    cb(null, wordList, posMap);
  });
};

words.ensureBook = function(book) {
  if (!_.contains(books.bookAbbrevList, book)) {
    book = books.abbrevFromName(book);
    if (typeof book === "undefined") {
      throw new Error("Book " + book + " doesn't seem to be a valid book " +
                      "abbreviation");
    }
  }
  return book;
};

module.exports = words;
