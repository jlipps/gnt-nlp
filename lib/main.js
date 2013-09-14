"use strict";

var books = require('./books')
  , glyphs = require('./glyphs')
  , lexicon = require('./lexicon')
  , reader = require('./reader')
  , readerLex = require('./reader-lex')
  , vocab = require('./vocab')
  , words = require('./words');

module.exports = {
    books: books
  , glyphs: {
      parseWord: glyphs.parseWord
    }
  , lexicon: lexicon
  , readerLexicon: readerLex
  , reader: reader
  , vocab: vocab
  , words: words
};
