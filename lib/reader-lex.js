"use strict";

var fs = require('fs')
  , path = require('path')
  , vocab = require('./vocab')
  , _ = require('underscore')
  , books = require('./books');

exports.makeLexicon = function(mainDir, corpusThresh, bookThresh, onlyBook, delimiter) {
  console.log(delimiter);
  console.log("Compiling GNT-" + corpusThresh);
  var wordFreqs = vocab.wordsByFreq({minFreq: corpusThresh});
  var gntThresh = vocab.wordFreqsToCSV(wordFreqs, delimiter);
  fs.writeFileSync(path.resolve(mainDir, "gnt-"+corpusThresh+".csv"), gntThresh);
  _.each(books.bookAbbrevList, function(book) {
    if (!onlyBook || onlyBook === book) {
      _.each([{minFreq: bookThresh, ending: bookThresh},
              {maxFreq: bookThresh - 1, ending: 'rest'}], function(setting) {
        var params = {maxCorpusFreq: corpusThresh - 1, minFreq: bookThresh, book: book};
        _.extend(params, setting);
        console.log("Compiling " + book + "-" + setting.ending);
        var wf = vocab.wordsByFreq(params);
        var csv = vocab.wordFreqsToCSV(wf, delimiter);
        fs.writeFileSync(path.resolve(mainDir, book + "-"+setting.ending+".csv"), csv);
      });
    }
  });
};
