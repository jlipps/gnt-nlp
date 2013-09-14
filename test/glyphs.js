/* global describe:true, it:true, before:true */
"use strict";

var glyphs = require('../lib/glyphs')
  , getTestWords = require('./words')
  , _ = require('underscore')
  , should = require('should');

var deepUnicodeEqs = {
  '940': 8049 // alpha acute
  , '941': 8051 // epsilon acute?
  , '942': 8053 // eta acute
  , '943': 8055 // iota acute
  , '972': 8057 // omicron acute?
  , '973': 8059 // upsilon acute
  , '974': 8061 // omega acute
  , '987': 962
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

var testMatch = function(res, match) {
  try {
    res.should.eql(match);
  } catch (e) {
    try {
      getUnicodeChars(res).should.eql(getUnicodeChars(match));
    } catch (e2) {
      var e3 = new Error("Actual " + res + " (" +
        JSON.stringify(getUnicodeChars(res)) + ") did not match expected " +
        match + " (" + JSON.stringify(getUnicodeChars(match)) + ")");
      throw e3;
    }
  }
};

describe('glyphs', function() {
  var testWords = getTestWords();
  it('onetest', function() {
    var test = "*XRISTO/S";
    var match = "Χριστός";
    var res = glyphs.parseWord(test);
    testMatch(res, match);
  });
  _.each(testWords, function(wordSet) {
    it('should transliterate ' + wordSet[0] + ' correctly', function() {
      var test = wordSet[0];
      var match = wordSet[1];
      var res = glyphs.parseWord(test);
      testMatch(res, match);
    });
  });
});
