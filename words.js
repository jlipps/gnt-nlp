"use strict";

var _ = require('underscore')
  , fs = require('fs')
  , path = require('path')
  , books = require('./books');

var words = {};

words.wordsForBook = function(book) {
  if (!_.includes(books.bookAbbrevList, book)) {
    book = books.abbrevFromName(book);
    if (typeof book === "undefined") {
      throw new Error("Book " + book + " doesn't seem to be a valid book " +
                      "abbreviation");
    }
  }
};

module.exports = words;
