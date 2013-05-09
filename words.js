"use strict";

var _ = require('underscore')
  , fs = require('fs')
  , path = require('path')
  , books = require('./books');

var words = {
    corpusWords: null,
    corpusFreqWords: null,
    corpusSortedFreqs: null,
    bookWords: {},
    bookFreqWords: {},
    bookSortedFreqs: {}
};

words.wordsForBook = function(book, cb) {
  if (!_.contains(books.bookAbbrevList, book)) {
    book = books.abbrevFromName(book);
    if (typeof book === "undefined") {
      throw new Error("Book " + book + " doesn't seem to be a valid book " +
                      "abbreviation");
    }
  }
  if (typeof words.bookWords[book] === "undefined") {
    var tspPath = path.resolve(__dirname, "data", "text", book + ".TSP");
    words.parseTspFile(tspPath, function(err, wordList) {
      if (err) return cb(err);
      words.bookWords[book] = wordList;
      cb(null, wordList);
    });
  } else {
    cb(null, words.bookWords[book]);
  }
};

words.wordFreqsForBook = function(book, cb) {
  if (typeof words.bookFreqWords[book] === "undefined") {
    words.wordsForBook(book, function(err, wordList) {
      if (err) return cb(err);
      var freqs = words.wordListToFreqMap(wordList);
      words.bookFreqWords[book] = freqs;
      cb(null, freqs);
    });
  } else {
    cb(null, words.bookFreqWords[book]);
  }
};

words.wordsForCorpus = function(cb) {
  if (words.corpusWords) {
    cb(null, words.corpusWords);
  } else {
    var corpusWords = [];
    var allBooks = _.clone(books.bookAbbrevList);
    var alreadyReturned = false;
    var getWordsForNextBook = function() {
      var nextBook = allBooks.shift();
      if (typeof nextBook !== "undefined") {
        words.wordsForBook(nextBook, function(err, wordList) {
          if (err && !alreadyReturned) {
            alreadyReturned = true;
            return cb(err);
          } else if (!err) {
            corpusWords = corpusWords.concat(wordList);
            getWordsForNextBook();
          }
        });
      } else {
        cb(null, corpusWords);
      }
    };
    getWordsForNextBook();
  }
};

words.wordFreqsForCorpus = function(cb) {
  if (words.corpusFreqWords === null) {
    words.wordsForCorpus(function(err, wordList) {
      if (err) return cb(err);
      words.corpusFreqWords = words.wordListToFreqMap(wordList);
      cb(null, words.corpusFreqWords);
    });
  } else {
    cb(null, words.corpusFreqWords);
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
    words.wordFreqsForBook(book, function(err, freqMap) {
      if (err) return cb(err);
      words.bookSortedFreqs[book] = words.sortWordFreqs(freqMap);
      cb(null, words.bookSortedFreqs[book]);
    });
  } else {
    cb(null, words.bookSortedFreqs[book]);
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
    words.wordFreqsForCorpus(function(err, freqMap) {
      if (err) return cb(err);
      words.corpusSortedFreqs = words.sortWordFreqs(freqMap);
      cb(null, words.corpusSortedFreqs);
    });
  } else {
    cb(null, words.corpusSortedFreqs);
  }
};

words.parseTspFile = function(filename, cb) {
  fs.readFile(filename, function(err, data) {
    if (err) return cb(err);
    data = data.toString('utf8');
    var wordList = [];
    var wordsData = data.split("\n");
    _.each(wordsData, function(word) {
      if (word !== "") {
        var wordData = word.split(" ");
        if (/^\d+$/.test(wordData[6])) {
          wordList.push(parseInt(wordData[6], 10));
        } else {
          console.log(wordData);
        }
      }
    });
    cb(null, wordList);
  });
};

module.exports = words;
