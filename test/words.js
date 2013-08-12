"use strict";

var words = require('../words')
  , _ = require('underscore')
  , lex = require('../lexicon');

module.exports = function(cb) {
  words.wordsForCorpus(function(err, a, b, translit) {
    var testWords = [];
    _.each(translit, function(data, word) {
      var wordSet = [];
      wordSet[0] = data.lemma;
      wordSet[1] = lex.convertStrongsNumber(word).lemma;
      testWords.push(wordSet);
    });
    cb(testWords);
  });
};

