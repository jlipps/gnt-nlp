"use strict";

var fs = require('fs')
  , path = require('path')
  , vocab = require('./vocab')
  , _ = require('underscore')
  , books = require('./books');

exports.makeLexicon = function(mainDir, corpusThresh, bookThresh, onlyBook) {
  console.log("Compiling GNT-50");
  var wordFreqs = vocab.wordsByFreq({minFreq: corpusThresh});
  var gnt50 = vocab.wordFreqsToCSV(wordFreqs);
  fs.writeFileSync(path.resolve(mainDir, "gnt-"+corpusThresh+".csv"), gnt50);
  _.each(books.bookAbbrevList, function(book) {
    if (!onlyBook || onlyBook === book) {
      _.each([{minFreq: bookThresh, ending: bookThresh},
              {maxFreq: bookThresh - 1, ending: 'rest'}], function(setting) {
        var params = {maxCorpusFreq: corpusThresh - 1, minFreq: bookThresh, book: book};
        _.extend(params, setting);
        console.log("Compiling " + book + "-" + setting.ending);
        var wf = vocab.wordsByFreq(params);
        var csv = vocab.wordFreqsToCSV(wf);
        fs.writeFileSync(path.resolve(mainDir, book + "-"+setting.ending+".csv"), csv);
      });
    }
  });
};
