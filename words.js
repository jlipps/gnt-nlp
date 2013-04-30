"use strict";

var _ = require('underscore')
  , fs = require('fs')
  , path = require('path')
  , books = require('./books');

var words = {};

words.wordsForBook = function(book, cb) {
  if (!_.contains(books.bookAbbrevList, book)) {
    book = books.abbrevFromName(book);
    if (typeof book === "undefined") {
      throw new Error("Book " + book + " doesn't seem to be a valid book " +
                      "abbreviation");
    }
  }
  var tspPath = path.resolve(__dirname, "data", "text", book + ".TSP");
  words.parseTspFile(tspPath, function(err, wordList) {
    if (err) return cb(err);
    cb(null, wordList);
  });
};

words.wordFreqsForBook = function(book, cb) {
  words.wordsForBook(book, function(err, wordList) {
    if (err) return cb(err);
    var freqMap = {};
    _.each(wordList, function(word) {
      if (_.has(freqMap, word)) {
        freqMap[word]++;
      } else {
        freqMap[word] = 1;
      }
    });
    cb(null, freqMap);
  });
};

words.sortedWordFreqsForBook = function(book, cb) {
  words.wordFreqsForBook(book, function(err, freqMap) {
    if (err) return cb(err);
    var cmp = function(freqObj) {
      return freqObj.freq * -1;
    };
    var freqArray = [];
    _.each(freqMap, function(freq, word) {
      freqArray.push({word: word, freq: freq});
    });
    cb(null, _.sortBy(freqArray, cmp));
  });
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
