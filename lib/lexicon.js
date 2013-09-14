"use strict";

var dictionary = require('../data/lex/strongs-greek-dictionary')
  , lex = {};

lex.convertStrongsNumber = function(num) {
  var key = "G" + num;
  return dictionary[key];
};

module.exports = lex;
