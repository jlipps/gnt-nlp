"use strict";

var _ = require('underscore');

var abbrevToName = {
  '1CO': '1 Corinthians'
  , '1JO': '1 John'
  , '1PE': '1 Peter'
  , '1TH': '1 Thessalonians'
  , '1TI': '1 Timothy'
  , '2CO': '2 Corinthians'
  , '2JO': '2 John'
  , '2PE': '2 Peter'
  , '2TH': '2 Thessalonians'
  , '2TI': '2 Timothy'
  , '3JO': '3 John'
  , AC: 'Acts'
  , COL: 'Colossians'
  , EPH: 'Ephesians'
  , GA: 'Galatians'
  , HEB: 'Hebrews'
  , JAS: 'James'
  , JOH: 'John'
  , JUDE: 'Jude'
  , LU: 'Luke'
  , MR: 'Mark'
  , MT: 'Matthew'
  , PHM: 'Philemon'
  , PHP: 'Philippians'
  , RE: 'Revelations'
  , RO: 'Romans'
  , TIT: 'Titus'
};

var nameToAbbrev = {};
_.each(abbrevToName, function(name, abbrev) {
  nameToAbbrev[name] = abbrev;
});

module.exports.bookAbbrevList = ['MT', 'MR', 'LU', 'JOH', 'AC', 'RO', '1CO',
  '2CO', 'GA', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM',
  'HEB', 'JAS', '1PE', '2PE', '1JO', '2JO', '3JO', 'JUDE', 'RE'];

module.exports.nameFromAbbrev = function(abbrev) {
  return abbrevToName[abbrev];
};

module.exports.abbrevFromName = function(name) {
  return nameToAbbrev[name];
};

