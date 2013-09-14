"use strict";

var vocab = require('./vocab')
  , _ = require('underscore')
  , words = require('./words')
  , books = require('./books')
  , readerLex = require('./reader-lex');

exports.getPassage = function(book, chapters, verses) {
  if (!_.contains(books.bookAbbrevList, book)) {
    book = books.abbrevFromName(book);
  }
  console.log(words.wordsForBook(book));
};

exports.getPassageWithLexicon = function(lex, book, chapters, verses) {
};
