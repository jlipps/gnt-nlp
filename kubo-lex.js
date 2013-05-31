"use strict";

var fs = require('fs')
  , path = require('path')
  , vocab = require('./vocab')
  , _ = require('underscore')
  , async = require('async')
  , books = require('./books');

if (require.main === module) {
  var mainDir = path.resolve("/Users/jlipps/Desktop/gnt-vocab");
  var writeFns = [];
  writeFns.push(function(cb) {
    console.log("Compiling GNT-50");
    vocab.wordsByFreq({minFreq: 50}, function(err, wordFreqs) {
      if (err) return cb(err);
      var gnt50 = vocab.wordFreqsToCSV(wordFreqs);
      fs.writeFileSync(path.resolve(mainDir, "gnt-50.csv"), gnt50);
      cb();
    });
  });
  _.each(books.bookAbbrevList, function(book) {
    writeFns.push(function(cb) {
      console.log("Compiling " + book + "-5");
      vocab.wordsByFreq({maxCorpusFreq: 49, minFreq: 6, book: book}, function(err, wf) {
        if (err) return cb(err);
        var csv = vocab.wordFreqsToCSV(wf);
        fs.writeFileSync(path.resolve(mainDir, book + "-5.csv"), csv);
        cb();
      });
    });
  });
  _.each(books.bookAbbrevList, function(book) {
    writeFns.push(function(cb) {
      console.log("Compiling " + book + "-rest");
      vocab.wordsByFreq({maxCorpusFreq: 49, maxFreq: 5, book: book}, function(err, wf) {
        if (err) return cb(err);
        console.log(wf);
        var csv = vocab.wordFreqsToCSV(wf);
        fs.writeFileSync(path.resolve(mainDir, book + "-rest.csv"), csv);
        cb();
      });
    });
  });
  async.series(writeFns, function(err) {
    if (err) {
      console.error("Something went wrong!");
      console.log(err);
    } else {
      console.log("done");
    }
  });
}
