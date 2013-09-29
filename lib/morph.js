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
    parsed.number = numbers[stem[1]];
    parsed.gender = genders[stem[2]];
  }
  return parsed;
};

var parsePronoun = function(pnParts) {
  var parsed = {
    case: null
    , number: null
    , gender: null
    , person: null
  };
  pnParts = pnParts[0].split("");
  if (_.contains(_.keys(persons), pnParts[0])) {
    parsed.person = persons[pnParts[0]];
    pnParts = pnParts.slice(1);
  }
  parsed.case = cases[pnParts[0]];
  parsed.number = numbers[pnParts[1]];
  if (typeof pnParts[2] !== "undefined") {
    parsed.gender = genders[pnParts[2]];
  }
  return parsed;
};

var parsePossPronoun = function(pnParts) {
  pnParts = pnParts[0].split("");
  return {
    possessorPerson: persons[pnParts[0]]
    , possessorNumber: numbers[pnParts[1]]
    , possessedCase: cases[pnParts[2]]
    , possessedNumber: numbers[pnParts[3]]
    , possessedGender: genders[pnParts[4]]
  };
};

var parseVerb = function(verbParts) {
  var parsed = {
    tense: null
    , voice: null
    , mood: null
    , person: null
    , number: null
    , case: null
    , gender: null
  };
  var firstSeg = verbParts[0];
  var secondSeg = verbParts[1];
  var extraSeg = verbParts[2];
  // tenses can be 2 chars
  var possTense = firstSeg.slice(0, 2);
  var mood;
  if (!_.contains(_.keys(tenses), possTense)) {
    possTense = firstSeg[0];
  }
  parsed.tense = tenses[possTense];
  parsed.voice = voices[firstSeg[possTense.length]];
  mood = firstSeg[possTense.length + 1];
  parsed.mood = moods[mood];
  if (_.contains(["I", "S", "O", "M"], mood)) {
    parsed.person = persons[secondSeg[0]];
    parsed.number = numbers[secondSeg[1]];
  } else if (_.contains(["P", "R"], mood)) {
    parsed.case = cases[secondSeg[0]];
    parsed.number = numbers[secondSeg[1]];
    parsed.gender = genders[secondSeg[2]];
  } else if (mood === "N") {
  } else {
    throw new Error("Invalid mood " + mood);
  }
  if (mood !== "N" && typeof extraSeg !== "undefined") {
    parsed.extra = verbExtras[extraSeg];
  }
  return parsed;
};

var parseSuffix = function(suffix) {
  return {
    extra: suffixes[suffix]
  };
};

exports.parseMorph = function(morphString) {
  var parts = morphString.split("-");
  var pos = parts[0];
  var suffix = null;
  if (parts.length > 1 && _.contains(_.keys(suffixes), parts[parts.length - 1])) {
    suffix = parts[parts.length - 1];
    parts = parts.slice(0, parts.length - 1);
  }
  var parsed = {
    pos: partsOfSpeech[pos]
  };
  var parseFn;
  if (_.contains(declinablePos, pos)) {
    if (_.contains(caseNumGenPos, pos)) {
      parseFn = parseCNG;
    } else if (_.contains(pronominalPos, pos) ||
               morphString === "S-2APN" ||
               morphString === "S-2GSF") {
      parseFn = parsePronoun;
    } else if (_.contains(possessivePos, pos)) {
      parseFn = parsePossPronoun;
    } else if (pos === 'V') {
      parseFn = parseVerb;
    } else {
      throw new Error("Pos " + pos + " is unknown");
    }
    try {
      parsed = _.extend(parsed, parseFn(parts.slice(1)));
    } catch (e) {
      console.log("Invalid morph string: " + morphString);
    }
  }
  if (suffix) {
    parsed = _.extend(parsed, parseSuffix(suffix));
  }
  // sanity check
  _.each(parsed, function(v, k) {
    if (typeof parsed[k] === "undefined") {
      console.log("Key " + k + " is undefined in: " + morphString);
    }
  });
  return parsed;
};
