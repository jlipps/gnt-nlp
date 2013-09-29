"use strict";

var path = require('path')
  , _ = require('underscore')
  , fs = require('fs')
  , books = require('./books').bookAbbrevList
  , tspDir = path.resolve(__dirname, "..", "data", "text")
  , jsonDir = path.resolve(__dirname, "..", "data", "text");

var startTypes = [];

var getWordDataFromLine = function(word, book) {
  word = word.split(" ");
  var tspBook = word[0]
    , locInfo = word[1].split(":")
    , chapter = locInfo[0]
    , verseInfo = locInfo[1].split(".")
    , verse = verseInfo[0]
    , startType = word[2];
  if (tspBook !== book) {
    throw new Error("Trying to collate " + book + " but text says " +
                    "we're in " + tspBook);
  }
  var wordStruct = {
    k: word[3]
    , q: word[4]
    , m: word[5]
    , s: word[6]
    , lK: word[7]
    , lQ: word[9]
  };
  if (startType === "P") {
    wordStruct.p = true;
  }
  return [chapter, verse, wordStruct];
};

exports.convertTspToJson = function() {
  var ntJson = {};
  _.each(books, function(book) {
    var tspPath = path.resolve(tspDir, book + '.txt');
    var jsonPath = path.resolve(jsonDir, book + '.json');
    var bookJson = {};
    var tspData = fs.readFileSync(tspPath);
    var words = tspData.toString('utf8').split("\n");
    _.each(words, function(word) {
      word = word.trim();
      if (word !== "") {
        var res = getWordDataFromLine(word, book)
          , chapter = res[0]
          , verse = res[1]
          , wordStruct = res[2];
        if (!_.contains(_.keys(bookJson), chapter)) {
          bookJson[chapter] = {};
        }
        if (!_.contains(_.keys(bookJson[chapter]), verse)) {
          bookJson[chapter][verse] = [];
        }
        bookJson[chapter][verse].push(wordStruct);
      }
    });
    fs.writeFileSync(jsonPath, JSON.stringify(bookJson));
    ntJson[book] = bookJson;
  });
  return ntJson;
};

if (require.main === module) {
  exports.convertTspToJson();
  console.log(startTypes);
}
