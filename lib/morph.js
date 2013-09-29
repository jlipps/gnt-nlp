"use strict";

var _ = require('underscore');

var partsOfSpeech = {
  'N': 'noun',
  'A': 'adjective',
  'T': 'article',
  'V': 'verb',
  'P': 'personal pronoun',
  'R': 'relative pronoun',
  'C': 'reciprocal pronoun',
  'D': 'demonstrative pronoun',
  'K': 'correlative pronoun',
  'I': 'interrogative pronoun',
  'X': 'indefinite pronoun',
  'Q': 'correlative or interrogative pronoun',
  'F': 'reflexive pronoun',
  'S': 'possessive pronoun',
  'ADV': 'adverb',
  'CONJ': 'conjunction',
  'COND': 'cond',
  'PRT': 'particle',
  'PREP': 'preposition',
  'INJ': 'interjection',
  'ARAM': 'aramaic',
  'HEB': 'hebrew'
};

var cases = {
  'N': 'nominative',
  'V': 'vocative',
  'G': 'genitive',
  'D': 'dative',
  'A': 'accusative'
};

var indeclCases = {
  'PRI': 'proper noun indeclinable',
  'NUI': 'numeral indeclinable',
  'LI': 'letter indeclinable',
  'OI': 'noun other type indeclinable'
};

var numbers = {
  'S': 'singular',
  'P': 'plural'
};

var genders = {
  'M': 'masculine',
  'F': 'feminine',
  'N': 'neuter'
};

var persons = {
  '1': 'first person',
  '2': 'second person',
  '3': 'third person'
};

var tenses = {
  'P': 'present',
  'I': 'imperfect',
  'F': 'future',
  '2F': 'second future',
  'A': 'aorist',
  '2A': 'second aorist',
  'R': 'perfect',
  '2R': 'second perfect',
  'L': 'pluperfect',
  '2L': 'second pluperfect',
  'X': 'no tense stated'
};

var voices = {
  'A': 'active',
  'M': 'middle',
  'P': 'passive',
  'E': 'middle or passive',
  'D': 'middle deponent',
  'O': 'passive deponent',
  'N': 'middle or passive deponent',
  'Q': 'impersonal active',
  'X': 'no voice'
};

var moods = {
  'I': 'indicative',
  'S': 'subjunctive',
  'O': 'optative',
  'M': 'imperative',
  'N': 'infinitive',
  'P': 'participle',
  'R': 'imperative participle'
};

var verbExtras = {
  'M': 'middle significance',
  'C': 'contracted form',
  'T': 'transitive',
  'A': 'aeolic',
  'ATT': 'attic',
  'AP': 'apocopated form',
  'IRR': 'irregular or impure form'
};

var suffixes = {
  'S': 'superlative',
  'C': 'comparative',
  'ABB': 'abbreviated',
  'I': 'interrogative',
  'N': 'negative',
  'ATT': 'attic',
  'P': 'particle attached',
  'K': 'crasis'
};

var declinablePos = ['N', 'A', 'T', 'V', 'P', 'R', 'C', 'D', 'K', 'I',
  'X', 'Q', 'F', 'S'];

var caseNumGenPos = ['N', 'A', 'T'];

var pronominalPos = ['P', 'R', 'C', 'D', 'K', 'I', 'X', 'Q', 'F'];

var possessivePos = ['S'];

var parseCNG = function(parts) {
  var stem = parts[0];
  var suffix = parts[1];
  var parsed = {
    case: null
    , number: null
    , gender: null
    , indecl: null
  };
  if (_.contains(_.keys(indeclCases), stem)) {
    // if we have a declineable thing
    parsed.indecl = indeclCases[stem];
  } else {
    if (stem.length !== 3) {
      throw new Error("CNG stem " + stem + " should be 3 chars!");
    }
    parsed.case = cases[stem[0]];
    parsed.number = cases[stem[1]];
    parsed.gender = cases[stem[2]];
  }
  if (typeof suffix !== "undefined") {
    parsed = _.extend(parsed, parseSuffix(suffix));
  }
  return parsed;
};

var parsePronoun = function(pnParts) {
  return {};
};

var parsePossPronoun = function(pnParts) {
  return {};
};

var parseVerb = function(verbParts) {
  return {};
};

var parseSuffix = function(suffix) {
  return {
    extra: suffixes[suffix]
  };
};

exports.parseMorph = function(morphString) {
  var parts = morphString.split("-");
  var pos = parts[0];
  var parsed = {
    pos: pos
  };
  var parseFn;
  if (_.contains(declinablePos, pos)) {
    if (_.contains(caseNumGenPos, pos)) {
      parseFn = parseCNG;
    } else if (_.contains(pronominalPos, pos)) {
      parseFn = parsePronoun;
    } else if (_.contains(possessivePos, pos)) {
      parseFn = parsePossPronoun;
    } else if (pos === 'V') {
      parseFn = parseVerb;
    } else {
      throw new Error("Pos " + pos + " is unknown");
    }
    parsed = _.extend(parsed, parseFn(parts.slice(1)));
  }
  return parsed;
};
