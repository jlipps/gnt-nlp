"use strict";

var words = require('../lib/words')
  , _ = require('underscore')
  , lex = require('../lib/lexicon');

module.exports = function() {
  var res = words.wordsForCorpus()
    , translit = res[2];
  var testWords = [];
  _.each(translit, function(data, word) {
    var wordSet = [];
    wordSet[0] = data.lemma;
    wordSet[1] = lex.convertStrongsNumber(word).lemma;
    testWords.push(wordSet);
  });
  return testWords;
};

