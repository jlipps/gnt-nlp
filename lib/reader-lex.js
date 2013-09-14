"use strict";

var fs = require('fs')
  , path = require('path')
  , vocab = require('./vocab')
  , _ = require('underscore')
  , async = require('async')
  , books = require('./books');

exports.makeLexicon = function(mainDir, corpusThresh, bookThresh, onlyBook) {
  var writeFns = [];
  writeFns.push(function(cb) {
    console.log("Compiling GNT-50");
    vocab.wordsByFreq({minFreq: corpusThresh}, function(err, wordFreqs) {
      if (err) return cb(err);
      var gnt50 = vocab.wordFreqsToCSV(wordFreqs);
      fs.writeFileSync(path.resolve(mainDir, "gnt-"+corpusThresh+".csv"), gnt50);
      cb();
    });
  });
  _.each(books.bookAbbrevList, function(book) {
    if (!onlyBook || onlyBook === book) {
      _.each([{minFreq: bookThresh, ending: bookThresh},
              {maxFreq: bookThresh - 1, ending: 'rest'}], function(setting) {
        writeFns.push(function(cb) {
          var params = {maxCorpusFreq: corpusThresh - 1, minFreq: bookThresh, book: book};
          _.extend(params, setting);
          console.log("Compiling " + book + "-" + setting.ending);
          vocab.wordsByFreq(params, function(err, wf) {
            if (err) return cb(err);
            var csv = vocab.wordFreqsToCSV(wf);
            fs.writeFileSync(path.resolve(mainDir, book + "-"+setting.ending+".csv"), csv);
            cb();
          });
        });
      });
    }
  });
  async.series(writeFns, function(err) {
    if (err) {
      console.error("Something went wrong!");
      console.log(err);
    } else {
      console.log("done");
    }
  });
};
