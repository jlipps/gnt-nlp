/* global describe:true, it:true, before:true */
"use strict";

var glyphs = require('../glyphs')
  , getTestWords = require('./words')
  , _ = require('underscore')
  , should = require('should');

var deepUnicodeEqs = {
  '941': 8051
  , '987': 962
  , '972': 8057
};

function getUnicodeChars(word) {
  var list = [];
  _.each(word.split(""), function(c) {
    var code = c.charCodeAt().toString();
    if (_.has(deepUnicodeEqs, code)) {
      list.push(deepUnicodeEqs[code]);
    } else {
      list.push(c.charCodeAt());
    }
  });
  return list;
}

describe('glyphs', function() {
  var testWords;
  before(function(done) {
    getTestWords(function(words) {
      testWords = words;
      done();
    });
  });
  it('', function() {
    _.each(testWords, function(wordSet) {
      describe('', function() {
        it('should transliterate ' + wordSet[0] + ' correctly', function(done) {
          var test = wordSet[0];
          var match = wordSet[1];
          var res = glyphs.parseWord(test);
          try {
            res.should.eql(match);
          } catch (e) {
            try {
              getUnicodeChars(res).should.eql(getUnicodeChars(match));
            } catch (e2) {
              console.log("Actual: " + res);
              console.log("Expected: " + match);
              setTimeout(function() {
                throw e2;
              }, 10000);
            }
          }
        });
      });
    });
  });
});
